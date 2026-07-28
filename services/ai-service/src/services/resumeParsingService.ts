import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import OpenAI from 'openai';

export interface ParseResumeParams {
  fileBuffer: Buffer;
  fileType: 'pdf' | 'docx' | 'txt';
  fileName: string;
}

export interface ParsedResume {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
  rawText: string;
  confidence: number;
  parsedAt: string;
}

export interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  website?: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements?: string[];
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  honors?: string[];
}

export interface Skill {
  name: string;
  category?: 'technical' | 'soft' | 'language' | 'tool' | 'other';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Certification {
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Language {
  name: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export class ResumeParsingService {
  /**
   * Parse a resume file (PDF or DOCX) and extract structured data
   */
  async parseResume(params: ParseResumeParams): Promise<ParsedResume> {
    const rawText = await this.extractText(params);
    const structured = await this.extractStructuredData(rawText);

    return {
      ...structured,
      rawText,
      confidence: this.calculateConfidence(structured),
      parsedAt: new Date().toISOString(),
    };
  }

  /**
   * Extract raw text from a PDF file
   */
  async parsePDF(fileBuffer: Buffer): Promise<string> {
    try {
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return '';
    }
  }

  /**
   * Extract raw text from a DOCX file
   */
  async parseDOCX(fileBuffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      return '';
    }
  }

  /**
   * Extract text based on file type
   */
  private async extractText(params: ParseResumeParams): Promise<string> {
    switch (params.fileType) {
      case 'pdf':
        return this.parsePDF(params.fileBuffer);
      case 'docx':
        return this.parseDOCX(params.fileBuffer);
      case 'txt':
        return params.fileBuffer.toString('utf-8');
      default:
        throw new Error('Unsupported file type: ' + params.fileType);
    }
  }

  /**
   * Use AI/NLP to extract structured data from raw text
   */
  private async extractStructuredData(rawText: string): Promise<Omit<ParsedResume, 'rawText' | 'confidence' | 'parsedAt'>> {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'mock-key' });
      // In a real scenario we would call the chat completions API, here we provide a mock parsed response if the key is invalid
      if (process.env.OPENAI_API_KEY) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: `Parse the following resume text into JSON format:\n\n${rawText}`}],
          response_format: { type: 'json_object' }
        });
        const parsed = JSON.parse(response.choices[0].message.content || '{}');
        return {
          personalInfo: parsed.personalInfo || {},
          experience: parsed.experience || [],
          education: parsed.education || [],
          skills: parsed.skills || [],
          certifications: parsed.certifications || [],
          languages: parsed.languages || [],
        };
      }
    } catch (error) {
      console.error('Error with OpenAI API:', error);
    }
    
    return {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
    };
  }

  /**
   * Calculate confidence score based on how many fields were extracted
   */
  private calculateConfidence(data: Omit<ParsedResume, 'rawText' | 'confidence' | 'parsedAt'>): number {
    let score = 0;
    let maxScore = 0;

    // Personal info fields
    maxScore += 4;
    if (data.personalInfo.fullName) score++;
    if (data.personalInfo.email) score++;
    if (data.personalInfo.phone) score++;
    if (data.personalInfo.location) score++;

    // Experience
    maxScore += 2;
    if (data.experience.length > 0) score += 2;

    // Education
    maxScore += 1;
    if (data.education.length > 0) score++;

    // Skills
    maxScore += 1;
    if (data.skills.length > 0) score++;

    return maxScore > 0 ? score / maxScore : 0;
  }
}

export default new ResumeParsingService();
