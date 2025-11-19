// app/api/network/catalog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/middleware/auth';

// Data for the Rate Calculator page
const RATES_BY_FIELD = [
    {
        name: "Web Development",
        rates: [
            { label: "Beginner", range: "₹600–1,800" },
            { label: "Intermediate", range: "₹1,800–3,600" },
            { label: "Expert", range: "₹3,600–7,000+" },
        ],
    },
    {
        name: "Graphic Design",
        rates: [
            { label: "Beginner", range: "₹500–1,300" },
            { label: "Intermediate", range: "₹1,800–4,300" },
            { label: "Expert", range: "₹5,500–12,000+" },
        ],
    },
    {
        name: "Content Writing",
        rates: [
            { label: "Beginner", range: "₹400–900" },
            { label: "Intermediate", range: "₹1,000–2,500" },
            { label: "Expert", range: "₹2,500–6,000+" },
        ],
    },
    {
        name: "Digital Marketing",
        rates: [
            { label: "Beginner", range: "₹600–1,300" },
            { label: "Intermediate", range: "₹1,600–3,400" },
            { label: "Expert", range: "₹3,500–7,000+" },
        ],
    },
    {
        name: "Video Editing",
        rates: [
            { label: "Beginner", range: "₹600–1,700" },
            { label: "Intermediate", range: "₹1,800–3,800" },
            { label: "Expert", range: "₹3,900–8,500+" },
        ],
    },
    {
        name: "Virtual Assistant",
        rates: [
            { label: "Beginner", range: "₹400–1,000" },
            { label: "Intermediate", range: "₹1,100–2,000" },
            { label: "Expert", range: "₹2,100–3,500+" },
        ],
    },
];

const STATIC_CATALOG = {
    mentors: [
        { name: "Sarah Johnson", role: "Senior UX Designer", rating: 4.9, reviews: 62, skills: ["UX/UI Design", "User Research", "Figma"], imgUrl: "https://placehold.co/100x100/392955/b773f8?text=SJ" },
        { name: "Michael Chen", role: "Full Stack Developer", rating: 4.8, reviews: 39, skills: ["React", "Node.js", "AWS"] },
    ],
    events: [
        { title: "Freelancer Meetup", type: "Virtual", time: "6:00 PM", attending: 78, date: "2025-05-15" },
        { title: "Gig Economy Summit", type: "In-Person", location: "New York", time: "9:00 AM", attending: 250, date: "2025-06-02" },
    ],
    courses: [
        { title: "Advanced Web Development", academy: "Tech Academy", duration: "8 weeks", rating: 4.8, price: 149, level: 'Intermediate' },
    ],
    grants: [
        { title: "Women Entrepreneurs Grant Program", organization: "National Business Foundation", amount: "$5,000 - $25,000", deadline: "2025-06-30" },
    ],
    plans: [
        { name: "Basic Health Plan", desc: "Basic coverage for essential health needs", price: "₹250/month", rating: 4.2, reviews: 128 },
        { name: "Solo 401(k)", desc: "High contribution limits, good for high earners", amount: "₹66,000/year" },
    ],
    // NEW FIELD for Rate Calculator
    rateBenchmarks: RATES_BY_FIELD,
};

/**
 * GET handler to fetch static catalog data.
 * Endpoint: GET /api/network/catalog
 */
async function getCatalogHandler() {
    return NextResponse.json({ catalog: STATIC_CATALOG }, { status: 200 });
}

export const GET = protect(getCatalogHandler);