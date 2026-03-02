"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiClock, FiX, FiCheck, FiTrendingUp } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function InterviewSessionPage({ params }) {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const sessionId = params.id;

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token || localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setSession(data.data);
      }
    } catch (error) {
      console.error("Fetch session error:", error);
    }
  }, [sessionId, user]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions/${sessionId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${user.token || localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  }, [sessionId, user]);

  const requestFeedback = useCallback(
    async (messageId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions/${sessionId}/feedback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token || localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ messageId }),
          },
        );

        const data = await response.json();
        if (!response.ok || !data.success) return;

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  feedback: {
                    score: data.data.score,
                    technicalDepth: data.data.technicalDepth,
                    clarity: data.data.clarity,
                    suggestions: [
                      ...(data.data.improvements || []),
                      ...(data.data.strengths || []),
                    ],
                  },
                }
              : msg,
          ),
        );
      } catch (error) {
        console.error("Feedback request error:", error);
      }
    },
    [sessionId, user],
  );

  // Fetch session and messages
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchSession();
    fetchMessages();

    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, user, router, fetchSession, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = inputMessage;
    setInputMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: messageContent }),
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      const { candidateMessage, interviewerMessage } = data.data;
      setMessages((prev) => [...prev, candidateMessage, interviewerMessage]);
      setRequestError(null);

      if (showFeedback && candidateMessage?._id) {
        requestFeedback(candidateMessage._id);
      }
    } catch (error) {
      console.error("Send message error:", error);
      setInputMessage(messageContent);
      setRequestError(error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleEndInterview = async () => {
    if (!confirm("Are you sure you want to end this interview?")) return;

    setIsEnding(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions/${sessionId}/end`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user.token || localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to end session");
      }
      setRequestError(null);
      router.push(`/tools/interview-simulator/summary/${sessionId}`);
    } catch (error) {
      console.error("End interview error:", error);
      setRequestError(error.message || "Failed to end session");
      setIsEnding(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!session) {
    return (
      <div className="container py-5 mt-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Loading interview session...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="glass-card p-3 mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h5 mb-1 fw-bold text-capitalize">
            {session.role === "custom" && session.customData?.title
              ? session.customData.title
              : session.role}{" "}
            Interview
          </h1>
          <span className="badge bg-primary bg-opacity-10 text-primary text-capitalize">
            {session.difficulty} Level
          </span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <FiClock />
            <span className="fw-bold">{formatTime(elapsedTime)}</span>
          </div>
          <button
            onClick={handleEndInterview}
            disabled={isEnding}
            className="btn btn-outline-danger btn-sm"
          >
            {isEnding ? "Ending..." : "End Interview"}
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Chat Area */}
        <div className={showFeedback ? "col-lg-8" : "col-12"}>
          <div
            className="glass-card p-4"
            style={{ height: "calc(100vh - 250px)" }}
          >
            {requestError && (
              <div className="alert alert-danger py-2 px-3 mb-3 small">
                {requestError}
              </div>
            )}

            {/* Messages */}
            <div
              className="overflow-auto mb-3"
              style={{ height: "calc(100% - 80px)" }}
            >
              <AnimatePresence>
                {messages.map((message, idx) => (
                  <motion.div
                    key={message._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-3 d-flex ${
                      message.role === "candidate" ? "justify-content-end" : ""
                    }`}
                  >
                    <div
                      className={`p-3 rounded-3 ${
                        message.role === "interviewer"
                          ? "glass-card"
                          : "bg-primary text-white"
                      }`}
                      style={{ maxWidth: "75%" }}
                    >
                      <div className="small opacity-75 mb-1">
                        {message.role === "interviewer"
                          ? "AI Interviewer"
                          : "You"}
                      </div>
                      <div>{message.content}</div>
                      {message.feedback && (
                        <div className="mt-2 pt-2 border-top border-white border-opacity-25">
                          <div className="small">
                            <FiCheck className="me-1" />
                            Score: {message.feedback.score}/10
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your answer..."
                  className="form-control"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="btn btn-primary"
                >
                  {isSending ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <FiSend />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Feedback Panel */}
        {showFeedback && (
          <div className="col-lg-4">
            <div
              className="glass-card p-4"
              style={{ height: "calc(100vh - 250px)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h6 fw-bold mb-0">Performance Insights</h3>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="btn btn-sm btn-outline-light"
                >
                  <FiX />
                </button>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small">Questions Answered</span>
                  <span className="fw-bold">
                    {Math.floor(messages.length / 2)}
                  </span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{
                      width: `${Math.min((messages.length / 20) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="small text-muted">
                <FiTrendingUp className="me-2" />
                Keep answering questions to get detailed feedback and
                performance metrics!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
