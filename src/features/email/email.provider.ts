import "server-only";

import type SMTPTransport from "nodemailer/lib/smtp-transport";

export type SendEmailInput = {
  from: { name: string; address: string };
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | Uint8Array;
    contentType?: string;
  }>;
};

export type SendEmailResult = {
  providerMessageId: string | null;
  accepted: boolean;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const username = process.env.SMTP_USERNAME;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !port || !username || !password) return null;
  return {
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === "true",
    username,
    password,
  };
}

export function smtpIsConfigured() {
  return getSmtpConfig() !== null;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const nodemailer = await import("nodemailer");
  const config = getSmtpConfig();
  if (!config) throw new Error("SMTP is not configured.");

  const transportOptions: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };

  const transport = nodemailer.createTransport(transportOptions);
  const from = `${input.from.name} <${input.from.address}>`;

  const info = await transport.sendMail({
    from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content),
      contentType: a.contentType,
    })),
  });

  return {
    providerMessageId: (info as { messageId?: string }).messageId ?? null,
    accepted: Array.isArray((info as { accepted?: unknown[] }).accepted) && (info as { accepted: unknown[] }).accepted.length > 0,
  };
}
