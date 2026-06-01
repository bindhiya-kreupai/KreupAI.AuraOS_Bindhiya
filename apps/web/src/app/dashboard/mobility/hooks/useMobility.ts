'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  VisaImmigrationService,
  RelocationPackageService,
  ExpatTaxService,
  MobilityAnalyticsService,
  MobilitySettingsService,
} from '../services';
import type {
  VisaApplication,
  VisaApplicationStatus,
  VisaType,
  ImmigrationCompliance,
  RelocationPackage,
  RelocationTask,
  RelocationVendor,
  RelocationExpense,
  ExpatTaxProfile,
  TaxReturn,
  TaxProjection,
  MobilityAnalytics,
  MobilitySettings,
  Document,
  Priority,
} from '../types';

interface UseMobilityReturn {
  // Visa & Immigration State
  visaApplications: VisaApplication[];
  selectedVisaApplication: VisaApplication | null;
  immigrationCompliance: ImmigrationCompliance[];
  visaLoading: boolean;
  visaError: string | null;

  // Relocation State
  relocationPackages: RelocationPackage[];
  selectedRelocationPackage: RelocationPackage | null;
  relocationLoading: boolean;
  relocationError: string | null;

  // Expat Tax State
  expatTaxProfiles: ExpatTaxProfile[];
  selectedExpatTaxProfile: ExpatTaxProfile | null;
  taxLoading: boolean;
  taxError: string | null;

  // Analytics State
  analytics: MobilityAnalytics | null;
  analyticsLoading: boolean;

  // Settings State
  settings: MobilitySettings | null;
  settingsLoading: boolean;

  // Visa & Immigration Methods
  fetchVisaApplications: () => Promise<void>;
  fetchVisaApplicationById: (applicationId: string) => Promise<void>;
  createVisaApplication: (application: Partial<VisaApplication>) => Promise<VisaApplication>;
  updateVisaApplication: (applicationId: string, updates: Partial<VisaApplication>) => Promise<VisaApplication>;
  deleteVisaApplication: (applicationId: string) => Promise<void>;
  submitVisaApplication: (applicationId: string) => Promise<VisaApplication>;
  approveVisa: (
    applicationId: string,
    visaNumber: string,
    issueDate: Date,
    expiryDate: Date
  ) => Promise<VisaApplication>;
  rejectVisa: (applicationId: string, reason: string) => Promise<VisaApplication>;
  uploadVisaDocument: (applicationId: string, document: Document) => Promise<VisaApplication>;
  fetchImmigrationCompliance: () => Promise<void>;
  updateComplianceStatus: (complianceId: string, status: string) => Promise<ImmigrationCompliance>;

  // Relocation Methods
  fetchRelocationPackages: () => Promise<void>;
  fetchRelocationPackageById: (packageId: string) => Promise<void>;
  createRelocationPackage: (pkg: Partial<RelocationPackage>) => Promise<RelocationPackage>;
  updateRelocationPackage: (packageId: string, updates: Partial<RelocationPackage>) => Promise<RelocationPackage>;
  deleteRelocationPackage: (packageId: string) => Promise<void>;
  updateRelocationTask: (packageId: string, taskId: string, updates: Partial<RelocationTask>) => Promise<RelocationPackage>;
  addRelocationVendor: (packageId: string, vendor: RelocationVendor) => Promise<RelocationPackage>;
  recordRelocationExpense: (packageId: string, expense: RelocationExpense) => Promise<RelocationPackage>;
  approveRelocationExpense: (packageId: string, expenseId: string) => Promise<RelocationPackage>;

  // Expat Tax Methods
  fetchExpatTaxProfiles: () => Promise<void>;
  fetchExpatTaxProfileById: (profileId: string) => Promise<void>;
  createExpatTaxProfile: (profile: Partial<ExpatTaxProfile>) => Promise<ExpatTaxProfile>;
  updateExpatTaxProfile: (profileId: string, updates: Partial<ExpatTaxProfile>) => Promise<ExpatTaxProfile>;
  deleteExpatTaxProfile: (profileId: string) => Promise<void>;
  createTaxReturn: (profileId: string, taxReturn: Partial<TaxReturn>) => Promise<ExpatTaxProfile>;
  updateTaxReturn: (profileId: string, returnId: string, updates: Partial<TaxReturn>) => Promise<ExpatTaxProfile>;
  calculateTaxLiability: (profileId: string, taxYear: number, country: string) => Promise<number>;
  createTaxProjection: (profileId: string, projection: Partial<TaxProjection>) => Promise<ExpatTaxProfile>;

  // Analytics Methods
  fetchAnalytics: () => Promise<void>;

  // Settings Methods
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<MobilitySettings>) => Promise<MobilitySettings>;

  // Utility Methods
  clearSelectedVisaApplication: () => void;
  clearSelectedRelocationPackage: () => void;
  clearSelectedExpatTaxProfile: () => void;
  clearErrors: () => void;
}

export function useMobility(): UseMobilityReturn {
  // Visa & Immigration State
  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>([]);
  const [selectedVisaApplication, setSelectedVisaApplication] = useState<VisaApplication | null>(null);
  const [immigrationCompliance, setImmigrationCompliance] = useState<ImmigrationCompliance[]>([]);
  const [visaLoading, setVisaLoading] = useState(false);
  const [visaError, setVisaError] = useState<string | null>(null);

  // Relocation State
  const [relocationPackages, setRelocationPackages] = useState<RelocationPackage[]>([]);
  const [selectedRelocationPackage, setSelectedRelocationPackage] = useState<RelocationPackage | null>(null);
  const [relocationLoading, setRelocationLoading] = useState(false);
  const [relocationError, setRelocationError] = useState<string | null>(null);

  // Expat Tax State
  const [expatTaxProfiles, setExpatTaxProfiles] = useState<ExpatTaxProfile[]>([]);
  const [selectedExpatTaxProfile, setSelectedExpatTaxProfile] = useState<ExpatTaxProfile | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<MobilityAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<MobilitySettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Visa & Immigration Methods
  const fetchVisaApplications = useCallback(async () => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const applications = await VisaImmigrationService.getVisaApplications();
      setVisaApplications(applications);
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to fetch visa applications');
    } finally {
      setVisaLoading(false);
    }
  }, []);

  const fetchVisaApplicationById = useCallback(async (applicationId: string) => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const application = await VisaImmigrationService.getVisaApplicationById(applicationId);
      setSelectedVisaApplication(application);
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to fetch visa application');
    } finally {
      setVisaLoading(false);
    }
  }, []);

  const createVisaApplication = useCallback(async (application: Partial<VisaApplication>) => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const newApplication = await VisaImmigrationService.createVisaApplication(application);
      setVisaApplications((prev) => [...prev, newApplication]);
      return newApplication;
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to create visa application');
      throw error;
    } finally {
      setVisaLoading(false);
    }
  }, []);

  const updateVisaApplication = useCallback(async (applicationId: string, updates: Partial<VisaApplication>) => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const updatedApplication = await VisaImmigrationService.updateVisaApplication(applicationId, updates);
      setVisaApplications((prev) =>
        prev.map((app) => (app.applicationId === applicationId ? updatedApplication : app))
      );
      if (selectedVisaApplication?.applicationId === applicationId) {
        setSelectedVisaApplication(updatedApplication);
      }
      return updatedApplication;
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to update visa application');
      throw error;
    } finally {
      setVisaLoading(false);
    }
  }, [selectedVisaApplication]);

  const deleteVisaApplication = useCallback(async (applicationId: string) => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      await VisaImmigrationService.deleteVisaApplication(applicationId);
      setVisaApplications((prev) => prev.filter((app) => app.applicationId !== applicationId));
      if (selectedVisaApplication?.applicationId === applicationId) {
        setSelectedVisaApplication(null);
      }
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to delete visa application');
      throw error;
    } finally {
      setVisaLoading(false);
    }
  }, [selectedVisaApplication]);

  const submitVisaApplication = useCallback(async (applicationId: string) => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const submittedApplication = await VisaImmigrationService.submitVisaApplication(applicationId);
      setVisaApplications((prev) =>
        prev.map((app) => (app.applicationId === applicationId ? submittedApplication : app))
      );
      if (selectedVisaApplication?.applicationId === applicationId) {
        setSelectedVisaApplication(submittedApplication);
      }
      return submittedApplication;
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to submit visa application');
      throw error;
    } finally {
      setVisaLoading(false);
    }
  }, [selectedVisaApplication]);

  const approveVisa = useCallback(
    async (applicationId: string, visaNumber: string, issueDate: Date, expiryDate: Date) => {
      setVisaLoading(true);
      setVisaError(null);
      try {
        const approvedApplication = await VisaImmigrationService.approveVisa(
          applicationId,
          visaNumber,
          issueDate,
          expiryDate
        );
        setVisaApplications((prev) =>
          prev.map((app) => (app.applicationId === applicationId ? approvedApplication : app))
        );
        if (selectedVisaApplication?.applicationId === applicationId) {
          setSelectedVisaApplication(approvedApplication);
        }
        return approvedApplication;
      } catch (error) {
        setVisaError(error instanceof Error ? error.message : 'Failed to approve visa');
        throw error;
      } finally {
        setVisaLoading(false);
      }
    },
    [selectedVisaApplication]
  );

  const rejectVisa = useCallback(
    async (applicationId: string, reason: string) => {
      setVisaLoading(true);
      setVisaError(null);
      try {
        const rejectedApplication = await VisaImmigrationService.rejectVisa(applicationId, reason);
        setVisaApplications((prev) =>
          prev.map((app) => (app.applicationId === applicationId ? rejectedApplication : app))
        );
        if (selectedVisaApplication?.applicationId === applicationId) {
          setSelectedVisaApplication(rejectedApplication);
        }
        return rejectedApplication;
      } catch (error) {
        setVisaError(error instanceof Error ? error.message : 'Failed to reject visa');
        throw error;
      } finally {
        setVisaLoading(false);
      }
    },
    [selectedVisaApplication]
  );

  const uploadVisaDocument = useCallback(
    async (applicationId: string, document: Document) => {
      setVisaLoading(true);
      setVisaError(null);
      try {
        const updatedApplication = await VisaImmigrationService.uploadDocument(applicationId, document);
        setVisaApplications((prev) =>
          prev.map((app) => (app.applicationId === applicationId ? updatedApplication : app))
        );
        if (selectedVisaApplication?.applicationId === applicationId) {
          setSelectedVisaApplication(updatedApplication);
        }
        return updatedApplication;
      } catch (error) {
        setVisaError(error instanceof Error ? error.message : 'Failed to upload document');
        throw error;
      } finally {
        setVisaLoading(false);
      }
    },
    [selectedVisaApplication]
  );

  const fetchImmigrationCompliance = useCallback(async () => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const compliance = await VisaImmigrationService.getImmigrationCompliance();
      setImmigrationCompliance(compliance);
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to fetch immigration compliance');
    } finally {
      setVisaLoading(false);
    }
  }, []);

  const updateComplianceStatus = useCallback(async (complianceId: string, status: string) => {
    setVisaLoading(true);
    setVisaError(null);
    try {
      const updatedCompliance = await VisaImmigrationService.updateComplianceStatus(complianceId, status);
      setImmigrationCompliance((prev) =>
        prev.map((comp) => (comp.complianceId === complianceId ? updatedCompliance : comp))
      );
      return updatedCompliance;
    } catch (error) {
      setVisaError(error instanceof Error ? error.message : 'Failed to update compliance status');
      throw error;
    } finally {
      setVisaLoading(false);
    }
  }, []);

  // Relocation Methods
  const fetchRelocationPackages = useCallback(async () => {
    setRelocationLoading(true);
    setRelocationError(null);
    try {
      const packages = await RelocationPackageService.getAllRelocationPackages();
      setRelocationPackages(packages);
    } catch (error) {
      setRelocationError(error instanceof Error ? error.message : 'Failed to fetch relocation packages');
    } finally {
      setRelocationLoading(false);
    }
  }, []);

  const fetchRelocationPackageById = useCallback(async (packageId: string) => {
    setRelocationLoading(true);
    setRelocationError(null);
    try {
      const pkg = await RelocationPackageService.getRelocationPackageById(packageId);
      setSelectedRelocationPackage(pkg);
    } catch (error) {
      setRelocationError(error instanceof Error ? error.message : 'Failed to fetch relocation package');
    } finally {
      setRelocationLoading(false);
    }
  }, []);

  const createRelocationPackage = useCallback(async (pkg: Partial<RelocationPackage>) => {
    setRelocationLoading(true);
    setRelocationError(null);
    try {
      const newPackage = await RelocationPackageService.createRelocationPackage(pkg);
      setRelocationPackages((prev) => [...prev, newPackage]);
      return newPackage;
    } catch (error) {
      setRelocationError(error instanceof Error ? error.message : 'Failed to create relocation package');
      throw error;
    } finally {
      setRelocationLoading(false);
    }
  }, []);

  const updateRelocationPackage = useCallback(
    async (packageId: string, updates: Partial<RelocationPackage>) => {
      setRelocationLoading(true);
      setRelocationError(null);
      try {
        const updatedPackage = await RelocationPackageService.updateRelocationPackage(packageId, updates);
        setRelocationPackages((prev) => prev.map((pkg) => (pkg.packageId === packageId ? updatedPackage : pkg)));
        if (selectedRelocationPackage?.packageId === packageId) {
          setSelectedRelocationPackage(updatedPackage);
        }
        return updatedPackage;
      } catch (error) {
        setRelocationError(error instanceof Error ? error.message : 'Failed to update relocation package');
        throw error;
      } finally {
        setRelocationLoading(false);
      }
    },
    [selectedRelocationPackage]
  );

  const deleteRelocationPackage = useCallback(
    async (packageId: string) => {
      setRelocationLoading(true);
      setRelocationError(null);
      try {
        await RelocationPackageService.deleteRelocationPackage(packageId);
        setRelocationPackages((prev) => prev.filter((pkg) => pkg.packageId !== packageId));
        if (selectedRelocationPackage?.packageId === packageId) {
          setSelectedRelocationPackage(null);
        }
      } catch (error) {
        setRelocationError(error instanceof Error ? error.message : 'Failed to delete relocation package');
        throw error;
      } finally {
        setRelocationLoading(false);
      }
    },
    [selectedRelocationPackage]
  );

  const updateRelocationTask = useCallback(
    async (packageId: string, taskId: string, updates: Partial<RelocationTask>) => {
      setRelocationLoading(true);
      setRelocationError(null);
      try {
        const updatedPackage = await RelocationPackageService.updateTask(packageId, taskId, updates);
        setRelocationPackages((prev) => prev.map((pkg) => (pkg.packageId === packageId ? updatedPackage : pkg)));
        if (selectedRelocationPackage?.packageId === packageId) {
          setSelectedRelocationPackage(updatedPackage);
        }
        return updatedPackage;
      } catch (error) {
        setRelocationError(error instanceof Error ? error.message : 'Failed to update relocation task');
        throw error;
      } finally {
        setRelocationLoading(false);
      }
    },
    [selectedRelocationPackage]
  );

  const addRelocationVendor = useCallback(
    async (packageId: string, vendor: RelocationVendor) => {
      setRelocationLoading(true);
      setRelocationError(null);
      try {
        const updatedPackage = await RelocationPackageService.addVendor(packageId, vendor);
        setRelocationPackages((prev) => prev.map((pkg) => (pkg.packageId === packageId ? updatedPackage : pkg)));
        if (selectedRelocationPackage?.packageId === packageId) {
          setSelectedRelocationPackage(updatedPackage);
        }
        return updatedPackage;
      } catch (error) {
        setRelocationError(error instanceof Error ? error.message : 'Failed to add vendor');
        throw error;
      } finally {
        setRelocationLoading(false);
      }
    },
    [selectedRelocationPackage]
  );

  const recordRelocationExpense = useCallback(
    async (packageId: string, expense: RelocationExpense) => {
      setRelocationLoading(true);
      setRelocationError(null);
      try {
        const updatedPackage = await RelocationPackageService.recordExpense(packageId, expense);
        setRelocationPackages((prev) => prev.map((pkg) => (pkg.packageId === packageId ? updatedPackage : pkg)));
        if (selectedRelocationPackage?.packageId === packageId) {
          setSelectedRelocationPackage(updatedPackage);
        }
        return updatedPackage;
      } catch (error) {
        setRelocationError(error instanceof Error ? error.message : 'Failed to record expense');
        throw error;
      } finally {
        setRelocationLoading(false);
      }
    },
    [selectedRelocationPackage]
  );

  const approveRelocationExpense = useCallback(
    async (packageId: string, expenseId: string) => {
      setRelocationLoading(true);
      setRelocationError(null);
      try {
        const updatedPackage = await RelocationPackageService.approveExpense(packageId, expenseId);
        setRelocationPackages((prev) => prev.map((pkg) => (pkg.packageId === packageId ? updatedPackage : pkg)));
        if (selectedRelocationPackage?.packageId === packageId) {
          setSelectedRelocationPackage(updatedPackage);
        }
        return updatedPackage;
      } catch (error) {
        setRelocationError(error instanceof Error ? error.message : 'Failed to approve expense');
        throw error;
      } finally {
        setRelocationLoading(false);
      }
    },
    [selectedRelocationPackage]
  );

  // Expat Tax Methods
  const fetchExpatTaxProfiles = useCallback(async () => {
    setTaxLoading(true);
    setTaxError(null);
    try {
      const profiles = await ExpatTaxService.getAllExpatTaxProfiles();
      setExpatTaxProfiles(profiles);
    } catch (error) {
      setTaxError(error instanceof Error ? error.message : 'Failed to fetch expat tax profiles');
    } finally {
      setTaxLoading(false);
    }
  }, []);

  const fetchExpatTaxProfileById = useCallback(async (profileId: string) => {
    setTaxLoading(true);
    setTaxError(null);
    try {
      const profile = await ExpatTaxService.getTaxProfileById(profileId);
      setSelectedExpatTaxProfile(profile);
    } catch (error) {
      setTaxError(error instanceof Error ? error.message : 'Failed to fetch expat tax profile');
    } finally {
      setTaxLoading(false);
    }
  }, []);

  const createExpatTaxProfile = useCallback(async (profile: Partial<ExpatTaxProfile>) => {
    setTaxLoading(true);
    setTaxError(null);
    try {
      const newProfile = await ExpatTaxService.createTaxProfile(profile);
      setExpatTaxProfiles((prev) => [...prev, newProfile]);
      return newProfile;
    } catch (error) {
      setTaxError(error instanceof Error ? error.message : 'Failed to create expat tax profile');
      throw error;
    } finally {
      setTaxLoading(false);
    }
  }, []);

  const updateExpatTaxProfile = useCallback(
    async (profileId: string, updates: Partial<ExpatTaxProfile>) => {
      setTaxLoading(true);
      setTaxError(null);
      try {
        const updatedProfile = await ExpatTaxService.updateTaxProfile(profileId, updates);
        setExpatTaxProfiles((prev) =>
          prev.map((profile) => (profile.profileId === profileId ? updatedProfile : profile))
        );
        if (selectedExpatTaxProfile?.profileId === profileId) {
          setSelectedExpatTaxProfile(updatedProfile);
        }
        return updatedProfile;
      } catch (error) {
        setTaxError(error instanceof Error ? error.message : 'Failed to update expat tax profile');
        throw error;
      } finally {
        setTaxLoading(false);
      }
    },
    [selectedExpatTaxProfile]
  );

  const deleteExpatTaxProfile = useCallback(
    async (profileId: string) => {
      setTaxLoading(true);
      setTaxError(null);
      try {
        await ExpatTaxService.deleteTaxProfile(profileId);
        setExpatTaxProfiles((prev) => prev.filter((profile) => profile.profileId !== profileId));
        if (selectedExpatTaxProfile?.profileId === profileId) {
          setSelectedExpatTaxProfile(null);
        }
      } catch (error) {
        setTaxError(error instanceof Error ? error.message : 'Failed to delete expat tax profile');
        throw error;
      } finally {
        setTaxLoading(false);
      }
    },
    [selectedExpatTaxProfile]
  );

  const createTaxReturn = useCallback(
    async (profileId: string, taxReturn: Partial<TaxReturn>) => {
      setTaxLoading(true);
      setTaxError(null);
      try {
        const updatedProfile = await ExpatTaxService.createTaxReturn(profileId, taxReturn);
        setExpatTaxProfiles((prev) =>
          prev.map((profile) => (profile.profileId === profileId ? updatedProfile : profile))
        );
        if (selectedExpatTaxProfile?.profileId === profileId) {
          setSelectedExpatTaxProfile(updatedProfile);
        }
        return updatedProfile;
      } catch (error) {
        setTaxError(error instanceof Error ? error.message : 'Failed to create tax return');
        throw error;
      } finally {
        setTaxLoading(false);
      }
    },
    [selectedExpatTaxProfile]
  );

  const updateTaxReturn = useCallback(
    async (profileId: string, returnId: string, updates: Partial<TaxReturn>) => {
      setTaxLoading(true);
      setTaxError(null);
      try {
        const updatedProfile = await ExpatTaxService.updateTaxReturn(profileId, returnId, updates);
        setExpatTaxProfiles((prev) =>
          prev.map((profile) => (profile.profileId === profileId ? updatedProfile : profile))
        );
        if (selectedExpatTaxProfile?.profileId === profileId) {
          setSelectedExpatTaxProfile(updatedProfile);
        }
        return updatedProfile;
      } catch (error) {
        setTaxError(error instanceof Error ? error.message : 'Failed to update tax return');
        throw error;
      } finally {
        setTaxLoading(false);
      }
    },
    [selectedExpatTaxProfile]
  );

  const calculateTaxLiability = useCallback(async (profileId: string, taxYear: number, country: string) => {
    setTaxLoading(true);
    setTaxError(null);
    try {
      const liability = await ExpatTaxService.calculateTaxLiability(profileId, taxYear, country);
      return liability;
    } catch (error) {
      setTaxError(error instanceof Error ? error.message : 'Failed to calculate tax liability');
      throw error;
    } finally {
      setTaxLoading(false);
    }
  }, []);

  const createTaxProjection = useCallback(
    async (profileId: string, projection: Partial<TaxProjection>) => {
      setTaxLoading(true);
      setTaxError(null);
      try {
        const updatedProfile = await ExpatTaxService.createProjection(profileId, projection);
        setExpatTaxProfiles((prev) =>
          prev.map((profile) => (profile.profileId === profileId ? updatedProfile : profile))
        );
        if (selectedExpatTaxProfile?.profileId === profileId) {
          setSelectedExpatTaxProfile(updatedProfile);
        }
        return updatedProfile;
      } catch (error) {
        setTaxError(error instanceof Error ? error.message : 'Failed to create tax projection');
        throw error;
      } finally {
        setTaxLoading(false);
      }
    },
    [selectedExpatTaxProfile]
  );

  // Analytics Methods
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const analyticsData = await MobilityAnalyticsService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Settings Methods
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const settingsData = await MobilitySettingsService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<MobilitySettings>) => {
    setSettingsLoading(true);
    try {
      const updatedSettings = await MobilitySettingsService.updateSettings(updates);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Utility Methods
  const clearSelectedVisaApplication = useCallback(() => {
    setSelectedVisaApplication(null);
  }, []);

  const clearSelectedRelocationPackage = useCallback(() => {
    setSelectedRelocationPackage(null);
  }, []);

  const clearSelectedExpatTaxProfile = useCallback(() => {
    setSelectedExpatTaxProfile(null);
  }, []);

  const clearErrors = useCallback(() => {
    setVisaError(null);
    setRelocationError(null);
    setTaxError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchVisaApplications();
    fetchImmigrationCompliance();
    fetchRelocationPackages();
    fetchExpatTaxProfiles();
    fetchAnalytics();
    fetchSettings();
  }, [
    fetchVisaApplications,
    fetchImmigrationCompliance,
    fetchRelocationPackages,
    fetchExpatTaxProfiles,
    fetchAnalytics,
    fetchSettings,
  ]);

  return {
    // Visa & Immigration State
    visaApplications,
    selectedVisaApplication,
    immigrationCompliance,
    visaLoading,
    visaError,

    // Relocation State
    relocationPackages,
    selectedRelocationPackage,
    relocationLoading,
    relocationError,

    // Expat Tax State
    expatTaxProfiles,
    selectedExpatTaxProfile,
    taxLoading,
    taxError,

    // Analytics State
    analytics,
    analyticsLoading,

    // Settings State
    settings,
    settingsLoading,

    // Visa & Immigration Methods
    fetchVisaApplications,
    fetchVisaApplicationById,
    createVisaApplication,
    updateVisaApplication,
    deleteVisaApplication,
    submitVisaApplication,
    approveVisa,
    rejectVisa,
    uploadVisaDocument,
    fetchImmigrationCompliance,
    updateComplianceStatus,

    // Relocation Methods
    fetchRelocationPackages,
    fetchRelocationPackageById,
    createRelocationPackage,
    updateRelocationPackage,
    deleteRelocationPackage,
    updateRelocationTask,
    addRelocationVendor,
    recordRelocationExpense,
    approveRelocationExpense,

    // Expat Tax Methods
    fetchExpatTaxProfiles,
    fetchExpatTaxProfileById,
    createExpatTaxProfile,
    updateExpatTaxProfile,
    deleteExpatTaxProfile,
    createTaxReturn,
    updateTaxReturn,
    calculateTaxLiability,
    createTaxProjection,

    // Analytics Methods
    fetchAnalytics,

    // Settings Methods
    fetchSettings,
    updateSettings,

    // Utility Methods
    clearSelectedVisaApplication,
    clearSelectedRelocationPackage,
    clearSelectedExpatTaxProfile,
    clearErrors,
  };
}
