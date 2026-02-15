"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiTrendingUp,
  FiClock,
  FiAward,
  FiCode,
  FiDatabase,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const roleIcons = {
  frontend: <FiCode />,
  backend: <FiDatabase />,
  hr: <FiUsers />,
  custom: <FiBriefcase />,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sessionsRes, analyticsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions?limit=10`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview/analytics`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ]);

      const sessionsData = await sessionsRes.json();
      const analyticsData = await analyticsRes.json();

      if (sessionsData.success) setSessions(sessionsData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [user, router, fetchData]);

  if (isLoading) {
    return (
      <div className="container py-5 mt-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold">Interview Dashboard</h1>
        <Link
          href="/tools/interview-simulator/start"
          className="btn btn-primary"
        >
          New Interview
        </Link>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3"
                style={{ background: "rgba(124, 58, 237, 0.1)" }}
              >
                <FiTrendingUp size={24} className="text-primary" />
              </div>
              <div>
                <div className="h4 fw-bold mb-0">
                  {analytics?.averageScore?.toFixed(1) || "0.0"}/10
                </div>
                <div className="small text-muted">Average Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3"
                style={{ background: "rgba(16, 185, 129, 0.1)" }}
              >
                <FiAward size={24} className="text-success" />
              </div>
              <div>
                <div className="h4 fw-bold mb-0">
                  {analytics?.totalSessions || 0}
                </div>
                <div className="small text-muted">Total Sessions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3"
                style={{ background: "rgba(59, 130, 246, 0.1)" }}
              >
                <FiClock size={24} className="text-info" />
              </div>
              <div>
                <div className="h4 fw-bold mb-0">
                  {user?.subscription === "free" ? "3" : "∞"}
                </div>
                <div className="small text-muted">Sessions/Month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Trend */}
      {analytics?.recentScores && analytics.recentScores.length > 0 && (
        <div className="glass-card p-4 mb-5">
          <h2 className="h5 fw-bold mb-4">Score Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.recentScores.reverse()}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                stroke="rgba(255,255,255,0.5)"
              />
              <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: "#7c3aed" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="glass-card p-4">
        <h2 className="h5 fw-bold mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">
              No sessions yet. Start your first interview!
            </p>
            <Link
              href="/tools/interview-simulator/start"
              className="btn btn-primary mt-3"
            >
              Start Interview
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {roleIcons[session.role] || <FiBriefcase />}
                        <span className="text-capitalize">
                          {session.role === "custom" &&
                          session.customData?.title
                            ? session.customData.title
                            : session.role}
                        </span>
                      </div>
                    </td>
                    <td className="text-capitalize">{session.difficulty}</td>
                    <td>
                      {session.overallScore ? (
                        <span className="badge bg-primary">
                          {session.overallScore.toFixed(1)}/10
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {session.duration
                        ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s`
                        : "-"}
                    </td>
                    <td>{new Date(session.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          session.status === "completed"
                            ? "bg-success"
                            : session.status === "active"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
