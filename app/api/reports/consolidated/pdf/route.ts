import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  buildConsolidatedPDF,
  fetchConsolidatedData,
} from "@/lib/reports/consolidated-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONTH_RE = /^\d{4}-\d{2}$/;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to || !MONTH_RE.test(from) || !MONTH_RE.test(to)) {
    return NextResponse.json(
      { error: "Parámetros 'from' y 'to' requeridos en formato YYYY-MM" },
      { status: 400 }
    );
  }
  if (from > to) {
    return NextResponse.json(
      { error: "'from' no puede ser mayor que 'to'" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchConsolidatedData(session.user.id, from, to);
    const pdf = await buildConsolidatedPDF(data, session.user.email);
    const filename = `lendtrack-consolidado-${from}_a_${to}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Error generando PDF consolidado:", err);
    return NextResponse.json(
      { error: "Error generando el PDF" },
      { status: 500 }
    );
  }
}
