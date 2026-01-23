"use client";

import React, { useState } from "react";
import {
  Users,
  Star,
  Calendar,
  Send,
  Search,
  Award,
  CheckCircle2,
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  expertiseAreas: string[];
  availability: "Available" | "Limited" | "Waitlist";
  matchScore: number;
  yearsExperience: number;
  currentMentees: number;
  maxMentees: number;
  bio: string;
}

const mockMentors: Mentor[] = [
  {
    id: "m-001",
    name: "Dr. Sarah Chen",
    role: "VP of Engineering",
    department: "Technology",
    avatar: "/avatars/sarah.jpg",
    expertiseAreas: ["System Design", "Technical Leadership", "Career Growth"],
    availability: "Available",
    matchScore: 95,
    yearsExperience: 18,
    currentMentees: 2,
    maxMentees: 4,
    bio: "Passionate about developing the next generation of tech leaders.",
  },
  {
    id: "m-002",
    name: "Marcus Williams",
    role: "Senior Director, Product",
    department: "Product Management",
    avatar: "/avatars/marcus.jpg",
    expertiseAreas: ["Product Strategy", "Stakeholder Management", "Agile"],
    availability: "Limited",
    matchScore: 89,
    yearsExperience: 14,
    currentMentees: 3,
    maxMentees: 4,
    bio: "Helping product professionals navigate complex organizational dynamics.",
  },
  {
    id: "m-003",
    name: "Priya Patel",
    role: "Chief Data Officer",
    department: "Data & Analytics",
    avatar: "/avatars/priya.jpg",
    expertiseAreas: ["Data Strategy", "Machine Learning", "Team Building"],
    availability: "Available",
    matchScore: 87,
    yearsExperience: 16,
    currentMentees: 1,
    maxMentees: 3,
    bio: "Building data-driven cultures and empowering data professionals.",
  },
  {
    id: "m-004",
    name: "James Rodriguez",
    role: "Director of Sales",
    department: "Revenue",
    avatar: "/avatars/james.jpg",
    expertiseAreas: ["Sales Strategy", "Negotiation", "Executive Presence"],
    availability: "Waitlist",
    matchScore: 82,
    yearsExperience: 12,
    currentMentees: 4,
    maxMentees: 4,
    bio: "Committed to helping sales professionals exceed their potential.",
  },
  {
    id: "m-005",
    name: "Lisa Thompson",
    role: "VP of People Operations",
    department: "HR",
    avatar: "/avatars/lisa.jpg",
    expertiseAreas: ["People Management", "Culture Building", "DEI"],
    availability: "Available",
    matchScore: 78,
    yearsExperience: 15,
    currentMentees: 2,
    maxMentees: 5,
    bio: "Advocate for inclusive leadership and organizational development.",
  },
];

const availabilityStyles: Record<string, { bg: string; text: string }> = {
  Available: { bg: "bg-aurora-green/10", text: "text-aurora-green" },
  Limited: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600" },
  Waitlist: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-500" },
};

export default function MentorMatching() {
  const [mentors] = useState<Mentor[]>(mockMentors);
  const [searchQuery, setSearchQuery] = useState("");
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.expertiseAreas.some((e) =>
        e.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequest = (id: string) => {
    setRequested((prev) => new Set([...prev, id]));
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-celestial-indigo" />
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Find a Mentor
          </h1>
        </div>
        <p className="text-silver-mist mb-6">
          AI-matched mentors based on your goals, skills, and career aspirations
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, expertise, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
          />
        </div>

        {/* Mentor Cards */}
        <div className="space-y-4">
          {filteredMentors.map((mentor) => {
            const avail = availabilityStyles[mentor.availability];
            const isRequested = requested.has(mentor.id);

            return (
              <div
                key={mentor.id}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-celestial-indigo/20 flex items-center justify-center text-celestial-indigo font-bold text-lg flex-shrink-0">
                      {mentor.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-ink-black dark:text-pearl">
                          {mentor.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${avail.bg} ${avail.text}`}
                        >
                          {mentor.availability}
                        </span>
                      </div>
                      <p className="text-sm text-silver-mist">
                        {mentor.role} - {mentor.department}
                      </p>
                      <p className="text-sm text-ink-black dark:text-pearl mt-2">
                        {mentor.bio}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {mentor.expertiseAreas.map((area) => (
                          <span
                            key={area}
                            className="text-xs px-2 py-1 rounded-full border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match Score & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-3 md:min-w-[140px]">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-celestial-indigo" />
                        <span className="text-2xl font-bold text-celestial-indigo">
                          {mentor.matchScore}%
                        </span>
                      </div>
                      <p className="text-xs text-silver-mist">Match Score</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-silver-mist">
                      <div className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{mentor.yearsExperience}y exp</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{mentor.currentMentees}/{mentor.maxMentees} mentees</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequest(mentor.id)}
                      disabled={isRequested || mentor.availability === "Waitlist"}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isRequested
                          ? "bg-aurora-green/10 text-aurora-green"
                          : mentor.availability === "Waitlist"
                          ? "bg-cloud dark:bg-nebula-purple/20 text-silver-mist cursor-not-allowed"
                          : "bg-celestial-indigo text-white hover:bg-celestial-indigo/90"
                      }`}
                    >
                      {isRequested ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Requested
                        </>
                      ) : mentor.availability === "Waitlist" ? (
                        "Join Waitlist"
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
