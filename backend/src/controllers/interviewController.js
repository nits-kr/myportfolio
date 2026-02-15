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

    // Check usage limits for free tier
    if (req.user.subscription === "free") {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const sessionsThisMonth = await InterviewSession.countDocuments({
        userId,
        createdAt: { $gte: currentMonth },
      });

      if (sessionsThisMonth >= 3) {
        return res.status(403).json({
          success: false,
          error: "Free tier limit reached (3 sessions/month)",
          upgradeUrl: "/pricing",
        });
      }
    }

    const session = await InterviewSession.create({
      userId,
      role: role === "custom" ? "custom" : role, // Keep 'custom' as the role identifier
      customData: role === "custom" ? customData : undefined, // Save the full custom context
      difficulty,
    });

    // Generate initial interviewer greeting
    // const greeting = await generateInterviewerResponse(role, [], customData);
    const greeting = "Hello, I am your interviewer. Let's start.";

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
    console.error(error.stack);
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
      session.customData, // Pass the persisted custom context
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

    const message = await InterviewMessage.findById(messageId);
    if (!message || message.role !== "candidate") {
      return res.status(400).json({ success: false, error: "Invalid message" });
    }

    // Get previous interviewer question
    const previousMessages = await InterviewMessage.find({ sessionId: id })
      .sort({ timestamp: -1 })
      .limit(2);

    const question =
      previousMessages[1]?.content || "General interview question";

    // Generate feedback
    const feedback = await generateFeedback(
      session.role,
      question,
      message.content,
    );

    // Update message with feedback
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

    // Get all messages
    const messages = await InterviewMessage.find({ sessionId: id }).sort({
      timestamp: 1,
    });

    // Calculate scores
    const scores = messages
      .filter((m) => m.feedback?.score)
      .map((m) => m.feedback.score);

    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;

    // Generate summary
    const summary = await generateSessionSummary(
      session.role,
      messages,
      scores,
    );

    // Update session
    session.status = "completed";
    session.completedAt = new Date();
    session.duration = Math.floor(
      (session.completedAt - session.startedAt) / 1000,
    );
    session.overallScore = avgScore;
    session.metrics = {
      technicalDepth:
        scores.length > 0
          ? messages
              .filter((m) => m.feedback?.technicalDepth)
              .reduce((a, m) => a + m.feedback.technicalDepth, 0) /
            scores.length
          : 5,
      clarity:
        scores.length > 0
          ? messages
              .filter((m) => m.feedback?.clarity)
              .reduce((a, m) => a + m.feedback.clarity, 0) / scores.length
          : 5,
      confidence: avgScore, // Simplified for MVP
    };
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
