# AI Interview Simulator - Quick Setup Guide

## 🚀 5-Minute Integration

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install openai

# Frontend
cd frontend
npm install recharts react-syntax-highlighter
```

### Step 2: Add OpenAI API Key

1. Get API key from: https://platform.openai.com/api-keys
2. Add to `backend/.env`:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Step 3: Register Routes

Add to `backend/src/index.js`:

```javascript
import interviewRoutes from "./routes/interviewRoutes.js";

// Add with other routes
app.use("/api/interview", interviewRoutes);
```

### Step 4: Restart Servers

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Step 5: Test

1. Navigate to: `http://localhost:3000/tools/interview-simulator`
2. Click "Start Free Interview"
3. Select a role (Frontend/Backend/HR)
4. Start chatting with the AI interviewer!

---

## 📁 Files Created

### Backend

- `backend/src/models/InterviewSession.js`
- `backend/src/models/InterviewMessage.js`
- `backend/src/services/openaiService.js`
- `backend/src/controllers/interviewController.js`
- `backend/src/routes/interviewRoutes.js`

### Frontend

- `frontend/src/app/tools/interview-simulator/page.js`
- `frontend/src/app/tools/interview-simulator/start/page.js`
- `frontend/src/app/tools/interview-simulator/session/[id]/page.js`
- `frontend/src/app/tools/interview-simulator/dashboard/page.js`

---

## 🎯 API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`):

- `POST /api/interview/sessions` - Create new session
- `GET /api/interview/sessions` - Get user's sessions
- `GET /api/interview/sessions/:id` - Get session details
- `POST /api/interview/sessions/:id/messages` - Send message
- `GET /api/interview/sessions/:id/messages` - Get messages
- `POST /api/interview/sessions/:id/feedback` - Get AI feedback
- `PATCH /api/interview/sessions/:id/end` - End session
- `GET /api/interview/analytics` - Get analytics

---

## 💰 Monetization

**Free Tier:**

- 3 sessions per month
- Automatically enforced in `createSession` controller

**Pro Tier ($29/month):**

- Unlimited sessions
- Check user subscription: `req.user.subscription`

---

## 🐛 Troubleshooting

**"OpenAI API error":**

- Check API key is correct
- Verify OpenAI account has credits
- Check API status: https://status.openai.com

**"Session not found":**

- Ensure user is authenticated
- Check session belongs to current user

**Charts not showing:**

- Install recharts: `npm install recharts`
- Check browser console for errors

---

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] OpenAI API key added
- [ ] Routes registered
- [ ] Servers restarted
- [ ] Can create session
- [ ] AI responds to messages
- [ ] Dashboard shows stats
- [ ] Free tier limits work

**You're ready to launch!** 🎉
