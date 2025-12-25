/**
 * useLearning Hook
 * 
 * Centralized business logic and state management for Learning Management System.
 * Provides methods for course management, enrollments, assessments, certifications, and more.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
    Course,
    LearningPath,
    Enrollment,
    Assessment,
    AssessmentAttempt,
    Certification,
    TrainingSession,
    ExternalTraining,
    SkillGapAnalysis,
    MentoringProgram,
    TrainingBudget,
    KnowledgeArticle,
    TrainingFeedback,
    LearningAnalytics,
    LearningSettings,
} from '../types';
import {
    CourseService,
    LearningPathService,
    EnrollmentService,
    AssessmentService,
    CertificationService,
    TrainingSessionService,
    ExternalTrainingService,
    SkillGapService,
    MentoringService,
    TrainingBudgetService,
    KnowledgeBaseService,
    TrainingFeedbackService,
    LearningAnalyticsService,
    LearningSettingsService,
} from '../services';
import {
    generateSampleCourses,
    generateSampleLearningPaths,
    generateSampleEnrollments,
    generateSampleAssessments,
    generateSampleCertifications,
    generateSampleTrainingSessions,
    generateSampleExternalTraining,
    generateSampleSkillGapAnalysis,
    generateSampleMentoringPrograms,
    generateSampleTrainingBudgets,
    generateSampleKnowledgeArticles,
    generateSampleTrainingFeedback,
    generateSampleLearningSettings,
} from '../data';
import { useToast } from './useToast';

export const useLearning = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttempt[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [externalTraining, setExternalTraining] = useState<ExternalTraining[]>([]);
    const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis[]>([]);
    const [mentoringPrograms, setMentoringPrograms] = useState<MentoringProgram[]>([]);
    const [trainingBudgets, setTrainingBudgets] = useState<TrainingBudget[]>([]);
    const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
    const [trainingFeedback, setTrainingFeedback] = useState<TrainingFeedback[]>([]);
    const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
    const [settings, setSettings] = useState<LearningSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    // Initialize data
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setIsLoading(true);
            const [
                coursesData,
                pathsData,
                enrollmentsData,
                assessmentsData,
                certificationsData,
                sessionsData,
                externalData,
                skillGapsData,
                mentoringData,
                budgetsData,
                articlesData,
                feedbackData,
                analyticsData,
                settingsData,
            ] = await Promise.all([
                CourseService.getCourses(),
                LearningPathService.getLearningPaths(),
                EnrollmentService.getEnrollments(),
                AssessmentService.getAssessments(),
                CertificationService.getCertifications(),
                TrainingSessionService.getTrainingSessions(),
                ExternalTrainingService.getExternalTraining(),
                SkillGapService.getSkillGapAnalysis(),
                MentoringService.getMentoringPrograms(),
                TrainingBudgetService.getTrainingBudgets(),
                KnowledgeBaseService.getKnowledgeArticles(),
                TrainingFeedbackService.getTrainingFeedback(),
                LearningAnalyticsService.getAnalytics(),
                LearningSettingsService.getSettings(),
            ]);

            // Initialize with sample data if empty
            if (coursesData.length === 0) {
                const sampleCourses = generateSampleCourses();
                for (const course of sampleCourses) {
                    await CourseService.createCourse(course);
                }
                setCourses(sampleCourses);
            } else {
                setCourses(coursesData);
            }

            if (pathsData.length === 0) {
                const samplePaths = generateSampleLearningPaths();
                for (const path of samplePaths) {
                    await LearningPathService.createLearningPath(path);
                }
                setLearningPaths(samplePaths);
            } else {
                setLearningPaths(pathsData);
            }

            if (enrollmentsData.length === 0) {
                const sampleEnrollments = generateSampleEnrollments();
                for (const enrollment of sampleEnrollments) {
                    await EnrollmentService.createEnrollment(enrollment);
                }
                setEnrollments(sampleEnrollments);
            } else {
                setEnrollments(enrollmentsData);
            }

            if (assessmentsData.length === 0) {
                const sampleAssessments = generateSampleAssessments();
                for (const assessment of sampleAssessments) {
                    await AssessmentService.createAssessment(assessment);
                }
                setAssessments(sampleAssessments);
            } else {
                setAssessments(assessmentsData);
            }

            if (certificationsData.length === 0) {
                const sampleCerts = generateSampleCertifications();
                for (const cert of sampleCerts) {
                    await CertificationService.issueCertification(cert);
                }
                setCertifications(sampleCerts);
            } else {
                setCertifications(certificationsData);
            }

            if (sessionsData.length === 0) {
                const sampleSessions = generateSampleTrainingSessions();
                for (const session of sampleSessions) {
                    await TrainingSessionService.createTrainingSession(session);
                }
                setTrainingSessions(sampleSessions);
            } else {
                setTrainingSessions(sessionsData);
            }

            if (externalData.length === 0) {
                const sampleExternal = generateSampleExternalTraining();
                for (const ext of sampleExternal) {
                    await ExternalTrainingService.createExternalTraining(ext);
                }
                setExternalTraining(sampleExternal);
            } else {
                setExternalTraining(externalData);
            }

            if (skillGapsData.length === 0) {
                const sampleGaps = generateSampleSkillGapAnalysis();
                for (const gap of sampleGaps) {
                    await SkillGapService.createSkillGapAnalysis(gap);
                }
                setSkillGaps(sampleGaps);
            } else {
                setSkillGaps(skillGapsData);
            }

            if (mentoringData.length === 0) {
                const sampleMentoring = generateSampleMentoringPrograms();
                for (const program of sampleMentoring) {
                    await MentoringService.createMentoringProgram(program);
                }
                setMentoringPrograms(sampleMentoring);
            } else {
                setMentoringPrograms(mentoringData);
            }

            if (budgetsData.length === 0) {
                const sampleBudgets = generateSampleTrainingBudgets();
                for (const budget of sampleBudgets) {
                    await TrainingBudgetService.createTrainingBudget(budget);
                }
                setTrainingBudgets(sampleBudgets);
            } else {
                setTrainingBudgets(budgetsData);
            }

            if (articlesData.length === 0) {
                const sampleArticles = generateSampleKnowledgeArticles();
                for (const article of sampleArticles) {
                    await KnowledgeBaseService.createKnowledgeArticle(article);
                }
                setKnowledgeArticles(sampleArticles);
            } else {
                setKnowledgeArticles(articlesData);
            }

            if (feedbackData.length === 0) {
                const sampleFeedback = generateSampleTrainingFeedback();
                setTrainingFeedback(sampleFeedback);
            } else {
                setTrainingFeedback(feedbackData);
            }

            setAnalytics(analyticsData);

            if (!settingsData) {
                const sampleSettings = generateSampleLearningSettings();
                setSettings(sampleSettings);
            } else {
                setSettings(settingsData);
            }
        } catch {
            toast.error('Failed to load learning data');
            console.error('Load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Course Methods
    const createCourse = useCallback(async (data: Course) => {
        try {
            setIsSaving(true);
            const created = await CourseService.createCourse(data);
            setCourses(prev => [...prev, created]);
            toast.success('Course created successfully!');
            return created;
        } catch {
            toast.error((error as Error).message || 'Failed to create course');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
        try {
            setIsSaving(true);
            const updated = await CourseService.updateCourse(id, updates);
            setCourses(prev => prev.map(c => c.id === id ? updated : c));
            toast.success('Course updated successfully!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to update course');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const publishCourse = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const published = await CourseService.publishCourse(id);
            setCourses(prev => prev.map(c => c.id === id ? published : c));
            toast.success('Course published!');
            return published;
        } catch {
            toast.error((error as Error).message || 'Failed to publish course');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Enrollment Methods
    const createEnrollment = useCallback(async (data: Enrollment) => {
        try {
            setIsSaving(true);
            const created = await EnrollmentService.createEnrollment(data);
            setEnrollments(prev => [...prev, created]);
            toast.success('Enrolled successfully!');
            return created;
        } catch {
            toast.error((error as Error).message || 'Failed to enroll');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const startEnrollment = useCallback(async (id: string) => {
        try {
            setIsSaving(true);
            const started = await EnrollmentService.startEnrollment(id);
            setEnrollments(prev => prev.map(e => e.id === id ? started : e));
            toast.success('Course started!');
            return started;
        } catch {
            toast.error((error as Error).message || 'Failed to start course');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const completeEnrollment = useCallback(async (id: string, score: number) => {
        try {
            setIsSaving(true);
            const completed = await EnrollmentService.completeEnrollment(id, score);
            setEnrollments(prev => prev.map(e => e.id === id ? completed : e));
            toast.success('Course completed!');
            return completed;
        } catch {
            toast.error((error as Error).message || 'Failed to complete course');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const updateProgress = useCallback(async (id: string, progress: number, timeSpent: number) => {
        try {
            const updated = await EnrollmentService.updateProgress(id, progress, timeSpent);
            setEnrollments(prev => prev.map(e => e.id === id ? updated : e));
            return updated;
        } catch {
            console.error('Failed to update progress:', error);
            throw error;
        }
    }, []);

    // Assessment Methods
    const submitAssessment = useCallback(async (data: AssessmentAttempt) => {
        try {
            setIsSaving(true);
            const submitted = await AssessmentService.submitAssessment(data);
            setAssessmentAttempts(prev => [...prev, submitted]);
            toast.success('Assessment submitted!');
            return submitted;
        } catch {
            toast.error((error as Error).message || 'Failed to submit assessment');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Certification Methods
    const issueCertification = useCallback(async (data: Certification) => {
        try {
            setIsSaving(true);
            const issued = await CertificationService.issueCertification(data);
            setCertifications(prev => [...prev, issued]);
            toast.success('Certificate issued!');
            return issued;
        } catch {
            toast.error((error as Error).message || 'Failed to issue certificate');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Training Session Methods
    const createTrainingSession = useCallback(async (data: TrainingSession) => {
        try {
            setIsSaving(true);
            const created = await TrainingSessionService.createTrainingSession(data);
            setTrainingSessions(prev => [...prev, created]);
            toast.success('Training session created!');
            return created;
        } catch {
            toast.error((error as Error).message || 'Failed to create session');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const markAttendance = useCallback(async (sessionId: string, learnerId: string, status: string) => {
        try {
            setIsSaving(true);
            const updated = await TrainingSessionService.markAttendance(sessionId, learnerId, status);
            setTrainingSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
            toast.success('Attendance marked!');
            return updated;
        } catch {
            toast.error((error as Error).message || 'Failed to mark attendance');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // External Training Methods
    const createExternalTraining = useCallback(async (data: ExternalTraining) => {
        try {
            setIsSaving(true);
            const created = await ExternalTrainingService.createExternalTraining(data);
            setExternalTraining(prev => [...prev, created]);
            toast.success('External training request created!');
            return created;
        } catch {
            toast.error((error as Error).message || 'Failed to create external training');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const approveExternalTraining = useCallback(async (id: string, approvedBy: string) => {
        try {
            setIsSaving(true);
            const approved = await ExternalTrainingService.approveExternalTraining(id, approvedBy);
            setExternalTraining(prev => prev.map(t => t.id === id ? approved : t));
            toast.success('External training approved!');
            return approved;
        } catch {
            toast.error((error as Error).message || 'Failed to approve training');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Skill Gap Methods
    const createSkillGapAnalysis = useCallback(async (data: SkillGapAnalysis) => {
        try {
            setIsSaving(true);
            const created = await SkillGapService.createSkillGapAnalysis(data);
            setSkillGaps(prev => [...prev, created]);
            toast.success('Skill gap analysis created!');
            return created;
        } catch {
            toast.error((error as Error).message || 'Failed to create analysis');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Feedback Methods
    const submitFeedback = useCallback(async (data: TrainingFeedback) => {
        try {
            setIsSaving(true);
            const submitted = await TrainingFeedbackService.submitTrainingFeedback(data);
            setTrainingFeedback(prev => [...prev, submitted]);
            toast.success('Feedback submitted!');
            return submitted;
        } catch {
            toast.error((error as Error).message || 'Failed to submit feedback');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Analytics Methods
    const refreshAnalytics = useCallback(async () => {
        try {
            const analyticsData = await LearningAnalyticsService.getAnalytics();
            setAnalytics(analyticsData);
        } catch {
            toast.error('Failed to refresh analytics');
            console.error('Analytics error:', error);
        }
    }, [toast]);

    return {
        // State
        courses,
        learningPaths,
        enrollments,
        assessments,
        assessmentAttempts,
        certifications,
        trainingSessions,
        externalTraining,
        skillGaps,
        mentoringPrograms,
        trainingBudgets,
        knowledgeArticles,
        trainingFeedback,
        analytics,
        settings,
        isLoading,
        isSaving,

        // Course Methods
        createCourse,
        updateCourse,
        publishCourse,

        // Enrollment Methods
        createEnrollment,
        startEnrollment,
        completeEnrollment,
        updateProgress,

        // Assessment Methods
        submitAssessment,

        // Certification Methods
        issueCertification,

        // Training Session Methods
        createTrainingSession,
        markAttendance,

        // External Training Methods
        createExternalTraining,
        approveExternalTraining,

        // Skill Gap Methods
        createSkillGapAnalysis,

        // Feedback Methods
        submitFeedback,

        // Analytics Methods
        refreshAnalytics,
    };
};
