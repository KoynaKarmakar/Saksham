// app/api/network/catalog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protect, AuthenticatedHandler } from '@/lib/middleware/auth';

// Mock data to simulate fetching static catalog information
const STATIC_CATALOG = {
    mentors: [
        { name: "Sarah Johnson", role: "Senior UX Designer", rating: 4.9, reviews: 62, skills: ["UX/UI Design", "User Research", "Figma"] },
        { name: "Michael Chen", role: "Full Stack Developer", rating: 4.8, reviews: 39, skills: ["React", "Node.js", "AWS"] },
        // ... more mentors
    ],
    events: [
        { title: "Freelancer Meetup", type: "Virtual", time: "6:00 PM", attending: 78, date: "2025-05-15" },
        { title: "Gig Economy Summit", type: "In-Person", location: "New York", time: "9:00 AM", attending: 250, date: "2025-06-02" },
        // ... more events
    ],
    courses: [
        { title: "Advanced Web Development", academy: "Tech Academy", duration: "8 weeks", rating: 4.8, price: 149, level: 'Intermediate' },
        { title: "Freelance Business Fundamentals", academy: "Business School Online", duration: "6 weeks", rating: 4.6, price: 99, level: 'Beginner' },
        // ... more courses
    ],
    grants: [
        { title: "Women Entrepreneurs Grant Program", organization: "National Business Foundation", amount: "$5,000 - $25,000", deadline: "2025-06-30" },
        // ... more grants
    ],
    plans: [ // For the benefits page
        { name: "Basic Health Plan", price: "₹250/month", rating: 4.2 },
        { name: "Solo 401(k)", desc: "High contribution limits", amount: "₹66,000/year" },
    ]
};

/**
 * GET handler to fetch static catalog data.
 * Endpoint: GET /api/network/catalog
 */
const getCatalogHandler: AuthenticatedHandler = async (req: NextRequest, user: any) => {
    return NextResponse.json({ catalog: STATIC_CATALOG }, { status: 200 });
};

export const GET = protect(getCatalogHandler);