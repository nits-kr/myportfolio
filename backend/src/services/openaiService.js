import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompts for different interview roles
const SYSTEM_PROMPTS = {
  frontend: `You are an experienced technical interviewer conducting a frontend developer interview.
Ask questions about React, JavaScript, CSS, performance optimization, web fundamentals, and modern frontend practices.
Start with easier questions and progressively increase difficulty based on the candidate's responses.
Be encouraging but thorough. Provide constructive feedback and relevant follow-up questions.
Keep questions concise and focused. One question at a time.`,

  backend: `You are an experienced technical interviewer conducting a backend developer interview.
Ask questions about Node.js, databases (SQL/NoSQL), RESTful APIs, system design, scalability, and security.
Start with easier questions and progressively increase difficulty based on the candidate's responses.
Be encouraging but thorough. Provide constructive feedback and relevant follow-up questions.
Keep questions concise and focused. One question at a time.`,

  hr: `You are an experienced HR interviewer conducting a behavioral interview.
Ask questions using the STAR method (Situation, Task, Action, Result) about teamwork, conflict resolution, leadership, and problem-solving.
Evaluate communication skills, emotional intelligence, and cultural fit.
Be warm and encouraging. Help candidates structure their answers if needed.
Keep questions concise and focused. One question at a time.`,
};

/**
 * Generate AI interviewer response
 */
export const generateInterviewerResponse = async (
  role,
  conversationHistory,
  customData = null,
) => {
  try {
    let systemPrompt = SYSTEM_PROMPTS[role];

    if (
      role === "custom" ||
      (role !== "frontend" && role !== "backend" && role !== "hr")
    ) {
      // Use custom data if available, otherwise fallback or generic
      if (customData) {
        systemPrompt = `You are an expert technical interviewer conducting an interview for the role of ${customData.title}.
        
Job Description/Context:
${customData.jobDescription}

${customData.focusAreas ? `Focus Areas: ${customData.focusAreas}` : ""}

Instructions:
- Conduct a professional interview based stricly on the job description and title provided.
- Start by introducing yourself and asking about their background related to this specific role.
- Ask questions that test the specific skills mentioned in the context.
- Be encouraging but thorough.
- Keep questions concise and focused. One question at a time.`;
      } else {
        // Fallback for when "custom" role title is stored in session but we might not have the full context object re-passed in chat (though we should store it in session normally)
        // For MVP, if we don't persist customData in DB, the chat continuation might lose context.
        // ideally we should store customPrompt in the Session model.
        // For now, let's assume 'role' passed here might be the actual custom title if it's not one of the standard keys
        systemPrompt = `You are an experienced interviewer conducting an interview for the role of ${role}. ask relevant questions.`;
      }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "interviewer" ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate interviewer response");
  }
};

/**
 * Generate AI feedback for candidate's answer
 */
export const generateFeedback = async (role, question, answer) => {
  try {
    const feedbackSystemPrompt =
      SYSTEM_PROMPTS[role] ||
      "You are an experienced interviewer who provides actionable, specific interview feedback.";

    const prompt = `As an expert technical interviewer, analyze this candidate's answer:

Question: ${question}
Answer: ${answer}

Provide feedback in the following JSON format:
{
  "score": <number 1-10>,
  "technicalDepth": <number 1-10>,
  "clarity": <number 1-10>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "followUp": "<relevant follow-up question>"
}

Be constructive and specific. Focus on technical accuracy, communication clarity, and depth of understanding.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: feedbackSystemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI feedback error:", error);
    throw new Error("Failed to generate feedback");
  }
};

/**
 * Generate session summary
 */
export const generateSessionSummary = async (role, messages, scores) => {
  try {
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;

    const prompt = `Based on this interview session, provide a comprehensive summary:

Role: ${role}
Average Score: ${avgScore.toFixed(1)}/10
Number of Questions: ${messages.length / 2}

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Provide a summary in JSON format:
{
  "overallPerformance": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "nextSteps": "<what to focus on next>"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI summary error:", error);
    throw new Error("Failed to generate session summary");
  }
};

export default {
  generateInterviewerResponse,
  generateFeedback,
  generateSessionSummary,
};
