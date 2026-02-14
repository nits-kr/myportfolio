"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscribers/verify/${token}`,
        );
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
          // Store email in localStorage so user doesn't need to subscribe again
          if (data.data?.email) {
            localStorage.setItem("blogSubscriberEmail", data.data.email);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-900 text-white">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full text-center">
        {status === "verifying" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4 text-green-500">Success!</h1>
            <p className="mb-6">{message}</p>
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
            >
              Go to Home
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h1 className="text-2xl font-bold mb-4 text-red-500">
              Verification Failed
            </h1>
            <p className="mb-6">{message}</p>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-600 rounded-full hover:bg-gray-700 transition"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
