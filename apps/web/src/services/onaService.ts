/**
 * @module onaService
 * @description Organizational Network Analysis Service — network graph data,
 *              influencers, collaboration metrics, silo detection, information flow (Sec 23.5)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type NodeSize = 'small' | 'medium' | 'large' | 'hub';

export interface NetworkNode {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  departmentId: string;
  title: string;
  level: string;
  connections: number;
  betweennessCentrality: number; // 0-1
  clusteringCoefficient: number; // 0-1
  isInfluencer: boolean;
  isSilo: boolean;
  color: string; // department color
  x?: number; // pre-computed position
  y?: number;
}

export interface NetworkEdge {
  source: string; // node id
  target: string; // node id
  weight: number; // 1-10 (communication frequency)
  type: 'collaboration' | 'reporting' | 'informal';
  frequency: 'daily' | 'weekly' | 'monthly' | 'rare';
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    avgDegree: number;
    networkDensity: number;
    clusteringCoefficient: number;
    avgPathLength: number;
    diameter: number;
  };
}

export interface Influencer {
  nodeId: string;
  employeeId: string;
  name: string;
  department: string;
  title: string;
  betweennessCentrality: number;
  connections: number;
  reach: number; // # of unique connections within 2 hops
  influenceType: 'bridge' | 'hub' | 'peripheral';
  riskLevel: 'high' | 'medium' | 'low'; // if they left
}

export interface CollaborationMetrics {
  teamId?: string;
  teamName: string;
  internalCollaboration: number; // 0-100
  externalCollaboration: number; // 0-100
  crossDeptLinks: number;
  topCollaborators: Array<{ departmentId: string; departmentName: string; score: number }>;
  trend: number; // vs last quarter
}

export interface SiloGroup {
  id: string;
  departments: string[];
  nodeCount: number;
  internalDensity: number;
  externalConnections: number;
  riskLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface CommunicationPattern {
  employeeId: string;
  name: string;
  outgoingConnections: number;
  incomingConnections: number;
  mostFrequentContacts: Array<{ name: string; frequency: string; department: string }>;
  crossDeptRatio: number;
  networkReach: number;
}

export interface InformationFlow {
  bottlenecks: Array<{ nodeId: string; name: string; flowLoad: number }>;
  fastPaths: Array<{ from: string; to: string; hops: number }>;
  slowPaths: Array<{ from: string; to: string; hops: number }>;
  informationLag: number; // average days for info to reach all nodes
}

export interface NetworkHealth {
  overallScore: number; // 0-100
  density: number;
  clusteringCoefficient: number;
  avgPathLength: number;
  siloCount: number;
  influencerCount: number;
  fragility: number; // 0-100, how vulnerable network is to key departures
  recommendations: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#3b82f6',
  Product: '#8b5cf6',
  Data: '#06b6d4',
  Sales: '#f59e0b',
  HR: '#ec4899',
  Finance: '#10b981',
  Operations: '#6366f1',
  Marketing: '#f97316',
  Design: '#84cc16',
  Leadership: '#ef4444',
};

const _DEPARTMENTS = Object.keys(DEPT_COLORS);

// Generate 30 realistic nodes
const generateNodes = (): NetworkNode[] => {
  const employees = [
    {
      id: 'n01',
      eid: 'emp-001',
      name: 'Sarah Chen',
      dept: 'Engineering',
      title: 'VP Engineering',
      level: 'VP',
      conn: 22,
      bc: 0.82,
      cc: 0.41,
      infl: true,
      silo: false,
    },
    {
      id: 'n02',
      eid: 'emp-002',
      name: 'James Liu',
      dept: 'Product',
      title: 'CPO',
      level: 'C-Level',
      conn: 18,
      bc: 0.74,
      cc: 0.38,
      infl: true,
      silo: false,
    },
    {
      id: 'n03',
      eid: 'emp-003',
      name: 'Carlos Mendez',
      dept: 'Data',
      title: 'Director of Analytics',
      level: 'Director',
      conn: 15,
      bc: 0.68,
      cc: 0.45,
      infl: true,
      silo: false,
    },
    {
      id: 'n04',
      eid: 'emp-004',
      name: 'Emily Park',
      dept: 'HR',
      title: 'CPO',
      level: 'C-Level',
      conn: 20,
      bc: 0.79,
      cc: 0.35,
      infl: true,
      silo: false,
    },
    {
      id: 'n05',
      eid: 'emp-005',
      name: 'Anna Schmidt',
      dept: 'Sales',
      title: 'SVP Sales',
      level: 'SVP',
      conn: 16,
      bc: 0.65,
      cc: 0.42,
      infl: true,
      silo: false,
    },
    {
      id: 'n06',
      eid: 'emp-006',
      name: 'Tom Baker',
      dept: 'Engineering',
      title: 'Staff Engineer',
      level: 'Staff',
      conn: 12,
      bc: 0.48,
      cc: 0.52,
      infl: false,
      silo: false,
    },
    {
      id: 'n07',
      eid: 'emp-007',
      name: 'Nina Okonkwo',
      dept: 'Marketing',
      title: 'Marketing Director',
      level: 'Director',
      conn: 11,
      bc: 0.44,
      cc: 0.38,
      infl: false,
      silo: false,
    },
    {
      id: 'n08',
      eid: 'emp-008',
      name: 'Jake Wilson',
      dept: 'Finance',
      title: 'CFO',
      level: 'C-Level',
      conn: 14,
      bc: 0.61,
      cc: 0.33,
      infl: true,
      silo: false,
    },
    {
      id: 'n09',
      eid: 'emp-009',
      name: 'Maria Gonzalez',
      dept: 'Design',
      title: 'Head of Design',
      level: 'Director',
      conn: 9,
      bc: 0.38,
      cc: 0.48,
      infl: false,
      silo: false,
    },
    {
      id: 'n10',
      eid: 'emp-010',
      name: 'David Kim',
      dept: 'Engineering',
      title: 'Senior Engineer',
      level: 'Senior',
      conn: 8,
      bc: 0.31,
      cc: 0.58,
      infl: false,
      silo: false,
    },
    {
      id: 'n11',
      eid: 'emp-011',
      name: 'Priya Patel',
      dept: 'Data',
      title: 'Senior Data Scientist',
      level: 'Senior',
      conn: 10,
      bc: 0.42,
      cc: 0.51,
      infl: false,
      silo: false,
    },
    {
      id: 'n12',
      eid: 'emp-012',
      name: 'Robert Brown',
      dept: 'HR',
      title: 'HRBP',
      level: 'Mid',
      conn: 12,
      bc: 0.55,
      cc: 0.44,
      infl: false,
      silo: false,
    },
    {
      id: 'n13',
      eid: 'emp-013',
      name: 'Lisa Wang',
      dept: 'Product',
      title: 'Product Manager',
      level: 'Mid',
      conn: 9,
      bc: 0.36,
      cc: 0.47,
      infl: false,
      silo: false,
    },
    {
      id: 'n14',
      eid: 'emp-014',
      name: 'Michael Torres',
      dept: 'Engineering',
      title: 'Senior Engineer',
      level: 'Senior',
      conn: 7,
      bc: 0.28,
      cc: 0.61,
      infl: false,
      silo: false,
    },
    {
      id: 'n15',
      eid: 'emp-015',
      name: 'Alex Chen',
      dept: 'Sales',
      title: 'Account Executive',
      level: 'Mid',
      conn: 6,
      bc: 0.22,
      cc: 0.55,
      infl: false,
      silo: false,
    },
    {
      id: 'n16',
      eid: 'emp-016',
      name: 'Sam Taylor',
      dept: 'Operations',
      title: 'Operations Manager',
      level: 'Manager',
      conn: 13,
      bc: 0.52,
      cc: 0.4,
      infl: false,
      silo: false,
    },
    {
      id: 'n17',
      eid: 'emp-017',
      name: 'Zara Ahmed',
      dept: 'Marketing',
      title: 'Digital Marketing Lead',
      level: 'Senior',
      conn: 7,
      bc: 0.24,
      cc: 0.62,
      infl: false,
      silo: false,
    },
    {
      id: 'n18',
      eid: 'emp-018',
      name: 'Chris Lee',
      dept: 'Finance',
      title: 'Senior Analyst',
      level: 'Senior',
      conn: 5,
      bc: 0.18,
      cc: 0.64,
      infl: false,
      silo: false,
    },
    {
      id: 'n19',
      eid: 'emp-019',
      name: 'Fatima Al-Hassan',
      dept: 'HR',
      title: 'Talent Acquisition',
      level: 'Mid',
      conn: 11,
      bc: 0.46,
      cc: 0.43,
      infl: false,
      silo: false,
    },
    {
      id: 'n20',
      eid: 'emp-020',
      name: 'Kenji Tanaka',
      dept: 'Engineering',
      title: 'DevOps Engineer',
      level: 'Senior',
      conn: 8,
      bc: 0.33,
      cc: 0.56,
      infl: false,
      silo: false,
    },
    {
      id: 'n21',
      eid: 'emp-021',
      name: 'Olga Petrov',
      dept: 'Data',
      title: 'Data Engineer',
      level: 'Mid',
      conn: 6,
      bc: 0.21,
      cc: 0.68,
      infl: false,
      silo: false,
    },
    {
      id: 'n22',
      eid: 'emp-022',
      name: 'Will Johnson',
      dept: 'Sales',
      title: 'Sales Manager',
      level: 'Manager',
      conn: 9,
      bc: 0.38,
      cc: 0.48,
      infl: false,
      silo: false,
    },
    {
      id: 'n23',
      eid: 'emp-023',
      name: 'Luna Park',
      dept: 'Design',
      title: 'UX Designer',
      level: 'Mid',
      conn: 5,
      bc: 0.16,
      cc: 0.71,
      infl: false,
      silo: false,
    },
    {
      id: 'n24',
      eid: 'emp-024',
      name: 'Ivan Koch',
      dept: 'Operations',
      title: 'Supply Chain Lead',
      level: 'Senior',
      conn: 4,
      bc: 0.12,
      cc: 0.74,
      infl: false,
      silo: true,
    },
    {
      id: 'n25',
      eid: 'emp-025',
      name: 'May Lim',
      dept: 'Finance',
      title: 'Financial Analyst',
      level: 'Junior',
      conn: 3,
      bc: 0.08,
      cc: 0.78,
      infl: false,
      silo: true,
    },
    {
      id: 'n26',
      eid: 'emp-026',
      name: 'Pedro Costa',
      dept: 'Marketing',
      title: 'Content Creator',
      level: 'Junior',
      conn: 4,
      bc: 0.14,
      cc: 0.72,
      infl: false,
      silo: false,
    },
    {
      id: 'n27',
      eid: 'emp-027',
      name: 'Amina Diallo',
      dept: 'Engineering',
      title: 'Junior Engineer',
      level: 'Junior',
      conn: 4,
      bc: 0.11,
      cc: 0.76,
      infl: false,
      silo: false,
    },
    {
      id: 'n28',
      eid: 'emp-028',
      name: 'Ben Carter',
      dept: 'Product',
      title: 'APM',
      level: 'Junior',
      conn: 5,
      bc: 0.18,
      cc: 0.69,
      infl: false,
      silo: false,
    },
    {
      id: 'n29',
      eid: 'emp-029',
      name: 'Yuna Kim',
      dept: 'Data',
      title: 'Data Analyst',
      level: 'Junior',
      conn: 5,
      bc: 0.16,
      cc: 0.71,
      infl: false,
      silo: false,
    },
    {
      id: 'n30',
      eid: 'emp-030',
      name: 'Raj Sharma',
      dept: 'Operations',
      title: 'Process Manager',
      level: 'Mid',
      conn: 3,
      bc: 0.09,
      cc: 0.81,
      infl: false,
      silo: true,
    },
  ];

  return employees.map((e, _i) => ({
    id: e.id,
    employeeId: e.eid,
    name: e.name,
    department: e.dept,
    departmentId: `dept-${e.dept.toLowerCase()}`,
    title: e.title,
    level: e.level,
    connections: e.conn,
    betweennessCentrality: e.bc,
    clusteringCoefficient: e.cc,
    isInfluencer: e.infl,
    isSilo: e.silo,
    color: DEPT_COLORS[e.dept] ?? '#9ca3af',
  }));
};

const generateEdges = (_nodes: NetworkNode[]): NetworkEdge[] => {
  const edges: NetworkEdge[] = [];
  const addEdge = (
    s: string,
    t: string,
    w: number,
    type: NetworkEdge['type'] = 'collaboration',
    freq: NetworkEdge['frequency'] = 'weekly'
  ) => {
    edges.push({ source: s, target: t, weight: w, type, frequency: freq });
  };

  // Key connections
  addEdge('n01', 'n02', 9, 'collaboration', 'daily');
  addEdge('n01', 'n03', 7, 'collaboration', 'weekly');
  addEdge('n01', 'n04', 6, 'collaboration', 'weekly');
  addEdge('n01', 'n06', 8, 'reporting', 'daily');
  addEdge('n01', 'n10', 7, 'reporting', 'daily');
  addEdge('n01', 'n14', 7, 'reporting', 'daily');
  addEdge('n01', 'n20', 6, 'reporting', 'weekly');
  addEdge('n01', 'n27', 5, 'reporting', 'weekly');
  addEdge('n02', 'n04', 7, 'collaboration', 'weekly');
  addEdge('n02', 'n08', 6, 'collaboration', 'weekly');
  addEdge('n02', 'n13', 8, 'reporting', 'daily');
  addEdge('n02', 'n28', 7, 'reporting', 'weekly');
  addEdge('n03', 'n11', 8, 'reporting', 'daily');
  addEdge('n03', 'n21', 7, 'reporting', 'daily');
  addEdge('n03', 'n29', 6, 'reporting', 'weekly');
  addEdge('n04', 'n12', 8, 'reporting', 'daily');
  addEdge('n04', 'n19', 7, 'reporting', 'weekly');
  addEdge('n05', 'n15', 8, 'reporting', 'daily');
  addEdge('n05', 'n22', 8, 'reporting', 'daily');
  addEdge('n05', 'n08', 7, 'collaboration', 'weekly');
  addEdge('n06', 'n10', 6, 'collaboration', 'daily');
  addEdge('n06', 'n14', 6, 'collaboration', 'weekly');
  addEdge('n07', 'n17', 7, 'reporting', 'weekly');
  addEdge('n07', 'n26', 6, 'reporting', 'weekly');
  addEdge('n08', 'n18', 7, 'reporting', 'weekly');
  addEdge('n08', 'n25', 5, 'reporting', 'monthly');
  addEdge('n09', 'n23', 7, 'reporting', 'weekly');
  addEdge('n09', 'n13', 6, 'collaboration', 'weekly');
  addEdge('n16', 'n24', 5, 'reporting', 'monthly');
  addEdge('n16', 'n30', 5, 'reporting', 'monthly');
  addEdge('n01', 'n09', 4, 'collaboration', 'monthly');
  addEdge('n02', 'n09', 5, 'collaboration', 'weekly');
  addEdge('n03', 'n01', 6, 'collaboration', 'weekly');
  addEdge('n04', 'n05', 5, 'collaboration', 'weekly');
  addEdge('n04', 'n08', 6, 'collaboration', 'weekly');
  addEdge('n12', 'n19', 5, 'collaboration', 'weekly');
  addEdge('n11', 'n29', 6, 'collaboration', 'daily');
  addEdge('n22', 'n15', 6, 'collaboration', 'weekly');
  addEdge('n07', 'n02', 4, 'collaboration', 'monthly');
  addEdge('n16', 'n01', 4, 'collaboration', 'monthly');
  addEdge('n18', 'n25', 3, 'collaboration', 'monthly');
  addEdge('n20', 'n27', 4, 'collaboration', 'weekly');

  return edges;
};

const MOCK_NODES = generateNodes();
const MOCK_EDGES = generateEdges(MOCK_NODES);

const MOCK_NETWORK_GRAPH: NetworkGraph = {
  nodes: MOCK_NODES,
  edges: MOCK_EDGES,
  metadata: {
    totalNodes: MOCK_NODES.length,
    totalEdges: MOCK_EDGES.length,
    avgDegree: 5.4,
    networkDensity: 0.18,
    clusteringCoefficient: 0.52,
    avgPathLength: 2.8,
    diameter: 6,
  },
};

const MOCK_INFLUENCERS: Influencer[] = MOCK_NODES.filter((n) => n.isInfluencer).map((n) => ({
  nodeId: n.id,
  employeeId: n.employeeId,
  name: n.name,
  department: n.department,
  title: n.title,
  betweennessCentrality: n.betweennessCentrality,
  connections: n.connections,
  reach: Math.round(n.connections * 2.4),
  influenceType:
    n.betweennessCentrality > 0.7 ? 'bridge' : n.connections > 15 ? 'hub' : 'peripheral',
  riskLevel:
    n.betweennessCentrality > 0.7 ? 'high' : n.betweennessCentrality > 0.5 ? 'medium' : 'low',
}));

const MOCK_COLLABORATION: CollaborationMetrics[] = [
  {
    teamName: 'Engineering',
    internalCollaboration: 82,
    externalCollaboration: 48,
    crossDeptLinks: 24,
    topCollaborators: [
      { departmentId: 'dept-product', departmentName: 'Product', score: 78 },
      { departmentId: 'dept-data', departmentName: 'Data', score: 64 },
    ],
    trend: 5,
  },
  {
    teamName: 'Product',
    internalCollaboration: 75,
    externalCollaboration: 71,
    crossDeptLinks: 31,
    topCollaborators: [
      { departmentId: 'dept-engineering', departmentName: 'Engineering', score: 78 },
      { departmentId: 'dept-design', departmentName: 'Design', score: 68 },
    ],
    trend: 8,
  },
  {
    teamName: 'Sales',
    internalCollaboration: 68,
    externalCollaboration: 42,
    crossDeptLinks: 14,
    topCollaborators: [
      { departmentId: 'dept-marketing', departmentName: 'Marketing', score: 54 },
      { departmentId: 'dept-product', departmentName: 'Product', score: 44 },
    ],
    trend: -2,
  },
  {
    teamName: 'Operations',
    internalCollaboration: 62,
    externalCollaboration: 28,
    crossDeptLinks: 8,
    topCollaborators: [{ departmentId: 'dept-finance', departmentName: 'Finance', score: 42 }],
    trend: -6,
  },
];

const MOCK_SILOS: SiloGroup[] = [
  {
    id: 'silo-001',
    departments: ['Operations', 'Finance'],
    nodeCount: 5,
    internalDensity: 0.42,
    externalConnections: 6,
    riskLevel: 'high',
    recommendations: [
      'Schedule cross-functional meetings with Engineering',
      'Assign cross-team project with Data team',
      'Include Operations in product roadmap reviews',
    ],
  },
  {
    id: 'silo-002',
    departments: ['Marketing'],
    nodeCount: 3,
    internalDensity: 0.38,
    externalConnections: 8,
    riskLevel: 'medium',
    recommendations: [
      'Bridge Marketing with Product team',
      'Include Marketing in customer feedback sessions',
    ],
  },
];

const MOCK_NETWORK_HEALTH: NetworkHealth = {
  overallScore: 72,
  density: 0.18,
  clusteringCoefficient: 0.52,
  avgPathLength: 2.8,
  siloCount: 2,
  influencerCount: 6,
  fragility: 58,
  recommendations: [
    'Address Operations-Finance silo by creating cross-functional working groups.',
    'Reduce network fragility by distributing knowledge from 3 high-centrality individuals.',
    'Improve Marketing-Product collaboration to accelerate go-to-market cycles.',
    'Onboard new Engineering hires into the network through buddy programs.',
  ],
};

// ============================================================================
// SERVICE
// ============================================================================

export class ONAService {
  /** Get organizational network graph data */
  static async getNetworkGraph(departmentId?: string): Promise<NetworkGraph> {
    await new Promise((r) => setTimeout(r, 500));
    if (departmentId) {
      const deptNodes = MOCK_NODES.filter((n) => n.departmentId === departmentId);
      const nodeIds = new Set(deptNodes.map((n) => n.id));
      const deptEdges = MOCK_EDGES.filter((e) => nodeIds.has(e.source) || nodeIds.has(e.target));
      return { ...MOCK_NETWORK_GRAPH, nodes: deptNodes, edges: deptEdges };
    }
    return { ...MOCK_NETWORK_GRAPH };
  }

  /** Get key influencers in the organization */
  static async getInfluencers(): Promise<Influencer[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_INFLUENCERS];
  }

  /** Get collaboration metrics for teams */
  static async getCollaborationMetrics(teamId?: string): Promise<CollaborationMetrics[]> {
    await new Promise((r) => setTimeout(r, 350));
    if (teamId)
      return MOCK_COLLABORATION.filter((c) => c.teamName.toLowerCase() === teamId.toLowerCase());
    return [...MOCK_COLLABORATION];
  }

  /** Get silo detection analysis */
  static async getSiloDetection(): Promise<SiloGroup[]> {
    await new Promise((r) => setTimeout(r, 350));
    return [...MOCK_SILOS];
  }

  /** Get communication patterns for an employee */
  static async getCommunicationPatterns(employeeId: string): Promise<CommunicationPattern> {
    await new Promise((r) => setTimeout(r, 300));
    const node = MOCK_NODES.find((n) => n.employeeId === employeeId);
    return {
      employeeId,
      name: node?.name ?? 'Employee',
      outgoingConnections: node?.connections ?? 5,
      incomingConnections: Math.round((node?.connections ?? 5) * 0.8),
      mostFrequentContacts: MOCK_NODES.slice(0, 5).map((n) => ({
        name: n.name,
        frequency: 'weekly',
        department: n.department,
      })),
      crossDeptRatio: 0.42,
      networkReach: Math.round((node?.connections ?? 5) * 2.5),
    };
  }

  /** Get information flow analysis */
  static async getInformationFlowAnalysis(): Promise<InformationFlow> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      bottlenecks: MOCK_INFLUENCERS.slice(0, 3).map((i) => ({
        nodeId: i.nodeId,
        name: i.name,
        flowLoad: Math.round(i.betweennessCentrality * 100),
      })),
      fastPaths: [
        { from: 'Engineering', to: 'Product', hops: 2 },
        { from: 'Data', to: 'Engineering', hops: 2 },
      ],
      slowPaths: [
        { from: 'Operations', to: 'Engineering', hops: 5 },
        { from: 'Finance', to: 'Product', hops: 5 },
      ],
      informationLag: 4.2,
    };
  }

  /** Get overall network health metrics */
  static async getNetworkHealth(): Promise<NetworkHealth> {
    await new Promise((r) => setTimeout(r, 300));
    return { ...MOCK_NETWORK_HEALTH };
  }
}
