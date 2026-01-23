"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Calendar } from "lucide-react";

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
}

const mockData: ParsedResumeData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  summary: "Senior Full-Stack Developer with 8+ years of experience building scalable web applications.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      startDate: "Jan 2021",
      endDate: "Present",
      description: "Led a team of 5 engineers building microservices architecture.",
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      startDate: "Mar 2018",
      endDate: "Dec 2020",
      description: "Built and maintained customer-facing React applications.",
    },
    {
      title: "Junior Developer",
      company: "WebAgency Co.",
      startDate: "Jun 2016",
      endDate: "Feb 2018",
      description: "Developed responsive websites for various clients.",
    },
  ],
  education: [
    { degree: "M.S. Computer Science", institution: "Stanford University", year: "2016" },
    { degree: "B.S. Computer Science", institution: "UC Berkeley", year: "2014" },
  ],
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "PostgreSQL", "GraphQL", "Redis"],
  certifications: [
    { name: "AWS Solutions Architect", issuer: "Amazon Web Services", year: "2022" },
    { name: "Certified Kubernetes Administrator", issuer: "CNCF", year: "2021" },
  ],
};

export default function ParsedResumeView() {
  const data = mockData;

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <h2 className="text-lg font-semibold text-ink-black dark:text-pearl mb-6">
        Parsed Resume
      </h2>

      {/* Contact Info */}
      <div className="mb-6 pb-6 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
            <User className="h-6 w-6 text-celestial-indigo" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ink-black dark:text-pearl">{data.name}</h3>
            <p className="text-sm text-silver-mist">{data.summary}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl">
            <Mail className="h-4 w-4 text-silver-mist" />
            {data.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl">
            <Phone className="h-4 w-4 text-silver-mist" />
            {data.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl">
            <MapPin className="h-4 w-4 text-silver-mist" />
            {data.location}
          </div>
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="mb-6 pb-6 border-b border-cloud dark:border-nebula-purple/50">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink-black dark:text-pearl mb-4">
          <Briefcase className="h-4 w-4 text-celestial-indigo" />
          Experience
        </h4>
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-cloud dark:bg-nebula-purple/50" />
          {data.experience.map((exp, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full bg-celestial-indigo" />
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{exp.title}</p>
              <p className="text-xs text-celestial-indigo">{exp.company}</p>
              <p className="text-xs text-silver-mist flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {exp.startDate} - {exp.endDate}
              </p>
              <p className="text-xs text-silver-mist mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6 pb-6 border-b border-cloud dark:border-nebula-purple/50">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink-black dark:text-pearl mb-3">
          <GraduationCap className="h-4 w-4 text-celestial-indigo" />
          Education
        </h4>
        <div className="space-y-2">
          {data.education.map((edu, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{edu.degree}</p>
                <p className="text-xs text-silver-mist">{edu.institution}</p>
              </div>
              <span className="text-xs text-silver-mist">{edu.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6 pb-6 border-b border-cloud dark:border-nebula-purple/50">
        <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full text-xs font-medium bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink-black dark:text-pearl mb-3">
          <Award className="h-4 w-4 text-celestial-indigo" />
          Certifications
        </h4>
        <div className="space-y-2">
          {data.certifications.map((cert, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-cloud dark:border-nebula-purple/50">
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{cert.name}</p>
                <p className="text-xs text-silver-mist">{cert.issuer}</p>
              </div>
              <span className="text-xs text-silver-mist">{cert.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
