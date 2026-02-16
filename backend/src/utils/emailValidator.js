import dns from "dns";
import { promisify } from "util";

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
 * @param {string} email
 * @returns {boolean}
 */
const validateSyntax = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if the email domain is disposable
 * @param {string} email
 * @returns {boolean}
 */
const isDisposable = (email) => {
  const domain = email.split("@")[1];
  return DISPOSABLE_DOMAINS.has(domain);
};

/**
 * Verifies if the domain has valid MX records
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const validateDNS = async (email) => {
  try {
    const domain = email.split("@")[1];
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Comprehensive email validation
 * @param {string} email
 * @returns {Promise<{isValid: boolean, details: object}>}
 */
export const validateEmail = async (email) => {
  const result = {
    email,
    isValid: false,
    details: {
      syntax: false,
      disposable: false,
      dns: false,
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
    result.message = "Disposable email provider detected";
    return result; // Depending on requirements, might still want to check DNS
  }

  // 3. DNS Check
  const hasMxRecords = await validateDNS(email);
  if (!hasMxRecords) {
    result.message = "Domain does not have valid MX records";
    return result;
  }
  result.details.dns = true;

  result.isValid = true;
  result.message = "Email is valid";
  return result;
};
