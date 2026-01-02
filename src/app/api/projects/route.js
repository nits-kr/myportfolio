import { NextResponse } from 'next/server';

export async function GET() {
    const projects = [
        {
            id: 1,
            title: 'FinTech Dashboard',
            category: 'Web App',
            image: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
            desc: 'A comprehensive financial dashboard with real-time data visualization.'
        },
        {
            id: 2,
            title: 'E-Commerce Platform',
            category: 'Full Stack',
            image: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            desc: 'Scalable shopping experience with Next.js and Stripe integration.'
        },
        {
            id: 3,
            title: 'AI Chat Interface',
            category: 'AI / ML',
            image: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            desc: 'Responsive chat UI connecting to OpenAI API.'
        },
        {
            id: 4,
            title: 'Crypto Tracker',
            category: 'Mobile App',
            image: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
            desc: 'Real-time cryptocurrency tracking app with price alerts.'
        }
    ];

    return NextResponse.json(projects);
}
