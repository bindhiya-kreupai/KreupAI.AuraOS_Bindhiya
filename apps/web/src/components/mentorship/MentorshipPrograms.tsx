"use client";

import React, { useState } from "react";
import {
  Users,
  Clock,
  Calendar,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  Target,
  Star,
  Briefcase,
  GraduationCap,
} from "lucide-react";

interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  maxParticipants: number;
  mentorCount: number;
  menteeCount: number;
  mentorMenteeRatio: string;
  status: "active" | "upcoming" | "completed";
  category: string;
  skills: string[];
  programLead: string;
  meetingFrequency: string;
  isJoined: boolean;
}

const mockPrograms: MentorshipProgram[] = [
  {
    id: "mp-001",
    name: "Engineering Leadership Pipeline",
    description: "Accelerate your transition from individual contributor to engineering leader. Pair with senior engineering managers to develop leadership competencies, strategic thinking, and team management skills.",
    duration: "6 months",
    startDate: "2025-01-15",
    endDate: "2025-07-15",
    participantCount: 48,
    maxParticipants: 60,
    mentorCount: 12,
    menteeCount: 36,
    mentorMenteeRatio: "1:3",
    status: "active",
    category: "Leadership",
    skills: ["Team Management", "Strategic Planning", "Technical Vision", "Stakeholder Communication"],
    programLead: "Dr. Sarah Chen",
    meetingFrequency: "Bi-weekly",
    isJoined: false,
  },
  {
    id: "mp-002",
    name: "Women in Technology",
    description: "Empowering women in tech through mentorship, networking, and career development. Connect with accomplished women leaders who provide guidance on navigating career growth in the technology sector.",
    duration: "12 months",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    participantCount: 72,
    maxParticipants: 80,
    mentorCount: 18,
    menteeCount: 54,
    mentorMenteeRatio: "1:3",
    status: "active",
    category: "Diversity & Inclusion",
    skills: ["Career Development", "Executive Presence", "Negotiation", "Personal Branding"],
    programLead: "Maria Santos",
    meetingFrequency: "Weekly",
    isJoined: true,
  },
  {
    id: "mp-003",
    name: "New Hire Buddy System",
    description: "Help new team members integrate smoothly into the organization. Experienced employees guide newcomers through their first 90 days, covering culture, processes, and building internal networks.",
    duration: "3 months",
    startDate: "2025-02-01",
    endDate: "2025-04-30",
    participantCount: 30,
    maxParticipants: 40,
    mentorCount: 15,
    menteeCount: 15,
    mentorMenteeRatio: "1:1",
    status: "active",
    category: "Onboarding",
    skills: ["Company Culture", "Process Knowledge", "Networking", "Role Clarity"],
    programLead: "James Wilson",
    meetingFrequency: "Weekly",
    isJoined: false,
  },
  {
    id: "mp-004",
    name: "Product & Design Mentorship",
    description: "Bridge the gap between product management and design thinking. Cross-functional mentoring pairs help participants develop a holistic approach to product development and user experience.",
    duration: "4 months",
    startDate: "2025-03-01",
    endDate: "2025-06-30",
    participantCount: 0,
    maxParticipants: 32,
    mentorCount: 8,
    menteeCount: 0,
    mentorMenteeRatio: "1:3",
    status: "upcoming",
    category: "Product",
    skills: ["Design Thinking", "User Research", "Product Strategy", "Roadmap Planning"],
    programLead: "Lisa Chang",
    meetingFrequency: "Bi-weekly",
    isJoined: false,
  },
  {
    id: "mp-005",
    name: "Technical Excellence Program",
    description: "Deep-dive into advanced technical topics with seasoned architects and principal engineers. Focus on system design, code quality, performance optimization, and emerging technologies.",
    duration: "9 months",
    startDate: "2025-01-10",
    endDate: "2025-10-10",
    participantCount: 42,
    maxParticipants: 50,
    mentorCount: 7,
    menteeCount: 35,
    mentorMenteeRatio: "1:5",
    status: "active",
    category: "Technical",
    skills: ["System Design", "Architecture", "Performance", "Code Review"],
    programLead: "Alan Park",
    meetingFrequency: "Bi-weekly",
    isJoined: false,
  },
];

const statusStyles: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  active: {
    label: "Active",
    dot: "bg-aurora-green",
    text: "text-aurora-green",
    bg: "bg-aurora-green/10",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-yellow-500",
    text: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  completed: {
    label: "Completed",
    dot: "bg-silver-mist",
    text: "text-silver-mist",
    bg: "bg-slate-100 dark:bg-deep-cosmos",
  },
};

const categoryIcons: Record<string, React.ReactNode> = {
  Leadership: <Briefcase className="w-6 h-6" />,
  "Diversity & Inclusion": <Star className="w-6 h-6" />,
  Onboarding: <UserPlus className="w-6 h-6" />,
  Product: <Target className="w-6 h-6" />,
  Technical: <GraduationCap className="w-6 h-6" />,
};

export function MentorshipPrograms() {
  const [programs, setPrograms] = useState<MentorshipProgram[]>(mockPrograms);

  const handleJoin = (id: string) => {
    setPrograms((prev) =>
      prev.map((program) =>
        program.id === id
          ? {
              ...program,
              isJoined: true,
              participantCount: program.participantCount + 1,
              menteeCount: program.menteeCount + 1,
            }
          : program
      )
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Mentorship Programs
          </h1>
          <p className="text-silver-mist mt-1">
            Join structured mentorship programs to accelerate your professional growth
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {programs.filter((p) => p.status === "active").length}
            </p>
            <p className="text-xs text-silver-mist">Active Programs</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {programs.reduce((acc, p) => acc + p.mentorCount, 0)}
            </p>
            <p className="text-xs text-silver-mist">Total Mentors</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {programs.reduce((acc, p) => acc + p.participantCount, 0)}
            </p>
            <p className="text-xs text-silver-mist">Total Participants</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center bg-slate-50 dark:bg-deep-cosmos">
            <p className="text-lg font-bold text-ink-black dark:text-pearl">
              {programs.filter((p) => p.isJoined).length}
            </p>
            <p className="text-xs text-silver-mist">My Programs</p>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          {programs.map((program) => {
            const style = statusStyles[program.status];
            const spotsRemaining = program.maxParticipants - program.participantCount;

            return (
              <div
                key={program.id}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Category Icon */}
                    <div className="w-14 h-14 rounded-xl bg-celestial-indigo/10 flex items-center justify-center text-celestial-indigo flex-shrink-0">
                      {categoryIcons[program.category] || <Users className="w-6 h-6" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
                          {program.name}
                        </h3>
                        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${program.status === "active" ? "animate-pulse" : ""}`} />
                          {style.label}
                        </span>
                        {program.isJoined && (
                          <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                            <CheckCircle2 className="w-3 h-3" />
                            Joined
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-silver-mist mt-1.5 line-clamp-2">
                        {program.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-silver-mist">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {program.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {program.participantCount}/{program.maxParticipants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          {program.mentorMenteeRatio} mentor:mentee
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {program.meetingFrequency}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {program.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs rounded-full bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Program Lead */}
                      <p className="text-xs text-silver-mist mt-2">
                        Program Lead: <span className="text-celestial-indigo">{program.programLead}</span>
                      </p>
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0 self-center">
                      {!program.isJoined && program.status !== "completed" && spotsRemaining > 0 && (
                        <>
                          <button
                            onClick={() => handleJoin(program.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            Join Program
                          </button>
                          <span className="text-xs text-silver-mist">
                            {spotsRemaining} spots remaining
                          </span>
                        </>
                      )}
                      {!program.isJoined && spotsRemaining <= 0 && (
                        <span className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-deep-cosmos text-silver-mist text-sm font-medium">
                          Full
                        </span>
                      )}
                      {program.isJoined && (
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-celestial-indigo text-celestial-indigo font-medium hover:bg-celestial-indigo/5 transition-colors">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
