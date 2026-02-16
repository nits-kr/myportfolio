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
    const socket = net.createConnection(25, mxHost);
    let step = 0;
    let result = { mailbox: false, message: "" };
    let buffer = "";

    socket.setTimeout(10000); // 10 second timeout

    const send = (data) => {
      if (socket.writable) {
        socket.write(data + "\r\n");
      }
    };

    socket.on("data", (data) => {
      buffer += data.toString();

      // Standard SMTP responses end with a newline. Multiline responses have a '-' after the code.
      // We wait for the final line (space after code).
      const lines = buffer.split("\r\n");
      const lastLine = lines[lines.length - 2] || ""; // The buffer might end with \r\n, so the last element is empty

      if (!lastLine || lastLine[3] === "-") return; // Wait for the full response

      const responseCode = lastLine.substring(0, 3);
      buffer = ""; // Clear buffer for next step

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
          result.mailbox = false;
          result.message = `Mailbox verification rejected (Code ${responseCode})`;
        }
        send("QUIT");
        socket.end();
      }
    });

    socket.on("error", (err) => {
      let msg = err.message || "Unknown socket error";
      if (err.code === "ECONNREFUSED")
        msg = "Connection refused (Port 25 might be blocked)";
      if (err.code === "ETIMEDOUT")
        msg = "Connection timed out (Port 25 might be blocked)";

      result.message = `SMTP Error: ${msg}`;
      socket.destroy();
      resolve(result);
    });

    socket.on("timeout", () => {
      result.message = "SMTP Connection timeout (Check if Port 25 is open)";
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
      mailbox: false,
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
  // We consider it "Valid" only if syntax, DNS and Mailbox are true
  // Disposable is a "Risky" flag but might still be valid
  result.isValid =
    result.details.syntax && result.details.dns && result.details.mailbox;

  if (result.isValid && result.details.disposable) {
    result.message = "Valid but uses a disposable provider";
  }

  return result;
};
