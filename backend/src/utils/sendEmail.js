import nodemailer from "nodemailer";

const isTruthy = (value) => String(value || "").toLowerCase() === "true";

const sendEmail = async (options) => {
  const transportMode = process.env.EMAIL_TRANSPORT || (process.env.SMTP_HOST ? "smtp" : "console");

  const subject = options.subject || "(no subject)";
  const to = options.email;

  if (transportMode === "console") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("EMAIL_TRANSPORT=console is not allowed in production.");
    }
    // Useful in local development to avoid blocking flows on SMTP.
    // Never log OTPs in production.
    // eslint-disable-next-line no-console
    console.log("[email:console]", { to, subject });
    return;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE !== undefined ? isTruthy(process.env.SMTP_SECURE) : port === 465;

  const user = process.env.SMTP_USERNAME || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USERNAME (or SMTP_EMAIL), and SMTP_PASSWORD.",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls:
      process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== undefined
        ? { rejectUnauthorized: isTruthy(process.env.SMTP_TLS_REJECT_UNAUTHORIZED) }
        : undefined,
  });

  const message = {
    from: `${process.env.FROM_NAME || "No-Reply"} <${process.env.FROM_EMAIL || user}>`,
    to,
    subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(message);
};

export default sendEmail;
