"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "Pro";
  const amount = searchParams.get("amount") || "0";
  const reason = searchParams.get("reason") || "Payment could not be completed.";
  const [needsSoundTap, setNeedsSoundTap] = useState(false);
  const hasAttemptedSoundRef = useRef(false);
  const hasPlayedSoundRef = useRef(false);

  const playFailureSound = useCallback(async () => {
    if (hasPlayedSoundRef.current) return true;
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return false;

      const audioContext = new AudioContextCtor();

      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
      } catch (_e) {
        // Autoplay policy may block resume without a user gesture.
      }

      if (audioContext.state !== "running") {
        try {
          await audioContext.close?.();
        } catch (_e) {
          // ignore
        }
        return false;
      }

      const now = audioContext.currentTime;
      [320, 260].forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.07, now + idx * 0.12 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.22);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.24);
      });

      window.setTimeout(() => {
        audioContext.close?.().catch(() => {});
      }, 650);

      hasPlayedSoundRef.current = true;
      return true;
    } catch (_e) {
      return false;
    }
  }, []);

  useEffect(() => {
    if (hasAttemptedSoundRef.current) return;
    hasAttemptedSoundRef.current = true;

    let isMounted = true;

    const attemptAutoPlay = async () => {
      const ok = await playFailureSound();
      if (isMounted && !ok) setNeedsSoundTap(true);
    };

    const unlockOnGesture = async () => {
      const ok = await playFailureSound();
      if (isMounted && ok) setNeedsSoundTap(false);
    };

    attemptAutoPlay();

    window.addEventListener("pointerdown", unlockOnGesture, { once: true });
    window.addEventListener("keydown", unlockOnGesture, { once: true });

    return () => {
      isMounted = false;
      window.removeEventListener("pointerdown", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
    };
  }, [playFailureSound]);

  return (
    <div className="pay-page pay-failed">
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="result-card"
      >
        <div className="chip">Payment Failed</div>
        <h1>Transaction Not Completed</h1>
        <p className="subtitle">
          No amount was captured. Please retry with another method.
        </p>
        {needsSoundTap && (
          <button
            type="button"
            className="sound-btn"
            onClick={async () => {
              const ok = await playFailureSound();
              if (ok) setNeedsSoundTap(false);
            }}
          >
            Tap to play alert sound
          </button>
        )}

        <div className="meta-grid">
          <div>
            <span>Plan</span>
            <strong>{plan}</strong>
          </div>
          <div>
            <span>Attempted Amount</span>
            <strong>Rs. {amount}</strong>
          </div>
          <div className="full">
            <span>Reason</span>
            <strong>{reason}</strong>
          </div>
        </div>

        <div className="cta-row">
          <Link href="/pricing" className="btn primary">
            Retry Payment
          </Link>
          <Link href="/contact" className="btn secondary">
            Contact Support
          </Link>
        </div>
      </motion.section>

      <style jsx>{`
        .pay-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px 16px;
          background:
            radial-gradient(circle at 20% 20%, rgba(248, 113, 113, 0.22), transparent 45%),
            radial-gradient(circle at 80% 72%, rgba(251, 146, 60, 0.18), transparent 45%),
            linear-gradient(140deg, #19030a 0%, #2b0818 48%, #1f102a 100%);
        }

        .result-card {
          width: min(840px, 100%);
          padding: 34px;
          border: 1px solid rgba(251, 146, 60, 0.25);
          border-radius: 22px;
          background: rgba(15, 3, 6, 0.74);
          box-shadow: 0 22px 58px rgba(15, 3, 6, 0.48);
          color: #fff7ed;
        }

        .chip {
          display: inline-block;
          margin-bottom: 12px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #431407;
          background: linear-gradient(90deg, #fb7185, #fdba74);
        }

        h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.1;
          letter-spacing: 0.2px;
        }

        .subtitle {
          margin: 10px 0 22px;
          color: #fecaca;
          font-size: 17px;
        }

        .sound-btn {
          margin: -10px 0 22px;
          border-radius: 999px;
          padding: 9px 14px;
          font-weight: 700;
          font-size: 12px;
          color: #ffedd5;
          border: 1px solid rgba(251, 146, 60, 0.4);
          background: rgba(35, 8, 13, 0.65);
          cursor: pointer;
          width: fit-content;
        }

        .sound-btn:hover {
          border-color: rgba(251, 146, 60, 0.65);
          background: rgba(35, 8, 13, 0.8);
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .meta-grid div {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(251, 146, 60, 0.2);
          background: rgba(35, 8, 13, 0.6);
        }

        .meta-grid .full {
          grid-column: 1 / -1;
        }

        .meta-grid span {
          display: block;
          font-size: 12px;
          color: #fdba74;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .meta-grid strong {
          font-size: 15px;
          color: #fff7ed;
          word-break: break-word;
        }

        .cta-row {
          margin-top: 22px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          border-radius: 12px;
          padding: 11px 16px;
          font-weight: 700;
          text-decoration: none;
          border: 1px solid transparent;
        }

        .btn.primary {
          color: #431407;
          background: linear-gradient(90deg, #fb923c, #fca5a5);
        }

        .btn.secondary {
          color: #ffedd5;
          border-color: rgba(251, 146, 60, 0.4);
          background: rgba(35, 8, 13, 0.65);
        }

        @media (max-width: 700px) {
          .result-card {
            padding: 22px;
            border-radius: 16px;
          }

          .meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
