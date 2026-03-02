"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/authSlice";

const actionLabels = {
  activated: "Plan activated successfully.",
  upgraded: "Plan upgraded successfully.",
  renewed: "Plan renewed successfully.",
  downgrade_scheduled: "Downgrade scheduled for end of current cycle.",
};

export default function PaymentSuccessPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "Pro";
  const amount = searchParams.get("amount") || "0";
  const action = searchParams.get("action") || "activated";
  const paymentId = searchParams.get("paymentId") || "";
  const [needsSoundTap, setNeedsSoundTap] = useState(false);
  const hasAttemptedSoundRef = useRef(false);
  const hasPlayedSoundRef = useRef(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, i) => ({
        id: i,
        left: `${(i * 29) % 100}%`,
        delay: `${(i % 16) * 0.12}s`,
        duration: `${3.2 + ((i * 7) % 20) / 10}s`,
        size: `${8 + ((i * 5) % 9)}px`,
        color: ["#22d3ee", "#34d399", "#facc15", "#fb7185", "#a78bfa"][i % 5],
        rotate: `${(i * 37) % 360}deg`,
      })),
    [],
  );

  const playSuccessSound = useCallback(async () => {
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
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.3);
      });

      window.setTimeout(() => {
        audioContext.close?.().catch(() => {});
      }, 900);

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
      const ok = await playSuccessSound();
      if (isMounted && !ok) setNeedsSoundTap(true);
    };

    const unlockOnGesture = async () => {
      const ok = await playSuccessSound();
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
  }, [playSuccessSound]);

  useEffect(() => {
    const syncSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/subscription`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        if (!response.ok || !data?.success || !data?.data) return;

        const stored = localStorage.getItem("user");
        if (!stored) return;

        const storedUser = JSON.parse(stored);
        const updatedUser = {
          ...storedUser,
          subscription: data.data.currentPlan ?? storedUser.subscription,
          subscriptionStatus: data.data.subscriptionStatus ?? storedUser.subscriptionStatus,
          subscriptionExpiresAt:
            data.data.subscriptionExpiresAt ?? storedUser.subscriptionExpiresAt,
          pendingSubscription: data.data.pendingSubscription ?? null,
          pendingSubscriptionValidityDays: data.data.pendingSubscriptionValidityDays ?? null,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        dispatch(setUser(updatedUser));
      } catch (_e) {
        // Ignore sync issues.
      }
    };

    syncSubscription();
  }, [dispatch]);

  return (
    <div className="pay-page pay-success">
      <div className="confetti-layer" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="confetti"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: `calc(${p.size} * 0.55)`,
              background: p.color,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="result-card"
      >
        <div className="chip">Payment Success</div>
        <h1>Transaction Confirmed</h1>
        <p className="subtitle">{actionLabels[action] || actionLabels.activated}</p>
        {needsSoundTap && (
          <button
            type="button"
            className="sound-btn"
            onClick={async () => {
              const ok = await playSuccessSound();
              if (ok) setNeedsSoundTap(false);
            }}
          >
            Tap to play success sound
          </button>
        )}

        <div className="meta-grid">
          <div>
            <span>Plan</span>
            <strong>{plan}</strong>
          </div>
          <div>
            <span>Amount</span>
            <strong>Rs. {amount}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Completed</strong>
          </div>
          <div>
            <span>Payment ID</span>
            <strong>{paymentId || "Generated"}</strong>
          </div>
        </div>

        <div className="cta-row">
          <Link href="/pricing" className="btn secondary">
            Back to Pricing
          </Link>
          <Link href="/dashboard" className="btn primary">
            Open Dashboard
          </Link>
        </div>
      </motion.section>

      <style jsx>{`
        .pay-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          padding: 32px 16px;
          background:
            radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.25), transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.2), transparent 45%),
            linear-gradient(140deg, #031220 0%, #071f3d 52%, #05273a 100%);
        }

        .confetti-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          top: -10%;
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0.95;
        }

        .result-card {
          width: min(860px, 100%);
          padding: 34px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          border-radius: 22px;
          background: rgba(2, 6, 23, 0.72);
          box-shadow: 0 24px 60px rgba(2, 6, 23, 0.45);
          backdrop-filter: blur(8px);
          color: #ecfeff;
          z-index: 2;
        }

        .chip {
          display: inline-block;
          margin-bottom: 12px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #052e16;
          background: linear-gradient(90deg, #4ade80, #bef264);
        }

        h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.1;
          letter-spacing: 0.2px;
        }

        .subtitle {
          margin: 10px 0 22px;
          color: #bfdbfe;
          font-size: 17px;
        }

        .sound-btn {
          margin: -10px 0 22px;
          border-radius: 999px;
          padding: 9px 14px;
          font-weight: 700;
          font-size: 12px;
          color: #e2e8f0;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.6);
          cursor: pointer;
          width: fit-content;
        }

        .sound-btn:hover {
          border-color: rgba(148, 163, 184, 0.6);
          background: rgba(15, 23, 42, 0.75);
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .meta-grid div {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(15, 23, 42, 0.6);
        }

        .meta-grid span {
          display: block;
          font-size: 12px;
          color: #93c5fd;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .meta-grid strong {
          font-size: 15px;
          color: #f8fafc;
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
          color: #052e16;
          background: linear-gradient(90deg, #86efac, #67e8f9);
        }

        .btn.secondary {
          color: #e2e8f0;
          border-color: rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.6);
        }

        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0.95;
          }
          85% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(22px, 115vh, 0) rotate(680deg);
            opacity: 0;
          }
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
