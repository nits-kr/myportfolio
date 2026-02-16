import dns from "dns";
import { promisify } from "util";
import net from "net";

const resolveMx = promisify(dns.resolveMx);

// Common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "mailinator.com",
  "yopmail.com",
  "getairmail.com",
  "throwawaymail.com",
  "tempmail.net",
  "dispostable.com",
  "fake-email.com",
  "email-fake.com",
]);

/**
 * Validates email syntax using regex
 */
const validateSyntax = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if the email domain is disposable
 */
const isDisposable = (email) => {
  const domain = email.split("@")[1];
  return DISPOSABLE_DOMAINS.has(domain);
};

/**
 * Verifies if the domain has valid MX records
 */
const getMxRecords = async (domain) => {
  try {
    const addresses = await resolveMx(domain);
    if (!addresses || addresses.length === 0) return null;
    // Sort by priority
    return addresses.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    return null;
  }
};

/**
 * Performs an SMTP handshake to verify mailbox existence
 */
const validateSMTP = (mxHost, email) => {
  return new Promise((resolve) => {
    // Standard MX servers only listen on Port 25 for incoming mail relay.
    // However, we'll allow an override if the user has a special setup.
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 25;
    const socket = net.createConnection(port, mxHost);
    let step = 0;
    let result = { mailbox: null, message: "", restricted: false };
    let buffer = "";

    socket.setTimeout(8000); // 8 second timeout

    const send = (data) => {
      if (socket.writable) {
        socket.write(data + "\r\n");
      }
    };

    socket.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\r\n");
      const lastLine = lines[lines.length - 2] || "";

      if (!lastLine || lastLine[3] === "-") return;

      const responseCode = lastLine.substring(0, 3);
      buffer = "";

      if (step === 0 && responseCode === "220") {
        send(`HELO ${process.env.SMTP_HELO_DOMAIN || "portfolio.com"}`);
        step++;
      } else if (step === 1 && responseCode === "250") {
        send(
          `MAIL FROM:<${process.env.SMTP_FROM_EMAIL || "verify@portfolio.com"}>`,
        );
        step++;
      } else if (step === 2 && responseCode === "250") {
        send(`RCPT TO:<${email}>`);
        step++;
      } else if (step === 3) {
        if (responseCode === "250") {
          result.mailbox = true;
          result.message = "Mailbox exists and is active";
        } else if (responseCode === "550") {
          result.mailbox = false;
          result.message = "Mailbox does not exist (User Unknown)";
        } else {
          result.mailbox = null;
          result.message = `Mailbox verification rejected (Code ${responseCode})`;
        }
        send("QUIT");
        socket.end();
      }
    });

    socket.on("error", (err) => {
      result.mailbox = null;
      result.restricted = true;
      let msg = err.message || "Unknown socket error";
      if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
        msg = `Port ${port} blocked or timed out (Network restriction)`;
      }
      result.message = `Deep check skipped: ${msg}`;
      socket.destroy();
      resolve(result);
    });

    socket.on("timeout", () => {
      result.mailbox = null;
      result.restricted = true;
      result.message = `Deep check timed out on port ${port} (Likely blocked)`;
      socket.destroy();
      resolve(result);
    });

    socket.on("close", () => {
      resolve(result);
    });
  });
};

/**
 * Comprehensive email validation including SMTP check
 */
export const validateEmail = async (email) => {
  const result = {
    email,
    isValid: false,
    details: {
      syntax: false,
      disposable: false,
      dns: false,
      mailbox: null, // null = unknown/skipped
    },
    message: "",
  };

  // 1. Syntax Check
  if (!validateSyntax(email)) {
    result.message = "Invalid email syntax";
    return result;
  }
  result.details.syntax = true;

  // 2. Disposable Check
  if (isDisposable(email)) {
    result.details.disposable = true;
    // We don't exit here anymore, let's keep checking
  }

  // 3. DNS Check
  const domain = email.split("@")[1];
  const mxRecords = await getMxRecords(domain);
  if (!mxRecords) {
    result.message = "Domain does not have valid MX records";
    return result;
  }
  result.details.dns = true;

  // 4. SMTP Check (Deep Check)
  const smtpResult = await validateSMTP(mxRecords[0].exchange, email);
  result.details.mailbox = smtpResult.mailbox;
  result.message = smtpResult.message;

  // Final Decision
  // If syntax and DNS pass, it's "Valid" even if the deep check is restricted
  result.isValid = result.details.syntax && result.details.dns;

  // If we know for a fact the mailbox doesn't exist, it's invalid
  if (result.details.mailbox === false) {
    result.isValid = false;
  }

  if (result.isValid && result.details.disposable) {
    result.message = "Valid but uses a disposable provider";
  }

  return result;
};
