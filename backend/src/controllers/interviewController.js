import InterviewSession from "../models/InterviewSession.js";
import InterviewMessage from "../models/InterviewMessage.js";
import {
  generateInterviewerResponse,
  generateFeedback,
  generateSessionSummary,
} from "../services/openaiService.js";

// Create new interview session
export const createSession = async (req, res) => {
  try {
    const { role, difficulty = "mid", customData } = req.body;
    const userId = req.user._id;
    const subscriptionPlan = req.user.subscription || "free";

    // Tiered monthly session limits
    const limits = {
      free: 3,
      pro: 50,
      enterprise: 200,
    };

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const sessionsThisMonth = await InterviewSession.countDocuments({
      userId,
      createdAt: { $gte: currentMonth },
    });

    const monthlyLimit = limits[subscriptionPlan] || limits.free;

    if (sessionsThisMonth >= monthlyLimit) {
      return res.status(403).json({
        success: false,
        error: `${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} tier limit reached (${monthlyLimit} sessions/month)`,
        upgradeUrl: "/pricing",
      });
    }

    const session = await InterviewSession.create({
      userId,
      role: role === "custom" ? "custom" : role,
      customData: role === "custom" ? customData : undefined,
      difficulty,
    });

    // Generate initial interviewer greeting
    const greeting = await generateInterviewerResponse(role, [], customData);

    await InterviewMessage.create({
      sessionId: session._id,
      role: "interviewer",
      content: greeting,
    });

    session.messageCount = 1;
    await session.save();

    res.status(201).json({
      success: true,
      data: {
        session,
        initialMessage: greeting,
      },
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user's sessions
export const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session details
export const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: id, userId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send message and get AI response
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, codeSnippet } = req.body;
    const userId = req.user._id;
    const subscriptionPlan = req.user.subscription || "free";

    const session = await InterviewSession.findOne({ _id: id, userId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    if (session.status !== "active") {
      return res
        .status(400)
        .json({ success: false, error: "Session is not active" });
    }

    // Tiered per-session message limits
    const messageLimits = {
      free: 14, // 7 rounds
      pro: 50, // 25 rounds
      enterprise: 999,
    };

    const limit = messageLimits[subscriptionPlan] || messageLimits.free;

    if (session.messageCount >= limit) {
      return res.status(403).json({
        success: false,
        error: `Message limit reached for this session (${limit} messages). Please upgrade for more.`,
        upgradeUrl: "/pricing",
      });
    }

    // Save candidate's message
    const candidateMessage = await InterviewMessage.create({
      sessionId: id,
      role: "candidate",
      content,
      codeSnippet,
    });

    // Get conversation history
    const messages = await InterviewMessage.find({ sessionId: id })
      .sort({ timestamp: 1 })
      .select("role content");

    // Generate AI response
    const aiResponse = await generateInterviewerResponse(
      session.role,
      messages,
      session.customData,
    );

    // Save interviewer's response
    const interviewerMessage = await InterviewMessage.create({
      sessionId: id,
      role: "interviewer",
      content: aiResponse,
    });

    // Update session
    session.messageCount += 2;
    await session.save();

    res.json({
      success: true,
      data: {
        candidateMessage,
        interviewerMessage,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get chat messages
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: id, userId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    const messages = await InterviewMessage.find({ sessionId: id }).sort({
      timestamp: 1,
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get AI feedback for answer
export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { messageId } = req.body;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: id, userId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    const message = await InterviewMessage.findOne({
      _id: messageId,
      sessionId: id,
    });
    if (!message || message.role !== "candidate") {
      return res.status(400).json({ success: false, error: "Invalid message" });
    }

    const previousMessages = await InterviewMessage.find({ sessionId: id })
      .sort({ timestamp: -1 })
      .limit(2);

    const question =
      previousMessages[1]?.content || "General interview question";

    const feedback = await generateFeedback(
      session.role,
      question,
      message.content,
    );

    message.feedback = {
      score: feedback.score,
      technicalDepth: feedback.technicalDepth,
      clarity: feedback.clarity,
      suggestions: [
        ...(feedback.improvements || []),
        ...(feedback.strengths || []),
      ],
    };
    await message.save();

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// End session and get summary
export const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: id, userId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    if (session.status === "completed") {
      return res.json({
        success: true,
        data: {
          session,
          summary: session.summary || null,
        },
      });
    }

    const messages = await InterviewMessage.find({ sessionId: id }).sort({
      timestamp: 1,
    });

    const scores = messages
      .filter((m) => m.feedback?.score)
      .map((m) => m.feedback.score);

    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;

    let summary = null;
    try {
      summary = await generateSessionSummary(session.role, messages, scores);
    } catch (summaryError) {
      console.error("Summary generation failed:", summaryError);
      summary = {
        overallPerformance:
          "Session completed. Summary generation is temporarily unavailable.",
        strengths: [],
        areasForImprovement: [],
        recommendations: [],
        nextSteps: "Continue practicing with additional sessions.",
      };
    }

    const technicalScores = messages
      .filter((m) => m.feedback?.technicalDepth !== undefined)
      .map((m) => m.feedback.technicalDepth);
    const clarityScores = messages
      .filter((m) => m.feedback?.clarity !== undefined)
      .map((m) => m.feedback.clarity);

    session.status = "completed";
    session.completedAt = new Date();
    session.duration = Math.floor(
      (session.completedAt - session.startedAt) / 1000,
    );
    session.overallScore = avgScore;
    session.metrics = {
      technicalDepth:
        technicalScores.length > 0
          ? technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length
          : 5,
      clarity:
        clarityScores.length > 0
          ? clarityScores.reduce((a, b) => a + b, 0) / clarityScores.length
          : 5,
      confidence: avgScore,
    };
    session.summary = summary;
    await session.save();

    res.json({
      success: true,
      data: {
        session,
        summary,
      },
    });
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get analytics
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await InterviewSession.find({
      userId,
      status: "completed",
    }).sort({ createdAt: -1 });

    const stats = {
      totalSessions: sessions.length,
      averageScore:
        sessions.length > 0
          ? sessions.reduce((a, s) => a + (s.overallScore || 0), 0) /
            sessions.length
          : 0,
      byRole: {
        frontend: sessions.filter((s) => s.role === "frontend").length,
        backend: sessions.filter((s) => s.role === "backend").length,
        hr: sessions.filter((s) => s.role === "hr").length,
      },
      recentScores: sessions.slice(0, 10).map((s) => ({
        date: s.createdAt,
        score: s.overallScore,
        role: s.role,
      })),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
