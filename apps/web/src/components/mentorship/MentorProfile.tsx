"use client";

import React from "react";
import {
  Award,
  Users,
  Clock,
  Calendar,
  Star,
  MapPin,
  Mail,
  Linkedin,
  CheckCircle2,
} from "lucide-react";

interface MentorProfileData {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  linkedinUrl: string;
  avatar: string;
  expertiseTags: string[];
  yearsExperience: number;
  menteesCount: number;
  totalMentored: number;
  availability: "Available" | "Limited" | "Unavailable";
  availableSlots: string[];
  bio: string;
  achievements: string[];
  rating: number;
  reviewCount: number;
}

const mockProfile: MentorProfileData = {
  id: "m-001",
  name: "Dr. Sarah Chen",
  role: "VP of Engineering",
  department: "Technology",
  location: "San Francisco, CA",
  email: "sarah.chen@company.com",
  linkedinUrl: "https://linkedin.com/in/sarahchen",
  avatar: "/avatars/sarah.jpg",
  expertiseTags: [
    "System Design",
    "Technical Leadership",
    "Career Growth",
    "Architecture",
    "Team Scaling",
    "Distributed Systems",
  ],
  yearsExperience: 18,
  menteesCount: 2,
  totalMentored: 24,
  availability: "Available",
  availableSlots: [
    "Tuesdays 2:00 PM - 3:00 PM",
    "Thursdays 10:00 AM - 11:00 AM",
    "Fridays 4:00 PM - 5:00 PM",
  ],
  bio: "With 18 years in software engineering and technical leadership, I am passionate about developing the next generation of tech leaders. My mentoring focuses on helping engineers transition into leadership roles while maintaining their technical edge. I believe in building inclusive teams and creating sustainable engineering cultures.",
  achievements: [
    "Scaled engineering team from 12 to 120+",
    "Published author on distributed systems",
    "Speaker at 15+ industry conferences",
    "Founded internal women-in-tech mentorship program",
  ],
  rating: 4.9,
  reviewCount: 18,
};

const availabilityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Available: {
    bg: "bg-aurora-green/10",
    text: "text-aurora-green",
    dot: "bg-aurora-green",
  },
  Limited: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
  },
  Unavailable: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-500",
    dot: "bg-red-500",
  },
};

export default function MentorProfile() {
  const profile = mockProfile;
  const avail = availabilityConfig[profile.availability];

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Card */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          {/* Cover */}
          <div className="h-24 bg-gradient-to-r from-celestial-indigo to-nebula-purple/70" />

          {/* Profile Info */}
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-stellar-blue bg-celestial-indigo/20 flex items-center justify-center text-celestial-indigo font-bold text-2xl">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 pt-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-ink-black dark:text-pearl">
                    {profile.name}
                  </h1>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${avail.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${avail.dot} animate-pulse`} />
                    <span className={`text-xs font-medium ${avail.text}`}>
                      {profile.availability}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-silver-mist">
                  {profile.role} - {profile.department}
                </p>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="flex flex-wrap gap-4 text-sm text-silver-mist mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                <a href={profile.linkedinUrl} className="text-celestial-indigo hover:underline">
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
              <div className="text-center">
                <p className="text-lg font-bold text-ink-black dark:text-pearl">
                  {profile.yearsExperience}
                </p>
                <p className="text-xs text-silver-mist">Years Exp.</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-ink-black dark:text-pearl">
                  {profile.menteesCount}
                </p>
                <p className="text-xs text-silver-mist">Current Mentees</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-ink-black dark:text-pearl">
                  {profile.totalMentored}
                </p>
                <p className="text-xs text-silver-mist">Total Mentored</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <p className="text-lg font-bold text-ink-black dark:text-pearl">
                    {profile.rating}
                  </p>
                </div>
                <p className="text-xs text-silver-mist">({profile.reviewCount} reviews)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h2 className="text-sm font-semibold text-ink-black dark:text-pearl mb-2">About</h2>
          <p className="text-sm text-silver-mist leading-relaxed">{profile.bio}</p>
        </div>

        {/* Expertise Tags */}
        <div className="mt-4 rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h2 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">Expertise Areas</h2>
          <div className="flex flex-wrap gap-2">
            {profile.expertiseTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-sm rounded-full bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-4 rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h2 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-celestial-indigo" />
            Key Achievements
          </h2>
          <ul className="space-y-2">
            {profile.achievements.map((achievement, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-aurora-green mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ink-black dark:text-pearl">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Availability */}
        <div className="mt-4 rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h2 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-celestial-indigo" />
            Available Time Slots
          </h2>
          <div className="space-y-2">
            {profile.availableSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
                <Clock className="w-4 h-4 text-silver-mist" />
                <span className="text-sm text-ink-black dark:text-pearl">{slot}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors">
            <Users className="w-4 h-4" />
            Request Mentorship
          </button>
        </div>
      </div>
    </div>
  );
}
