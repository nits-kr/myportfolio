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
        "Next.js",
        "Redux Toolkit",
        "Tailwind CSS",
        "Bootstrap",
        "Ant Design",
      ],
      backend: ["Node.js", "Express.js", "RESTful APIs"],
      database: ["MongoDB", "Firebase", "PostgreSQL"],
      realtime: ["Socket.io", "WebSocket"],
      payments: ["Stripe API"],
      tools: ["Git", "Docker", "Jest", "React Testing Library", "Postman"],
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
        desc: "SSR, CSR, bundle optimization, lazy loading",
      },
      {
        icon: "🏢",
        title: "Enterprise Solutions",
        desc: "Multi-branch systems, role-based access, real-time sync",
      },
      {
        icon: "🤖",
        title: "AI Integration",
        desc: "AI-driven UI/UX, chatbots, personalized experiences",
      },
      {
        icon: "💻",
        title: "Full-Stack Development",
        desc: "End-to-end MERN stack applications",
      },
      {
        icon: "🤝",
        title: "Agile Collaboration",
        desc: "Team leadership, code reviews, mentoring",
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
