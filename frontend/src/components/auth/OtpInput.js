"use client";

import { useEffect, useMemo, useRef } from "react";

export default function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  disabled = false,
}) {
  const inputRefs = useRef([]);

  const digits = useMemo(() => {
    const safe = typeof value === "string" ? value : "";
    const normalized = safe.replace(/\D/g, "").slice(0, length);
    const arr = new Array(length).fill("");
    for (let i = 0; i < normalized.length; i += 1) arr[i] = normalized[i];
    return arr;
  }, [value, length]);

  useEffect(() => {
    if (!autoFocus) return;
    const idx = Math.min(digits.findIndex((d) => d === ""), length - 1);
    const focusIndex = idx === -1 ? length - 1 : idx;
    inputRefs.current[focusIndex]?.focus?.();
  }, [autoFocus, digits, length]);

  const commit = (nextDigits, focusIndex) => {
    onChange(nextDigits.join(""));
    if (typeof focusIndex === "number") {
      inputRefs.current[focusIndex]?.focus?.();
    }
  };

  const handleChange = (index, nextChar) => {
    const char = String(nextChar || "").replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;

    const nextFocus = char ? Math.min(index + 1, length - 1) : index;
    commit(nextDigits, nextFocus);
  };

  const handleKeyDown = (e, index) => {
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      const nextDigits = [...digits];
      if (nextDigits[index]) {
        nextDigits[index] = "";
        return commit(nextDigits, index);
      }
      const prev = Math.max(index - 1, 0);
      nextDigits[prev] = "";
      return commit(nextDigits, prev);
    }

    if (key === "ArrowLeft") {
      e.preventDefault();
      return inputRefs.current[Math.max(index - 1, 0)]?.focus?.();
    }

    if (key === "ArrowRight") {
      e.preventDefault();
      return inputRefs.current[Math.min(index + 1, length - 1)]?.focus?.();
    }

    if (key === " " || key === "Spacebar") {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const nextDigits = new Array(length).fill("");
    for (let i = 0; i < pasted.length; i += 1) nextDigits[i] = pasted[i];

    const focusIndex = Math.min(pasted.length, length - 1);
    commit(nextDigits, focusIndex);
  };

  return (
    <div className="d-flex gap-2 justify-content-center" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="\\d*"
          maxLength={1}
          className="form-control text-center fw-bold"
          style={{ width: 44, height: 52, fontSize: 20 }}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
}
