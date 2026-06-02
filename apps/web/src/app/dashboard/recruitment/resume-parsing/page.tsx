'use client';

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import type { CandidateApplication } from '../types';
import { FileText, UploadCloud, ScanLine, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';

function getCandidateName(application: CandidateApplication, index: number): string {
  const fullName = `${application.firstName || ''} ${application.lastName || ''}`.trim();
  return fullName || (application as any).candidateName || `Candidate ${index + 1}`;
}

export default function ResumeParsingPage() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResumes, setParsedResumes] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParsedResumes();
  }, []);

  const fetchParsedResumes = async () => {
    try {
      setLoading(true);
      const data = await CandidateApplicationService.getApplications();
      // Filter applications that have resume data
      const withResumes = data.filter((app: CandidateApplication) => app.resumeUrl);
      setParsedResumes(withResumes);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParseResume = async (file: File) => {
    setIsParsing(true);
    try {
      // Parse resume logic here
      await fetchParsedResumes();
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsParsing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-silver-mist font-medium">Loading resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-indigo-500" />
            Resume Parsing
          </h1>
          <p className="text-slate-500 text-sm">
            AI-powered extraction of candidate data from CVs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 border-indigo-100 dark:border-indigo-900/50">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Drop resumes here</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              Support for PDF, DOCX, and TXT files. Bulk upload supported.
            </p>
          </div>
          <label className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors cursor-pointer inline-block">
            Select Files
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                const names = Array.from(files)
                  .map((f) => f.name)
                  .join(', ');
                alert(
                  `Selected ${files.length} file${files.length > 1 ? 's' : ''}: ${names}\n\nResume parsing service requires AI parsing setup — files would be sent to /api/v1/recruitment/resume-parser once configured.`
                );
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Parsed Resume Results */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-500" /> Parsed Resumes
            </h3>

            <div className="space-y-4">
              {parsedResumes.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No parsed resumes yet. Upload a resume to get started.</p>
                </div>
              )}
              {parsedResumes.map((resume, i) => {
                const name = getCandidateName(resume, i);
                const email = resume.email || '';
                const skills = resume.skills || [];

                return (
                  <div
                    key={resume.id || i}
                    className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{name}</div>
                          <div className="text-xs text-slate-500">{email || 'No email'}</div>
                        </div>
                      </div>
                      {resume.resumeUrl && (
                        <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resume on file
                        </span>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div>
                        <span className="block text-slate-400 font-bold uppercase mb-1 text-xs">
                          Skills
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 6).map((s: string) => (
                            <span
                              key={s}
                              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-bold text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
