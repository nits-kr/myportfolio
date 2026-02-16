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
    let response = "";
    let result = { mailbox: false, message: "" };

    socket.setTimeout(10000); // 10 second timeout

    const send = (data) => {
      if (socket.writable) {
        socket.write(data + "\r\n");
      }
    };

    socket.on("data", (data) => {
      response = data.toString();
      // console.log('SMTP:', response);

      if (step === 0 && response.startsWith("220")) {
        send(`HELO ${process.env.SMTP_HELO_DOMAIN || "portfolio.com"}`);
        step++;
      } else if (step === 1 && response.startsWith("250")) {
        send(
          `MAIL FROM:<${process.env.SMTP_FROM_EMAIL || "verify@portfolio.com"}>`,
        );
        step++;
      } else if (step === 2 && response.startsWith("250")) {
        send(`RCPT TO:<${email}>`);
        step++;
      } else if (step === 3) {
        if (response.startsWith("250")) {
          result.mailbox = true;
          result.message = "Mailbox exists";
        } else if (response.startsWith("550")) {
          result.mailbox = false;
          result.message = "Mailbox does not exist";
        } else {
          result.mailbox = false;
          result.message = "Mailbox status unknown or restricted";
        }
        send("QUIT");
        socket.end();
      }
    });

    socket.on("error", (err) => {
      result.message = `SMTP Error: ${err.message}`;
      socket.destroy();
      resolve(result);
    });

    socket.on("timeout", () => {
      result.message = "SMTP Connection timeout";
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
