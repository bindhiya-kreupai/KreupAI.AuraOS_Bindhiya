/**
 * @module RecognitionRewards
 * @description Employee recognition and rewards platform — peer recognition feed,
 *              send kudos, leaderboard, rewards store, program reports (Sec 13.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Award,
  Star,
  Trophy,
  Send,
  Plus,
  Loader2,
  BarChart2,
  ShoppingBag,
  Search,
  ThumbsUp,
  Zap,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'feed' | 'send' | 'leaderboard' | 'store' | 'reports';
type RecognitionType = 'kudos' | 'values-award' | 'spot-bonus' | 'milestone';
type CompanyValue = 'Innovation' | 'Teamwork' | 'Customer-Focus' | 'Integrity' | 'Excellence';
type LeaderboardPeriod = 'monthly' | 'quarterly' | 'annual';

interface RecognitionPost {
  id: string;
  sender: string;
  senderInitials: string;
  senderColor: string;
  receiver: string;
  receiverInitials: string;
  receiverColor: string;
  type: RecognitionType;
  values: CompanyValue[];
  message: string;
  points: number;
  likes: number;
  comments: number;
  timestamp: string;
  liked: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  color: string;
  department: string;
  points: number;
  recognitionsReceived: number;
  recognitionsGiven: number;
  badge?: string;
}

interface DepartmentRanking {
  department: string;
  totalPoints: number;
  recognitionsGiven: number;
  participationRate: number;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: 'gift-card' | 'pto' | 'charity' | 'experience';
  pointCost: number;
  available: boolean;
  imageEmoji: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const FEED_POSTS: RecognitionPost[] = [
  {
    id: 'r-001',
    sender: 'Sarah Chen',
    senderInitials: 'SC',
    senderColor: 'bg-pink-500',
    receiver: 'James Miller',
    receiverInitials: 'JM',
    receiverColor: 'bg-blue-500',
    type: 'values-award',
    values: ['Innovation', 'Excellence'],
    message:
      'James single-handedly architected our new microservices migration that cut latency by 40%. Incredible technical leadership!',
    points: 500,
    likes: 24,
    comments: 8,
    timestamp: '2 hours ago',
    liked: false,
  },
  {
    id: 'r-002',
    sender: 'Tom Johnson',
    senderInitials: 'TJ',
    senderColor: 'bg-amber-500',
    receiver: 'Olivia Brown',
    receiverInitials: 'OB',
    receiverColor: 'bg-emerald-500',
    type: 'kudos',
    values: ['Teamwork', 'Customer-Focus'],
    message:
      'Olivia stayed late three nights in a row to help our team meet the client deadline. True team player!',
    points: 100,
    likes: 18,
    comments: 4,
    timestamp: '4 hours ago',
    liked: true,
  },
  {
    id: 'r-003',
    sender: 'Lisa Wang',
    senderInitials: 'LW',
    senderColor: 'bg-indigo-500',
    receiver: 'Daniel Taylor',
    receiverInitials: 'DT',
    receiverColor: 'bg-cyan-500',
    type: 'spot-bonus',
    values: ['Excellence'],
    message:
      "Daniel's data analysis identified a cost saving opportunity worth $200K. Outstanding analytical thinking!",
    points: 1000,
    likes: 42,
    comments: 15,
    timestamp: '6 hours ago',
    liked: false,
  },
  {
    id: 'r-004',
    sender: 'Kevin Park',
    senderInitials: 'KP',
    senderColor: 'bg-violet-500',
    receiver: 'Mia Nguyen',
    receiverInitials: 'MN',
    receiverColor: 'bg-rose-500',
    type: 'milestone',
    values: ['Excellence', 'Integrity'],
    message:
      "Celebrating Mia's 5-year work anniversary! Five years of outstanding dedication and leadership.",
    points: 250,
    likes: 56,
    comments: 22,
    timestamp: '1 day ago',
    liked: true,
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'James Miller',
    initials: 'JM',
    color: 'bg-blue-500',
    department: 'Engineering',
    points: 3450,
    recognitionsReceived: 12,
    recognitionsGiven: 8,
    badge: 'Champion',
  },
  {
    rank: 2,
    name: 'Sarah Chen',
    initials: 'SC',
    color: 'bg-pink-500',
    department: 'Product',
    points: 3120,
    recognitionsReceived: 10,
    recognitionsGiven: 14,
    badge: 'Connector',
  },
  {
    rank: 3,
    name: 'Daniel Taylor',
    initials: 'DT',
    color: 'bg-cyan-500',
    department: 'Analytics',
    points: 2980,
    recognitionsReceived: 9,
    recognitionsGiven: 6,
    badge: 'Innovator',
  },
  {
    rank: 4,
    name: 'Olivia Brown',
    initials: 'OB',
    color: 'bg-emerald-500',
    department: 'Design',
    points: 2640,
    recognitionsReceived: 11,
    recognitionsGiven: 10,
    badge: undefined,
  },
  {
    rank: 5,
    name: 'Lisa Wang',
    initials: 'LW',
    color: 'bg-indigo-500',
    department: 'Marketing',
    points: 2380,
    recognitionsReceived: 7,
    recognitionsGiven: 12,
    badge: undefined,
  },
  {
    rank: 6,
    name: 'Tom Johnson',
    initials: 'TJ',
    color: 'bg-amber-500',
    department: 'Engineering',
    points: 2100,
    recognitionsReceived: 8,
    recognitionsGiven: 9,
    badge: undefined,
  },
];

const DEPT_RANKINGS: DepartmentRanking[] = [
  { department: 'Engineering', totalPoints: 18400, recognitionsGiven: 84, participationRate: 91 },
  { department: 'Product', totalPoints: 14200, recognitionsGiven: 62, participationRate: 88 },
  { department: 'Sales', totalPoints: 12800, recognitionsGiven: 58, participationRate: 79 },
  { department: 'Marketing', totalPoints: 9600, recognitionsGiven: 44, participationRate: 82 },
  { department: 'Operations', totalPoints: 8400, recognitionsGiven: 38, participationRate: 74 },
];

const REWARDS: RewardItem[] = [
  {
    id: 'rw-001',
    name: 'Amazon Gift Card',
    description: '$50 Amazon gift card delivered by email',
    category: 'gift-card',
    pointCost: 500,
    available: true,
    imageEmoji: '🛒',
  },
  {
    id: 'rw-002',
    name: 'Extra PTO Day',
    description: 'One additional paid day off (must be approved)',
    category: 'pto',
    pointCost: 800,
    available: true,
    imageEmoji: '🏖️',
  },
  {
    id: 'rw-003',
    name: 'Charity Donation $25',
    description: 'Donate to your chosen charity in your name',
    category: 'charity',
    pointCost: 250,
    available: true,
    imageEmoji: '❤️',
  },
  {
    id: 'rw-004',
    name: 'Restaurant Voucher',
    description: '$75 dining experience at partner restaurants',
    category: 'experience',
    pointCost: 750,
    available: true,
    imageEmoji: '🍽️',
  },
  {
    id: 'rw-005',
    name: 'Learning Platform Access',
    description: '6-month Coursera Plus subscription',
    category: 'experience',
    pointCost: 1000,
    available: true,
    imageEmoji: '📚',
  },
  {
    id: 'rw-006',
    name: 'Wellness Benefit',
    description: '$100 gym or spa credit',
    category: 'experience',
    pointCost: 1000,
    available: false,
    imageEmoji: '💪',
  },
  {
    id: 'rw-007',
    name: 'Tech Accessories',
    description: 'Choice of premium desk accessories bundle',
    category: 'gift-card',
    pointCost: 1500,
    available: true,
    imageEmoji: '🖥️',
  },
  {
    id: 'rw-008',
    name: 'Team Lunch Budget',
    description: '$200 budget for a team lunch of your choice',
    category: 'experience',
    pointCost: 2000,
    available: true,
    imageEmoji: '🥗',
  },
];

const COMPANY_VALUES: CompanyValue[] = [
  'Innovation',
  'Teamwork',
  'Customer-Focus',
  'Integrity',
  'Excellence',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'feed', label: 'Feed', icon: Heart },
  { id: 'send', label: 'Send Recognition', icon: Send },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'store', label: 'Rewards Store', icon: ShoppingBag },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
];

function typeConfig(type: RecognitionType) {
  const map = {
    kudos: { label: 'Kudos', color: 'bg-blue-100 text-blue-700', icon: ThumbsUp },
    'values-award': { label: 'Values Award', color: 'bg-purple-100 text-purple-700', icon: Award },
    'spot-bonus': { label: 'Spot Bonus', color: 'bg-amber-100 text-amber-700', icon: Zap },
    milestone: { label: 'Milestone', color: 'bg-emerald-100 text-emerald-700', icon: Star },
  };
  return map[type];
}

function valueColor(v: CompanyValue): string {
  const map: Record<CompanyValue, string> = {
    Innovation: 'bg-blue-100 text-blue-700',
    Teamwork: 'bg-green-100 text-green-700',
    'Customer-Focus': 'bg-orange-100 text-orange-700',
    Integrity: 'bg-violet-100 text-violet-700',
    Excellence: 'bg-pink-100 text-pink-700',
  };
  return map[v];
}

function Avatar({
  initials,
  color,
  size = 'md',
}: {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Tab: Feed ─────────────────────────────────────────────────────────────────

function FeedTab() {
  const [posts, setPosts] = useState<RecognitionPost[]>(FEED_POSTS);
  const [filter, setFilter] = useState<'all' | RecognitionType>('all');

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.type === filter);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Recognitions This Month', value: '248', color: 'text-blue-600' },
          { label: 'Points Awarded', value: '42,500', color: 'text-amber-600' },
          { label: 'Participation Rate', value: '83%', color: 'text-emerald-600' },
          { label: 'My Points Balance', value: '1,350', color: 'text-purple-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'kudos', 'values-award', 'spot-bonus', 'milestone'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'all' ? 'All' : typeConfig(f as RecognitionType).label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => {
          const { label, color, icon: Icon } = typeConfig(post.type);
          return (
            <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <Avatar initials={post.senderInitials} color={post.senderColor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{post.sender}</span>
                    <span className="text-gray-400 text-xs">recognized</span>
                    <Avatar initials={post.receiverInitials} color={post.receiverColor} size="sm" />
                    <span className="font-semibold text-gray-800 text-sm">{post.receiver}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} flex items-center gap-1`}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">{post.message}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {post.values.map((v) => (
                      <span
                        key={v}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${valueColor(v)}`}
                      >
                        {v}
                      </span>
                    ))}
                    <span className="ml-auto text-xs font-bold text-amber-600">
                      +{post.points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${post.liked ? 'text-blue-500' : ''}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-current' : ''}`} />{' '}
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                    </button>
                    <span className="ml-auto">{post.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Send Recognition ─────────────────────────────────────────────────────

function SendRecognitionTab() {
  const [selectedValues, setSelectedValues] = useState<CompanyValue[]>([]);
  const [recognitionType, setRecognitionType] = useState<RecognitionType>('kudos');
  const [points, setPoints] = useState<number>(100);
  const [recipient, setRecipient] = useState('');

  const toggleValue = (v: CompanyValue) => {
    setSelectedValues((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const pointPresets: Record<RecognitionType, number> = {
    kudos: 100,
    'values-award': 500,
    'spot-bonus': 1000,
    milestone: 250,
  };

  const handleTypeChange = (t: RecognitionType) => {
    setRecognitionType(t);
    setPoints(pointPresets[t]);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Send Recognition</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee by name..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recognition Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['kudos', 'values-award', 'spot-bonus', 'milestone'] as RecognitionType[]).map(
                (t) => {
                  const { label, _color, icon: Icon } = typeConfig(t);
                  return (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${recognitionType === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-1 ${recognitionType === t ? 'text-blue-600' : 'text-gray-400'}`}
                      />
                      <p
                        className={`text-xs font-semibold ${recognitionType === t ? 'text-blue-700' : 'text-gray-600'}`}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-gray-400">{pointPresets[t]} pts</p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Values (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPANY_VALUES.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleValue(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedValues.includes(v) ? valueColor(v) + ' border-current' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recognition Message
            </label>
            <textarea
              rows={4}
              placeholder="Share why this person deserves recognition. Be specific and heartfelt!"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points to Award</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={recognitionType === 'spot-bonus' ? 2000 : 1000}
                step={50}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-amber-600 w-16 text-right">{points} pts</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your remaining budget: 4,200 pts this quarter
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">
              Preview
            </button>
            <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Recognition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Leaderboard ──────────────────────────────────────────────────────────

function LeaderboardTab() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('monthly');

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['monthly', 'quarterly', 'annual'] as LeaderboardPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {LEADERBOARD.slice(0, 3).map((entry, idx) => (
          <div
            key={entry.rank}
            className={`bg-white rounded-xl border shadow-sm p-4 text-center ${idx === 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}
          >
            <div className="text-2xl mb-2">{medals[idx]}</div>
            <Avatar initials={entry.initials} color={entry.color} size="lg" />
            <p className="font-semibold text-gray-800 text-sm mt-2">{entry.name}</p>
            <p className="text-xs text-gray-500">{entry.department}</p>
            <p
              className={`text-xl font-bold mt-2 ${idx === 0 ? 'text-amber-600' : 'text-gray-700'}`}
            >
              {entry.points.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">points</p>
            {entry.badge && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {entry.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Top Recognized Employees</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {LEADERBOARD.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-4 p-4 hover:bg-gray-50">
              <span className="w-6 text-sm font-bold text-gray-400">{entry.rank}</span>
              <Avatar initials={entry.initials} color={entry.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
                <p className="text-xs text-gray-500">{entry.department}</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs text-gray-500">Received</p>
                <p className="text-sm font-semibold text-gray-700">{entry.recognitionsReceived}</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs text-gray-500">Given</p>
                <p className="text-sm font-semibold text-gray-700">{entry.recognitionsGiven}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Points</p>
                <p className="text-sm font-bold text-amber-600">{entry.points.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department rankings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Department Rankings</h3>
        <div className="space-y-3">
          {DEPT_RANKINGS.map((dept, idx) => (
            <div key={dept.department} className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}</span>
              <span className="text-sm text-gray-700 w-28">{dept.department}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(dept.totalPoints / DEPT_RANKINGS[0].totalPoints) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 w-16 text-right">
                {dept.totalPoints.toLocaleString()} pts
              </span>
              <span className="text-xs text-emerald-600 w-12 text-right">
                {dept.participationRate}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Rewards Store ────────────────────────────────────────────────────────

function RewardsStoreTab() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Rewards' },
    { id: 'gift-card', label: 'Gift Cards' },
    { id: 'pto', label: 'Extra PTO' },
    { id: 'charity', label: 'Charity' },
    { id: 'experience', label: 'Experiences' },
  ];

  const filtered =
    categoryFilter === 'all' ? REWARDS : REWARDS.filter((r) => r.category === categoryFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${categoryFilter === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">1,350 pts available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reward) => (
          <div
            key={reward.id}
            className={`bg-white rounded-xl border shadow-sm p-4 ${!reward.available ? 'opacity-60' : ''}`}
          >
            <div className="text-3xl mb-3">{reward.imageEmoji}</div>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">{reward.name}</h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{reward.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-600">{reward.pointCost} pts</span>
              <button
                disabled={!reward.available}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium ${reward.available ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {reward.available ? 'Redeem' : 'Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Reports ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const valueStats = [
    { value: 'Excellence', count: 142, pct: 35 },
    { value: 'Teamwork', count: 118, pct: 29 },
    { value: 'Innovation', count: 82, pct: 20 },
    { value: 'Customer-Focus', count: 48, pct: 12 },
    { value: 'Integrity', count: 16, pct: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Recognitions',
            value: '406',
            sub: 'This quarter',
            color: 'text-blue-600',
          },
          {
            label: 'Total Points Awarded',
            value: '124K',
            sub: 'This quarter',
            color: 'text-amber-600',
          },
          {
            label: 'Program Participation',
            value: '83%',
            sub: '+5% vs last qtr',
            color: 'text-emerald-600',
          },
          {
            label: 'Avg Points per Employee',
            value: '428',
            sub: 'Per quarter',
            color: 'text-purple-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Most Recognized Values</h3>
          <div className="space-y-3">
            {valueStats.map((v) => (
              <div key={v.value} className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium w-28 text-center ${valueColor(v.value as CompanyValue)}`}
                >
                  {v.value}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v.pct}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-16 text-right">
                  {v.count} ({v.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recognition by Department</h3>
          <div className="space-y-3">
            {DEPT_RANKINGS.map((dept) => (
              <div key={dept.department} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-28">{dept.department}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(dept.recognitionsGiven / DEPT_RANKINGS[0].recognitionsGiven) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {dept.recognitionsGiven}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RecognitionRewards() {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recognition &amp; Rewards</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Celebrate achievements and recognize outstanding contributions
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" /> Recognize Someone
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TAB_LIST.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'feed' && <FeedTab />}
          {activeTab === 'send' && <SendRecognitionTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'store' && <RewardsStoreTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </>
      )}
    </div>
  );
}
