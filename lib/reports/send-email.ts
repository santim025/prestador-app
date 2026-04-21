import nodemailer from "nodemailer";

export interface SendReportEmailOptions {
  to: string;
  subject: string;
  html: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    throw new Error(
      "SMTP no configurado. Define SMTP_HOST, SMTP_USER y SMTP_PASSWORD en tu .env.local"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
}

export async function sendReportEmail(opts: SendReportEmailOptions) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `LendTrack <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: [
      {
        filename: opts.pdfFilename,
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
