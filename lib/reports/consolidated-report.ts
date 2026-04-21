import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export interface ReportRow {
  clientName: string;
  paymentMonth: Date;
  paymentDate: Date | null;
  interestRate: number;
  principalAmount: number;
  interestPaid: number;
}

export interface ReportSummary {
  totalCollected: number;
  paymentsCount: number;
  uniqueClients: number;
  periodFrom: Date;
  periodTo: Date;
}

export interface ReportData {
  rows: ReportRow[];
  summary: ReportSummary;
}

function parseMonthStart(ym: string): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
}

function parseMonthEnd(ym: string): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0, 12, 0, 0));
}

export async function fetchConsolidatedData(
  userId: string,
  fromMonth: string,
  toMonth: string
): Promise<ReportData> {
  const periodFrom = parseMonthStart(fromMonth);
  const periodTo = parseMonthEnd(toMonth);

  const payments = await prisma.payment.findMany({
    where: {
      userId,
      wasPaid: true,
      paymentMonth: {
        gte: periodFrom,
        lte: periodTo,
      },
    },
    include: {
      loan: {
        select: {
          principalAmount: true,
          interestRate: true,
          client: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: [{ paymentMonth: "asc" }, { paymentDate: "asc" }],
  });

  const rows: ReportRow[] = payments.map((p) => ({
    clientName: p.loan.client.name,
    paymentMonth: p.paymentMonth,
    paymentDate: p.paymentDate,
    interestRate: Number(p.loan.interestRate),
    principalAmount: Number(p.loan.principalAmount),
    interestPaid: Number(p.interestEarned),
  }));

  const totalCollected = rows.reduce((s, r) => s + r.interestPaid, 0);
  const uniqueClients = new Set(rows.map((r) => r.clientName)).size;

  return {
    rows,
    summary: {
      totalCollected,
      paymentsCount: rows.length,
      uniqueClients,
      periodFrom,
      periodTo,
    },
  };
}

// ---------- PDF ----------

const BRAND_GREEN = "#0F6E56";
const BRAND_GREEN_SOFT = "#E8F4EF";
const TEXT_DARK = "#1A1A1A";
const TEXT_SECONDARY = "#5A5A5A";
const TEXT_TERTIARY = "#8A8A8A";
const BORDER = "#E5E5E5";
const BORDER_SOFT = "#EFEFEF";
const ROW_ALT = "#FAFAFA";

const MONTH_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const MONTH_ES_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatCOP(value: number): string {
  return `$${value.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
}

function formatMonthLong(date: Date): string {
  return `${MONTH_ES_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatMonthShort(date: Date): string {
  return `${MONTH_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatDateShort(date: Date | null): string {
  if (!date) return "-";
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

function formatGeneratedAt(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

export async function buildConsolidatedPDF(
  data: ReportData,
  _userEmail?: string | null
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 56, bottom: 64, left: 48, right: 48 },
        info: {
          Title: "LendTrack — Consolidado de Pagos",
          Author: "LendTrack",
          Subject: "Reporte de pagos consolidado",
        },
        autoFirstPage: false,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const generatedAt = formatGeneratedAt(new Date());

      // Guardia anti-reentrada: si dibujar el footer en sí mismo provocara
      // que pdfkit añada una nueva página (por estar cerca del borde), se
      // volvería a disparar pageAdded recursivamente → stack overflow.
      let drawingFooter = false;
      doc.on("pageAdded", () => {
        if (drawingFooter) return;
        drawingFooter = true;
        try {
          drawPageFooter(doc, generatedAt);
        } finally {
          drawingFooter = false;
        }
      });

      doc.addPage();

      drawHeader(doc, data.summary);
      drawSummary(doc, data.summary);
      drawTable(doc, data.rows);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Dibuja el footer en la página actual sin alterar el cursor de texto
 * (doc.x / doc.y). Se invoca vía el evento 'pageAdded', así que cada
 * página recibe su footer al ser creada, sin post-procesamiento.
 */
function drawPageFooter(doc: PDFKit.PDFDocument, generatedAt: string) {
  const savedY = doc.y;
  const savedX = doc.x;

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;
  // Posición absoluta desde el fondo de la página. Usamos un offset pequeño
  // para mantener el texto claramente dentro de la hoja (evita que pdfkit
  // considere que hay que crear una nueva página).
  const y = doc.page.height - 34;

  doc
    .moveTo(left, y - 10)
    .lineTo(right, y - 10)
    .lineWidth(0.3)
    .strokeColor(BORDER_SOFT)
    .stroke();

  doc
    .fillColor(TEXT_TERTIARY)
    .font("Helvetica")
    .fontSize(8)
    .text(`LendTrack · Generado ${generatedAt}`, left, y, {
      width,
      align: "center",
      lineBreak: false,
      ellipsis: true,
      // height fijo impide que pdfkit intente ajustar/paginar el texto.
      height: 12,
    });

  doc.x = savedX;
  doc.y = savedY;
}

/**
 * Dibuja el logo (réplica del SVG) en la posición indicada usando primitivas
 * de pdfkit. Tamaño cuadrado `size` px.
 */
function drawLogo(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  size: number
) {
  const s = size / 48; // viewBox del icon.svg es 48x48
  doc.save();
  doc
    .roundedRect(x, y, size, size, 10 * s)
    .fillColor(BRAND_GREEN)
    .fill();

  // Línea de tendencia: (10,36) -> (18,24) -> (28,28) -> (38,14)
  doc
    .moveTo(x + 10 * s, y + 36 * s)
    .lineTo(x + 18 * s, y + 24 * s)
    .lineTo(x + 28 * s, y + 28 * s)
    .lineTo(x + 38 * s, y + 14 * s)
    .lineWidth(2.6 * s)
    .lineCap("round")
    .lineJoin("round")
    .strokeColor("#FFFFFF")
    .stroke();

  // Punto final
  doc
    .circle(x + 38 * s, y + 14 * s, 3.6 * s)
    .fillColor("#FFFFFF")
    .fill();

  // Línea base sutil
  doc
    .moveTo(x + 10 * s, y + 40 * s)
    .lineTo(x + 38 * s, y + 40 * s)
    .lineWidth(1 * s)
    .strokeColor("#FFFFFF")
    .strokeOpacity(0.35)
    .stroke()
    .strokeOpacity(1);
  doc.restore();
}

function drawHeader(doc: PDFKit.PDFDocument, summary: ReportSummary) {
  const pageWidth = doc.page.width;
  const left = doc.page.margins.left;
  const right = pageWidth - doc.page.margins.right;
  const top = doc.page.margins.top;

  const logoSize = 44;
  drawLogo(doc, left, top, logoSize);

  // Marca: "LendTrack"
  doc
    .fillColor(BRAND_GREEN)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("LendTrack", left + logoSize + 12, top + 4, {
      lineBreak: false,
    });

  doc
    .fillColor(TEXT_SECONDARY)
    .font("Helvetica")
    .fontSize(10)
    .text("Consolidado de pagos", left + logoSize + 12, top + 30, {
      lineBreak: false,
    });

  // Bloque derecho: PERIODO + rango (líneas separadas, sin width arriesgado)
  doc
    .fillColor(TEXT_TERTIARY)
    .font("Helvetica")
    .fontSize(8)
    .text("PERIODO", right - 240, top + 4, {
      width: 240,
      align: "right",
      characterSpacing: 0.8,
      lineBreak: false,
    });

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `${formatMonthLong(summary.periodFrom)} — ${formatMonthLong(summary.periodTo)}`,
      right - 300,
      top + 18,
      { width: 300, align: "right", lineBreak: false }
    );

  // Línea separadora
  const lineY = top + logoSize + 16;
  doc
    .moveTo(left, lineY)
    .lineTo(right, lineY)
    .lineWidth(0.5)
    .strokeColor(BORDER)
    .stroke();

  doc.y = lineY + 20;
  doc.x = left;
}

function drawSummary(doc: PDFKit.PDFDocument, summary: ReportSummary) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;
  const boxHeight = 68;
  const y = doc.y;

  doc
    .roundedRect(left, y, width, boxHeight, 10)
    .fillColor(BRAND_GREEN_SOFT)
    .fill();

  const colWidth = width / 3;

  const stats = [
    { label: "TOTAL COBRADO", value: formatCOP(summary.totalCollected) },
    { label: "PAGOS REGISTRADOS", value: summary.paymentsCount.toString() },
    { label: "CLIENTES", value: summary.uniqueClients.toString() },
  ];

  stats.forEach((s, i) => {
    const x = left + colWidth * i;

    doc
      .fillColor(BRAND_GREEN)
      .font("Helvetica")
      .fontSize(8)
      .text(s.label, x + 18, y + 16, {
        width: colWidth - 36,
        characterSpacing: 0.8,
        lineBreak: false,
      });

    doc
      .fillColor(TEXT_DARK)
      .font("Helvetica-Bold")
      .fontSize(17)
      .text(s.value, x + 18, y + 32, {
        width: colWidth - 36,
        lineBreak: false,
      });

    // Separador vertical sutil entre columnas
    if (i > 0) {
      doc
        .moveTo(x, y + 16)
        .lineTo(x, y + boxHeight - 16)
        .lineWidth(0.4)
        .strokeColor("#D4E8DE")
        .stroke();
    }
  });

  doc.y = y + boxHeight + 28;
  doc.x = left;
}

function drawTable(doc: PDFKit.PDFDocument, rows: ReportRow[]) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;

  doc
    .fillColor(TEXT_DARK)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Detalle de pagos", left, doc.y, { lineBreak: false });

  doc.y += 18;
  doc.x = left;

  // Columnas: anchos proporcionales sumando 1.0
  // Cliente queda a la izquierda (nombres variables), el resto centrado.
  const cols = [
    { label: "Cliente", width: 0.24, align: "left" as const },
    { label: "Mes", width: 0.13, align: "center" as const },
    { label: "Pagado", width: 0.15, align: "center" as const },
    { label: "%", width: 0.08, align: "center" as const },
    { label: "Préstamo", width: 0.2, align: "center" as const },
    { label: "Interés", width: 0.2, align: "center" as const },
  ];

  const colWidths = cols.map((c) => c.width * width);
  const colLefts: number[] = [];
  {
    let acc = left;
    cols.forEach((_, i) => {
      colLefts.push(acc);
      acc += colWidths[i];
    });
  }

  const rowHeight = 26;
  const headerHeight = 28;

  const drawHeaderRow = (yStart: number) => {
    doc
      .rect(left, yStart, width, headerHeight)
      .fillColor("#F5F6F7")
      .fill();

    cols.forEach((c, i) => {
      doc
        .fillColor(TEXT_SECONDARY)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(c.label.toUpperCase(), colLefts[i] + 10, yStart + 10, {
          width: colWidths[i] - 20,
          align: c.align,
          characterSpacing: 0.4,
          lineBreak: false,
        });
    });

    // Borde inferior del header
    doc
      .moveTo(left, yStart + headerHeight)
      .lineTo(right, yStart + headerHeight)
      .lineWidth(0.6)
      .strokeColor(BORDER)
      .stroke();
  };

  // Posición absoluta: doc.text en drawHeaderRow desplaza doc.y, así que
  // lo capturamos antes y lo asignamos directo (no usar +=).
  const headerStart = doc.y;
  drawHeaderRow(headerStart);
  doc.y = headerStart + headerHeight;

  if (rows.length === 0) {
    doc
      .fillColor(TEXT_TERTIARY)
      .font("Helvetica")
      .fontSize(10)
      .text(
        "No hay pagos registrados en el periodo seleccionado.",
        left,
        doc.y + 20,
        { width, align: "center", lineBreak: false }
      );
    doc.y += 40;
    return;
  }

  rows.forEach((row, idx) => {
    // Salto de página si la fila no cabe (dejando espacio para el footer)
    const maxY = doc.page.height - doc.page.margins.bottom - 40;
    if (doc.y + rowHeight > maxY) {
      doc.addPage();
      const newHeaderStart = doc.page.margins.top;
      drawHeaderRow(newHeaderStart);
      doc.y = newHeaderStart + headerHeight;
    }

    const y = doc.y;

    if (idx % 2 === 1) {
      doc.rect(left, y, width, rowHeight).fillColor(ROW_ALT).fill();
    }

    const values = [
      row.clientName,
      formatMonthShort(row.paymentMonth),
      formatDateShort(row.paymentDate),
      `${row.interestRate}%`,
      formatCOP(row.principalAmount),
      formatCOP(row.interestPaid),
    ];

    values.forEach((v, i) => {
      const isInterest = i === 5;
      doc
        .fillColor(isInterest ? BRAND_GREEN : TEXT_DARK)
        .font(isInterest ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .text(v, colLefts[i] + 10, y + 9, {
          width: colWidths[i] - 20,
          align: cols[i].align,
          lineBreak: false,
          ellipsis: true,
        });
    });

    // Borde inferior sutil
    doc
      .moveTo(left, y + rowHeight)
      .lineTo(right, y + rowHeight)
      .lineWidth(0.3)
      .strokeColor(BORDER_SOFT)
      .stroke();

    doc.y = y + rowHeight;
  });

  // Borde inferior marcado al cerrar tabla
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(0.6)
    .strokeColor(BORDER)
    .stroke();
}

