/**
 * Elasticsearch Configuration
 * Search infrastructure for AuraOS
 *
 * @module @aura/search
 */

export interface ElasticsearchConfig {
  node: string;
  auth?: {
    username: string;
    password: string;
  };
  maxRetries?: number;
  requestTimeout?: number;
  sniffOnStart?: boolean;
}

export interface IndexMapping {
  index: string;
  mappings: {
    properties: Record<string, unknown>;
  };
  settings?: {
    number_of_shards?: number;
    number_of_replicas?: number;
    analysis?: unknown;
  };
}

/**
 * Get Elasticsearch configuration from environment
 */
export function getElasticsearchConfig(): ElasticsearchConfig {
  return {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: process.env.ELASTICSEARCH_USERNAME
      ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD || '',
        }
      : undefined,
    maxRetries: 5,
    requestTimeout: 30000,
    sniffOnStart: true,
  };
}

/**
 * Employee Index Mapping
 */
export const EMPLOYEE_INDEX: IndexMapping = {
  index: 'aura_employees',
  mappings: {
    properties: {
      tenantId: { type: 'keyword' },
      employeeId: { type: 'keyword' },
      firstName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' },
        },
      },
      lastName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' },
        },
      },
      fullName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' },
        },
      },
      email: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      phoneNumber: { type: 'keyword' },
      employeeNumber: { type: 'keyword' },
      department: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      designation: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      location: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      skills: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      status: { type: 'keyword' },
      joinDate: { type: 'date' },
      exitDate: { type: 'date' },
      dateOfBirth: { type: 'date' },
      managerId: { type: 'keyword' },
      managerName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
  settings: {
    number_of_shards: 3,
    number_of_replicas: 2,
    analysis: {
      analyzer: {
        autocomplete: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'autocomplete_filter'],
        },
      },
      filter: {
        autocomplete_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
        },
      },
    },
  },
};

/**
 * Document Index Mapping
 */
export const DOCUMENT_INDEX: IndexMapping = {
  index: 'aura_documents',
  mappings: {
    properties: {
      tenantId: { type: 'keyword' },
      documentId: { type: 'keyword' },
      title: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' },
        },
      },
      content: { type: 'text' },
      fileName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      fileType: { type: 'keyword' },
      category: { type: 'keyword' },
      tags: { type: 'keyword' },
      uploadedBy: { type: 'keyword' },
      uploadedByName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      employeeId: { type: 'keyword' },
      department: { type: 'keyword' },
      accessLevel: { type: 'keyword' },
      status: { type: 'keyword' },
      fileSize: { type: 'long' },
      uploadedAt: { type: 'date' },
      updatedAt: { type: 'date' },
      expiryDate: { type: 'date' },
    },
  },
  settings: {
    number_of_shards: 3,
    number_of_replicas: 2,
  },
};

/**
 * Audit Log Index Mapping
 */
export const AUDIT_LOG_INDEX: IndexMapping = {
  index: 'aura_audit_logs',
  mappings: {
    properties: {
      tenantId: { type: 'keyword' },
      logId: { type: 'keyword' },
      action: { type: 'keyword' },
      module: { type: 'keyword' },
      entity: { type: 'keyword' },
      entityId: { type: 'keyword' },
      userId: { type: 'keyword' },
      userName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      userEmail: { type: 'keyword' },
      ipAddress: { type: 'ip' },
      userAgent: { type: 'text' },
      details: { type: 'text' },
      changes: { type: 'object', enabled: false },
      status: { type: 'keyword' },
      severity: { type: 'keyword' },
      timestamp: { type: 'date' },
    },
  },
  settings: {
    number_of_shards: 5,
    number_of_replicas: 2,
  },
};

/**
 * Leave Record Index Mapping
 */
export const LEAVE_INDEX: IndexMapping = {
  index: 'aura_leaves',
  mappings: {
    properties: {
      tenantId: { type: 'keyword' },
      leaveId: { type: 'keyword' },
      employeeId: { type: 'keyword' },
      employeeName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      leaveType: { type: 'keyword' },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      duration: { type: 'float' },
      status: { type: 'keyword' },
      reason: { type: 'text' },
      approverId: { type: 'keyword' },
      approverName: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      department: { type: 'keyword' },
      appliedAt: { type: 'date' },
      approvedAt: { type: 'date' },
      rejectedAt: { type: 'date' },
    },
  },
  settings: {
    number_of_shards: 2,
    number_of_replicas: 1,
  },
};

/**
 * Job Posting Index Mapping
 */
export const JOB_INDEX: IndexMapping = {
  index: 'aura_jobs',
  mappings: {
    properties: {
      tenantId: { type: 'keyword' },
      jobId: { type: 'keyword' },
      title: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' },
        },
      },
      description: { type: 'text' },
      requirements: { type: 'text' },
      responsibilities: { type: 'text' },
      department: { type: 'keyword' },
      location: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      employmentType: { type: 'keyword' },
      experienceLevel: { type: 'keyword' },
      skills: { type: 'keyword' },
      salaryRange: {
        min: { type: 'long' },
        max: { type: 'long' },
        currency: { type: 'keyword' },
      },
      status: { type: 'keyword' },
      postedBy: { type: 'keyword' },
      postedAt: { type: 'date' },
      closingDate: { type: 'date' },
      applicantCount: { type: 'integer' },
    },
  },
  settings: {
    number_of_shards: 2,
    number_of_replicas: 1,
  },
};

/**
 * All index mappings
 */
export const ALL_INDICES: IndexMapping[] = [
  EMPLOYEE_INDEX,
  DOCUMENT_INDEX,
  AUDIT_LOG_INDEX,
  LEAVE_INDEX,
  JOB_INDEX,
];
