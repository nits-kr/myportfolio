import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: {
    name: "NITISH KUMAR",
    title: "Frontend Developer | React & Next.js Expert",
    email: "nits.kr99@gmail.com",
    bio: "Experienced Full-Stack Developer with 3+ years building scalable web applications using React.js, Next.js, and modern JavaScript. Specialized in enterprise solutions, real-time features, and AI integration.",
    longBio:
      "Delivered 25+ successful projects including complex admin panels and multi-branch management platforms. Building scalable web applications with cutting-edge technologies. Passionate about solving complex problems through innovative technical solutions.",
    skills: {
      frontend: [
        "React.js",
        "Next.js (App Router)",
        "Redux Toolkit",
        "React Query (TanStack Query)",
        "JavaScript (ES6+)",
        "TypeScript",
        "Tailwind CSS",
        "Bootstrap",
        "Ant Design",
        "Framer Motion",
        "Responsive Design",
        "Web Performance Optimization",
      ],
      backend: [
        "Node.js",
        "Express.js",
        "RESTful APIs",
        "JWT Authentication",
        "Role-Based Access Control (RBAC)",
        "Middleware Architecture",
      ],

      database: [
        "MongoDB",
        "Mongoose",
        "PostgreSQL",
        "Firebase (Auth & Firestore)",
      ],

      realtime: ["Socket.io", "WebSocket", "Real-time Notifications"],

      payments: ["Stripe API", "HyperPay", "PayTabs"],

      tools: [
        "Git",
        "Docker",
        "Jest",
        "React Testing Library",
        "Postman",
        "ESLint",
        "Prettier",
      ],
    },
    achievements: [
      "Built enterprise multi-branch platform reducing stockouts by 35%",
      "Optimized application performance by 30% through code splitting and lazy loading",
      "Achieved 99% bug-free releases with comprehensive testing",
      "Developed real-time systems for 500+ concurrent users",
    ],
    competencies: [
      {
        icon: "🚀",
        title: "Performance Optimization",
        desc: "SSR/SSG with Next.js, code splitting, lazy loading, caching strategies, and Core Web Vitals optimization",
      },
      {
        icon: "🏢",
        title: "Enterprise Application Development",
        desc: "Scalable multi-branch systems, role-based access control (RBAC), secure authentication, and real-time data sync",
      },
      {
        icon: "🤖",
        title: "AI & Smart Features",
        desc: "AI-powered UI/UX enhancements, chatbot integration, intelligent search, and personalized user experiences",
      },
      {
        icon: "💻",
        title: "Full-Stack Engineering",
        desc: "End-to-end MERN stack development with REST APIs, database design, authentication, and deployment",
      },
      {
        icon: "⚡",
        title: "State & Data Management",
        desc: "Advanced state handling with Redux Toolkit, React Query, server caching, and optimistic updates",
      },
      {
        icon: "🔐",
        title: "Authentication & Security",
        desc: "JWT, refresh tokens, OTP-based login, protected routes, API security, and role-based authorization",
      },
      {
        icon: "📡",
        title: "Real-Time Systems",
        desc: "Live updates using Socket.io and WebSockets for chat, notifications, dashboards, and tracking systems",
      },
      {
        icon: "🎨",
        title: "UI Architecture & Design Systems",
        desc: "Reusable component libraries, Tailwind + Bootstrap coexistence, Ant Design customization, and accessibility",
      },
      {
        icon: "🧪",
        title: "Testing & Code Quality",
        desc: "Unit and integration testing with Jest and React Testing Library, clean code practices, and linting",
      },
      {
        icon: "🚢",
        title: "Deployment & DevOps Awareness",
        desc: "CI/CD basics, Dockerized environments, environment management, and production debugging",
      },
      {
        icon: "🤝",
        title: "Team & Agile Collaboration",
        desc: "Agile/Scrum workflows, code reviews, mentoring junior developers, and cross-team collaboration",
      },
    ],
  },
  projects: [
    {
      id: 1,
      title: "FinTech Dashboard",
      status: "Completed",
      date: "2023-10-24",
    },
    {
      id: 2,
      title: "E-Commerce Platform",
      status: "In Progress",
      date: "2023-11-02",
    },
  ],
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    // Add more reducers as needed
  },
});

export const { updateProfile, addProject } = contentSlice.actions;
export default contentSlice.reducer;
