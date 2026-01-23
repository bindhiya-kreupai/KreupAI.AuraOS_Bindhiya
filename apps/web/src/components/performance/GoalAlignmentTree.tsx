"use client";

import React, { useState } from "react";
import {
  Target,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  UserCircle,
  Briefcase,
} from "lucide-react";

interface GoalNode {
  id: string;
  title: string;
  level: "company" | "department" | "team" | "individual";
  progress: number;
  owner: string;
  children?: GoalNode[];
}

const mockGoalTree: GoalNode[] = [
  {
    id: "c1",
    title: "Achieve 40% YoY Revenue Growth",
    level: "company",
    progress: 62,
    owner: "Company",
    children: [
      {
        id: "d1",
        title: "Expand Enterprise Sales Pipeline",
        level: "department",
        progress: 55,
        owner: "Sales Department",
        children: [
          {
            id: "t1",
            title: "Close 15 Enterprise Deals in Q1",
            level: "team",
            progress: 40,
            owner: "Enterprise Team",
            children: [
              {
                id: "i1",
                title: "Generate 50 qualified leads",
                level: "individual",
                progress: 72,
                owner: "Alice Chen",
              },
              {
                id: "i2",
                title: "Achieve 30% demo-to-close rate",
                level: "individual",
                progress: 45,
                owner: "Marcus Johnson",
              },
            ],
          },
          {
            id: "t2",
            title: "Increase Average Deal Size by 25%",
            level: "team",
            progress: 68,
            owner: "Solutions Team",
            children: [
              {
                id: "i3",
                title: "Develop 3 enterprise solution packages",
                level: "individual",
                progress: 85,
                owner: "Sarah Williams",
              },
            ],
          },
        ],
      },
      {
        id: "d2",
        title: "Launch 3 New Product Features",
        level: "department",
        progress: 73,
        owner: "Product Department",
        children: [
          {
            id: "t3",
            title: "Ship AI-powered analytics module",
            level: "team",
            progress: 80,
            owner: "Platform Team",
            children: [
              {
                id: "i4",
                title: "Complete ML model training pipeline",
                level: "individual",
                progress: 90,
                owner: "Elena Rodriguez",
              },
              {
                id: "i5",
                title: "Build analytics dashboard UI",
                level: "individual",
                progress: 65,
                owner: "David Park",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "Improve Employee NPS to 75+",
    level: "company",
    progress: 48,
    owner: "Company",
    children: [
      {
        id: "d3",
        title: "Enhance Learning & Development Programs",
        level: "department",
        progress: 52,
        owner: "HR Department",
        children: [
          {
            id: "t4",
            title: "Launch mentorship program",
            level: "team",
            progress: 35,
            owner: "L&D Team",
            children: [
              {
                id: "i6",
                title: "Recruit 20 senior mentors",
                level: "individual",
                progress: 60,
                owner: "Priya Sharma",
              },
            ],
          },
        ],
      },
    ],
  },
];

const levelConfig: Record<
  GoalNode["level"],
  { icon: React.ReactNode; colorClass: string; bgClass: string }
> = {
  company: {
    icon: <Building2 className="w-4 h-4" />,
    colorClass: "text-celestial-indigo",
    bgClass: "bg-celestial-indigo/10",
  },
  department: {
    icon: <Briefcase className="w-4 h-4" />,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-100 dark:bg-purple-900/20",
  },
  team: {
    icon: <Users className="w-4 h-4" />,
    colorClass: "text-aurora-green",
    bgClass: "bg-aurora-green/10",
  },
  individual: {
    icon: <UserCircle className="w-4 h-4" />,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/20",
  },
};

function GoalNodeComponent({
  node,
  depth = 0,
}: {
  node: GoalNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const config = levelConfig[node.level];
  const hasChildren = node.children && node.children.length > 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return "bg-aurora-green";
    if (progress >= 40) return "bg-amber-500";
    return "bg-coral-alert";
  };

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-cloud dark:border-nebula-purple/30 pl-4" : ""}`}>
      <div className="flex items-start gap-3 py-3">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-nebula-purple/20 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-silver-mist" />
            ) : (
              <ChevronRight className="w-4 h-4 text-silver-mist" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div className={`p-1.5 rounded-md ${config.bgClass}`}>
          <span className={config.colorClass}>{config.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-ink-black dark:text-pearl truncate">
              {node.title}
            </h4>
          </div>
          <p className="text-xs text-silver-mist mb-2">{node.owner}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-nebula-purple/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(node.progress)}`}
                style={{ width: `${node.progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-ink-black dark:text-pearl min-w-[36px] text-right">
              {node.progress}%
            </span>
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <GoalNodeComponent key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoalAlignmentTree() {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Goal Alignment Tree
        </h2>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg">
        {(Object.entries(levelConfig) as [GoalNode["level"], typeof levelConfig.company][]).map(
          ([level, config]) => (
            <div key={level} className="flex items-center gap-2">
              <div className={`p-1 rounded ${config.bgClass}`}>
                <span className={config.colorClass}>{config.icon}</span>
              </div>
              <span className="text-xs font-medium text-ink-black dark:text-pearl capitalize">
                {level}
              </span>
            </div>
          )
        )}
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {mockGoalTree.map((goal) => (
          <GoalNodeComponent key={goal.id} node={goal} />
        ))}
      </div>
    </div>
  );
}
