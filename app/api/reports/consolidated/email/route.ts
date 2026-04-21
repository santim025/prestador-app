import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  buildConsolidatedPDF,
  fetchConsolidatedData,
} from "@/lib/reports/consolidated-report";
import { sendReportEmail } from "@/lib/reports/send-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatRangeLabel(fromYM: string, toYM: string) {
  const [fy, fm] = fromYM.split("-").map(Number);
  const [ty, tm] = toYM.split("-").map(Number);
  const f = new Date(Date.UTC(fy, fm - 1, 1, 12)).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const t = new Date(Date.UTC(ty, tm - 1, 1, 12)).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${f} — ${t}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { from?: string; to?: string; recipient?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { from, to, recipient } = body;

  if (!from || !to || !MONTH_RE.test(from) || !MONTH_RE.test(to)) {
    return NextResponse.json(
      { error: "'from' y 'to' requeridos en formato YYYY-MM" },
      { status: 400 }
    );
  }
  if (from > to) {
    return NextResponse.json(
      { error: "'from' no puede ser mayor que 'to'" },
      { status: 400 }
    );
  }
  if (!recipient || !EMAIL_RE.test(recipient)) {
    return NextResponse.json(
      { error: "Correo destinatario inválido" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchConsolidatedData(session.user.id, from, to);
    const pdf = await buildConsolidatedPDF(data, session.user.email);
    const filename = `lendtrack-consolidado-${from}_a_${to}.pdf`;
    const rangeLabel = formatRangeLabel(from, to);

    const totalCOP = `$${data.summary.totalCollected.toLocaleString("es-CO")}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1A1A1A; max-width:560px; margin:0 auto;">
        <div style="display:flex; align-items:center; gap:10px; padding-bottom:16px; border-bottom:1px solid #E5E5E5;">
          <div style="width:32px; height:32px; border-radius:6px; background:#0F6E56; color:white; font-weight:600; font-size:13px; display:inline-block; text-align:center; line-height:32px;">LT</div>
          <strong style="font-size:16px;">LendTrack</strong>
        </div>
        <h2 style="font-size:18px; margin:20px 0 8px;">Consolidado de pagos</h2>
        <p style="color:#5A5A5A; font-size:14px; margin:0 0 16px;">
          Adjunto encontrarás el reporte PDF del periodo <strong>${rangeLabel}</strong>.
        </p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0;">
          <tr>
            <td style="padding:10px 14px; background:#E1F5EE; border-radius:8px 0 0 8px; font-size:12px; color:#0F6E56;">TOTAL COBRADO</td>
            <td style="padding:10px 14px; background:#E1F5EE; border-radius:0 8px 8px 0; font-size:14px; text-align:right; font-weight:600;">${totalCOP}</td>
          </tr>
        </table>
        <p style="color:#5A5A5A; font-size:13px;">
          Pagos registrados: <strong>${data.summary.paymentsCount}</strong> · Clientes: <strong>${data.summary.uniqueClients}</strong>
        </p>
        <p style="color:#8A8A8A; font-size:12px; margin-top:24px;">
          Este correo fue generado automáticamente por LendTrack.
        </p>
      </div>
    `;

    await sendReportEmail({
      to: recipient,
      subject: `LendTrack · Consolidado ${rangeLabel}`,
      html,
      pdfBuffer: pdf,
      pdfFilename: filename,
    });

    return NextResponse.json({
      ok: true,
      sent: true,
      recipient,
      paymentsCount: data.summary.paymentsCount,
    });
  } catch (err: any) {
    console.error("Error enviando consolidado:", err);
    const message = err?.message || "Error enviando el correo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
