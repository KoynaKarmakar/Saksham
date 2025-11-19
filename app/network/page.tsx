'use client';

import React, { useState } from 'react';

// --- Data Structures (KEEP THESE OUTSIDE) ---

// Mentorship Tab Data
interface Mentor {
  name: string;
  role: string;
  rating: number;
  reviews: number;
  skills: string[];
  imgUrl: string;
}

const MENTORS: Mentor[] = [
  { name: "Sarah Johnson", role: "Senior UX Designer", rating: 4.9, reviews: 62, skills: ["UX/UI Design", "User Research", "Figma"], imgUrl: "https://placehold.co/100x100/392955/b773f8?text=SJ" },
  { name: "Michael Chen", role: "Full Stack Developer", rating: 4.8, reviews: 39, skills: ["React", "Node.js", "AWS"], imgUrl: "https://placehold.co/100x100/392955/b773f8?text=MC" },
  { name: "Emma Williams", role: "Marketing Consultant", rating: 4.7, reviews: 23, skills: ["Digital Marketing", "SEO", "Content Strategy"], imgUrl: "https://placehold.co/100x100/392955/b773f8?text=EW" },
];

// Events Tab Data
interface Event {
  month: string;
  day: number;
  time: string;
  type: 'Virtual' | 'In-Person';
  location?: string;
  title: string;
  description: string;
  attending: number;
}

const EVENTS: Event[] = [
  { month: "May", day: 15, time: "6:00 PM - 8:00 PM", type: "Virtual", title: "Freelancer Meetup", description: "Connect with fellow freelancers and share experiences in this virtual networking event.", attending: 78 },
  { month: "June", day: 2, time: "9:00 AM - 5:00 PM", type: "In-Person", location: "Convention Center, New York", title: "Gig Economy Summit", description: "A two-day conference focused on the future of independent work and the gig economy.", attending: 250 },
  { month: "May", day: 22, time: "12:00 PM - 1:30 PM", type: "Virtual", title: "Women in Tech Webinar", description: "Special webinar featuring successful women in tech sharing their career journeys.", attending: 120 },
];

// Skill Development Tab Data
interface Course {
  title: string;
  academy: string;
  duration: string;
  rating: number;
  enrolled: number;
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const COURSES: Course[] = [
  { title: "Advanced Web Development", academy: "Tech Academy", duration: "8 weeks", rating: 4.8, enrolled: 1245, price: 149, level: 'Intermediate' },
  { title: "Freelance Business Fundamentals", academy: "Business School Online", duration: "6 weeks", rating: 4.6, enrolled: 690, price: 99, level: 'Beginner' },
  { title: "Digital Marketing Masterclass", academy: "Marketing Pros", duration: "10 weeks", rating: 4.9, enrolled: 2150, price: 199, level: 'Advanced' },
];

// Community Tab Data
interface Topic {
  title: string;
  postedBy: string;
  replies: number;
  views: number;
  tags: { label: string, color: string }[];
  timeAgo: string;
}

const FORUM_TOPICS: Topic[] = [
  { title: "How to handle difficult clients?", postedBy: "Jessica K.", replies: 42, views: 1248, tags: [{ label: "Client Management", color: "blue-500" }, { label: "Communication", color: "purple-500" }], timeAgo: "2 hours ago" },
  { title: "Tax deductions every freelancer should know", postedBy: "Mike T.", replies: 56, views: 2310, tags: [{ label: "Taxes", color: "red-500" }, { label: "Finance", color: "green-500" }], timeAgo: "1 day ago" },
  { title: "Best tools for time tracking and invoicing", postedBy: "Alex W.", replies: 38, views: 1805, tags: [{ label: "Tools", color: "yellow-500" }, { label: "Productivity", color: "orange-500" }], timeAgo: "3 days ago" },
  { title: "How to find clients during economic downturns", postedBy: "Sophia M.", replies: 67, views: 3140, tags: [{ label: "Client Acquisition", color: "pink-500" }, { label: "Marketing", color: "indigo-500" }], timeAgo: "5 days ago" },
];

// Grants & Funding Data
interface Grant {
  title: string;
  organization: string;
  amount: string;
  eligibility: string;
  deadline: string;
}

const GRANTS: Grant[] = [
  { title: "Women Entrepreneurs Grant Program", organization: "National Business Foundation", amount: "$5,000 - $25,000", eligibility: "Women-owned businesses operating for at least 1 year", deadline: "June 30, 2023" },
  { title: "Creative Industry Innovation Fund", organization: "Arts Council", amount: "Up to $10,000", eligibility: "Freelancers in creative industries with innovative projects", deadline: "July 15, 2023" },
];

// --- Main Page Component ---

export default function NetworkPage() {
  const tabs = [
    { label: "Mentorship", value: "mentorship" },
    { label: "Events", value: "events" },
    { label: "Skill Development", value: "skill" },
    { label: "Community", value: "community" },
    { label: "Grants & Funding", value: "grants" },
  ]
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [search, setSearch] = useState('');

  // --- Tab Content Sections (NESTED INSIDE MAIN COMPONENT) ---

  function MentorshipSection() {
    return (
        <div className="pb-10">
            {/* Inner Search Bar */}
            <div className="flex justify-between items-center bg-[#221c2e] rounded-lg py-2 px-4 text-white font-medium mb-6">
                <input
                    className="w-full bg-[#221c2e] placeholder-gray-400 focus:outline-none"
                    placeholder="Search mentors by name, expertise, or industry..."
                />
                <div className='flex items-center gap-3'>
                    <button className="text-gray-400 px-3 py-1 text-sm font-medium hover:text-white transition">Filter</button>
                    <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                        Become a Mentor
                    </button>
                </div>
            </div>

            {/* Mentor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MENTORS.map((mentor, i) => (
                    <div key={i} className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
                        {/* <div className='absolute top-0 right-0 m-3 bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full'>
                            Available
                        </div> */}
                        {/* Profile Image (Placeholder) */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#29253b] mb-4">
                            <img src={mentor.imgUrl} alt={mentor.name} className="object-cover w-full h-full" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">{mentor.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{mentor.role}</p>

                        <div className="text-yellow-400 flex items-center gap-1 text-sm mb-4">
                            {mentor.rating}
                            <span>★</span>
                            <span className="text-gray-400">({mentor.reviews} reviews)</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {mentor.skills.map(skill => (
                                <span key={skill} className="bg-[#29253b] text-[#b773f8] text-xs font-medium px-3 py-1 rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <div className='flex gap-3 w-full'>
                            <button className="flex-1 bg-[#29253b] p-2 rounded-lg text-white font-semibold text-sm transition hover:bg-[#392955]">View Profile</button>
                            <button className="flex-1 bg-[#b773f8] p-2 rounded-lg text-black font-semibold text-sm transition hover:bg-[#a65df6]">Connect</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex justify-center mt-8'>
                <button className="bg-[#29253b] px-6 py-2 rounded-lg text-white font-semibold transition hover:bg-[#392955]">
                    Browse All Mentors
                </button>
            </div>
        </div>
    );
  }

  function EventsSection() {
    return (
        <div className="pb-10">
            {/* Inner Search Bar */}
            <div className="flex justify-between items-center bg-[#221c2e] rounded-lg py-2 px-4 text-white font-medium mb-6">
                <input
                    className="w-full bg-[#221c2e] placeholder-gray-400 focus:outline-none"
                    placeholder="Search events by title, date, or location..."
                />
                <div className='flex items-center gap-3'>
                    <button className="text-gray-400 px-3 py-1 text-sm font-medium hover:text-white transition">Calendar View</button>
                    <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                        Add Event Alert
                    </button>
                </div>
            </div>

            {/* Event List */}
            <div className="flex flex-col gap-4">
                {EVENTS.map((event, i) => (
                    <div key={i} className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex justify-between items-start">
                        <div className='flex gap-6'>
                            <div className='text-center w-20 flex flex-col justify-center items-center'>
                                <span className='text-gray-400 text-xs uppercase'>{event.month}</span>
                                <span className='text-4xl font-extrabold text-[#b773f8]'>{event.day}</span>
                                <span className='text-gray-400 text-xs'>{event.time}</span>
                                <span className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${event.type === 'Virtual' ? 'bg-purple-700 text-white' : 'bg-green-700 text-white'}`}>
                                    {event.type}
                                </span>
                                {event.location && (
                                    <span className="text-xs text-gray-500 mt-1">{event.location}</span>
                                )}
                            </div>
                            <div className='flex flex-col justify-center'>
                                <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                                <p className="text-gray-400">{event.description}</p>
                            </div>
                        </div>
                        <div className='flex flex-col items-end gap-2'>
                            <span className='text-lg font-bold text-gray-400'>{event.attending} Attending</span>
                            <button className="bg-[#29253b] px-4 py-2 rounded-md text-white font-semibold text-sm transition hover:bg-[#392955]">
                                Add to Calendar
                            </button>
                            <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                                Register Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Host Your Own Event */}
            <div className="mt-8 bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold mb-1">Host Your Own Networking Event</h3>
                    <p className="text-gray-400 text-sm">
                        Create and host virtual or in-person networking events for the community.
                    </p>
                </div>
                <button className="bg-[#b773f8] px-6 py-2 rounded-md text-black font-semibold transition hover:bg-[#a65df6]">
                    Create Event
                </button>
            </div>
        </div>
    );
  }

  function SkillDevelopmentSection() {
    return (
        <div className="pb-10">
            {/* Inner Search Bar */}
            <div className="flex justify-between items-center bg-[#221c2e] rounded-lg py-2 px-4 text-white font-medium mb-6">
                <input
                    className="w-full bg-[#221c2e] placeholder-gray-400 focus:outline-none"
                    placeholder="Search courses, certificates, or skills..."
                />
                <div className='flex items-center gap-3'>
                    <button className="text-gray-400 px-3 py-1 text-sm font-medium hover:text-white transition">Filter</button>
                    <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                        My Learning
                    </button>
                </div>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COURSES.map((course, i) => (
                    <div key={i} className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex flex-col">
                        <div className="relative h-32 rounded-lg overflow-hidden mb-4 bg-[#29253b] flex items-center justify-center">
                            <img 
                                src={`https://placehold.co/400x200/29253b/b773f8?text=Course+Image`} 
                                alt={course.title} 
                                className="object-cover w-full h-full opacity-30" 
                                onError={(e: any) => { e.target.onerror = null; e.target.src="https://placehold.co/400x200/29253b/b773f8?text=Course+Image" }}
                            />
                            <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${course.level === 'Advanced' ? 'bg-red-500' : course.level === 'Intermediate' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                                {course.level}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                        <p className="text-gray-400 text-sm mb-1">{course.academy} • {course.duration}</p>

                        <div className="text-yellow-400 flex items-center gap-1 text-sm mb-3">
                            {course.rating}
                            <span>★</span>
                            <span className="text-gray-400">({course.enrolled} enrolled)</span>
                        </div>

                        <div className='flex justify-between items-center mt-auto pt-3 border-t border-[#29253b]'>
                            <span className='text-2xl font-extrabold'>${course.price}</span>
                            <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                                Enroll Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Skill Path and Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Skill Path */}
                <div className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-3">Skill Path: Freelance Web Developer</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            A curated learning path to become a successful freelance web developer
                        </p>
                    </div>
                    <div>
                        <div className="text-[#b773f8] font-bold mb-2">4 of 12 courses completed</div>
                        <button className="bg-[#b773f8] w-full py-3 rounded-md text-black font-semibold transition hover:bg-[#a65df6]">
                            Continue Learning
                        </button>
                    </div>
                </div>

                {/* Certifications */}
                <div className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-3">Certifications Directory</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Browse industry-recognized certifications to boost your credentials
                        </p>
                    </div>
                    <button className="bg-[#29253b] w-full py-3 rounded-md text-white font-semibold transition hover:bg-[#392955] mt-auto">
                        Browse Certifications
                    </button>
                </div>
            </div>
        </div>
    );
  }


  function CommunitySection() {
    const [question, setQuestion] = useState({ title: '', details: '', tags: '' });
    const [posted, setPosted] = useState(false);

    const handleSubmit = () => {
        // Simple form validation
        if (question.title.trim() === '' || question.details.trim() === '') {
            // Replaced alert() with console log as per instructions
            console.error('Please fill out the Question Title and Details.');
            return;
        }
        
        // Simulate posting
        console.log("Posting Question:", question);
        setPosted(true);
        setTimeout(() => setPosted(false), 3000); // Reset posted status after 3 seconds
        setQuestion({ title: '', details: '', tags: '' }); // Clear form
    };

    return (
        <div className="pb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Forum Topics */}
            <div className="md:col-span-2 bg-[#1e1a2a] rounded-xl p-0 shadow-lg">
                <div className='flex justify-between items-center p-5 border-b border-[#29253b]'>
                    <h3 className="text-xl font-bold">Community Forum</h3>
                    <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">New Post</button>
                </div>
                
                {FORUM_TOPICS.map((topic, i) => (
                    <div key={i} className="p-5 border-b border-[#29253b] last:border-b-0 hover:bg-[#221c2e] transition cursor-pointer">
                        <h4 className="text-lg font-semibold mb-1">{topic.title}</h4>
                        <div className="text-xs text-gray-400 mb-2">
                            Posted by <span className='font-bold'>{topic.postedBy}</span> • {topic.replies} replies • {topic.views} views • {topic.timeAgo}
                        </div>
                        <div className="flex gap-2">
                            {topic.tags.map(tag => (
                                <span key={tag.label} className={`text-xs font-medium px-3 py-1 rounded-full text-white bg-gray-600`}>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className='p-5 flex justify-center'>
                    <button className="bg-[#29253b] px-6 py-2 rounded-lg text-white font-semibold transition hover:bg-[#392955]">
                        View All Topics
                    </button>
                </div>
            </div>

            {/* Right Column: Ask the Community */}
            <div className="md:col-span-1 flex flex-col gap-6">
                <div className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-3 text-center text-[#b773f8]">Ask the Community</h3>
                    
                    <label className="block text-sm font-semibold mb-1">Question Title</label>
                    <input
                        value={question.title}
                        onChange={(e) => setQuestion({...question, title: e.target.value})}
                        className="w-full rounded-md py-2 px-3 bg-[#29253b] text-white focus:border-[#b773f8] outline-none mb-3"
                        placeholder="How do I...?"
                    />
                    
                    <label className="block text-sm font-semibold mb-1">Details</label>
                    <textarea
                        value={question.details}
                        onChange={(e) => setQuestion({...question, details: e.target.value})}
                        className="w-full rounded-md py-2 px-3 bg-[#29253b] text-white focus:border-[#b773f8] outline-none h-24 resize-none mb-3"
                        placeholder="Provide more details about your question..."
                    />
                    
                    <label className="block text-sm font-semibold mb-1">Tags (Optional)</label>
                    <input
                        value={question.tags}
                        onChange={(e) => setQuestion({...question, tags: e.target.value})}
                        className="w-full rounded-md py-2 px-3 bg-[#29253b] text-white focus:border-[#b773f8] outline-none mb-4"
                        placeholder="e.g., finance, clients, tools"
                    />

                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-[#b773f8] py-3 rounded-md text-black font-bold transition hover:bg-[#a65df6]"
                    >
                        {posted ? 'Posted!' : 'Post Question'}
                    </button>
                </div>

                {/* Women-Focused Groups */}
                <div className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold mb-3">Women-Focused Communities</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Connect with women-only groups for specialized support.
                    </p>
                    <button className="bg-[#29253b] w-full py-3 rounded-md text-white font-semibold transition hover:bg-[#392955]">
                        Join Groups
                    </button>
                </div>
            </div>
        </div>
    );
  }

  function GrantsFundingSection() {
    return (
        <div className="pb-10">
            {/* Inner Search Bar */}
            <div className="flex justify-between items-center bg-[#221c2e] rounded-lg py-2 px-4 text-white font-medium mb-6">
                <input
                    className="w-full bg-[#221c2e] placeholder-gray-400 focus:outline-none"
                    placeholder="Search grants, funding opportunities..."
                />
                <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                    Eligibility Check
                </button>
            </div>

            {/* Grants List */}
            <div className="flex flex-col gap-4">
                {GRANTS.map((grant, i) => (
                    <div key={i} className="bg-[#1e1a2a] rounded-xl p-6 shadow-lg flex justify-between items-start">
                        <div className='flex flex-col gap-1'>
                            <h3 className="text-xl font-bold mb-1">{grant.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">By {grant.organization}</p>
                            <p className="text-white text-sm">{grant.eligibility}</p>
                            <p className="text-yellow-400 text-sm font-semibold mt-1">Deadline: {grant.deadline}</p>
                        </div>
                        <div className='flex flex-col items-end gap-3'>
                            <span className='text-xl font-bold text-green-400'>{grant.amount}</span>
                            <button className="bg-[#29253b] px-4 py-2 rounded-md text-white font-semibold text-sm transition hover:bg-[#392955]">
                                View Details
                            </button>
                            <button className="bg-[#b773f8] px-4 py-2 rounded-md text-black font-semibold text-sm transition hover:bg-[#a65df6]">
                                Apply Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grant Assistance & Tips */}
            <div className="mt-8 bg-[#1e1a2a] rounded-xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Application Assistance */}
                <div className="md:col-span-1">
                    <h3 className="text-xl font-bold mb-3">Grant Application Assistance</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Get help with your grant applications from experienced mentors.
                    </p>
                    <button className="bg-[#b773f8] px-6 py-2 rounded-md text-black font-semibold transition hover:bg-[#a65df6] w-full">
                        Request Assistance
                    </button>
                </div>

                {/* Application Tips */}
                <div className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-3">Application Tips</h3>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        <li>Start your application early - at least 2 weeks before the deadline</li>
                        <li>Carefully read eligibility requirements before applying</li>
                        <li>Prepare your business documentation in advance</li>
                        <li>Be specific about how you'll use the funds</li>
                        <li>Include measurable goals and outcomes in your proposal</li>
                    </ul>
                </div>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'mentorship':
        return <MentorshipSection />;
      case 'events':
        return <EventsSection />;
      case 'skill':
        return <SkillDevelopmentSection />;
      case 'community':
        return <CommunitySection />;
      case 'grants':
        return <GrantsFundingSection />;
      default:
        return <MentorshipSection />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#18141e] text-white px-0">
      <main className="max-w-[1400px] mx-auto w-full px-7 pb-16">
        
        {/* Header */}
        <div className="pt-10 pb-4 flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold">Networking & Mentorship</h1>
          <p className="text-gray-300 mt-1 text-lg">
            Connect with mentors, attend events, develop skills, and engage with the community.
          </p>
        </div>

        {/* Search Bar (General for the Page) */}
        <div className="flex items-center gap-3 w-full bg-[#221c2e] rounded-lg py-2 px-4 text-white font-medium mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#221c2e] placeholder-gray-400 focus:outline-none"
                placeholder="Search resources, clients, projects..."
            />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#29253b] mb-6">
          {tabs.map((t) => (
            <button
              key={t.value}
              className={`px-4 py-3 font-semibold text-sm transition-colors duration-200 ${
                activeTab === t.value
                  ? "text-[#b773f8] border-b-2 border-[#b773f8]"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {renderContent()}

      </main>
    </div>
  );
}