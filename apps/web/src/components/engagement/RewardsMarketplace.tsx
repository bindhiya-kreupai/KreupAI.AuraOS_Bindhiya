// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module RewardsMarketplace
 * @description Rewards redemption marketplace — points balance, reward categories,
 *              redeem flow, order history (Sec 13.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Gift,
  Heart,
  Tag,
  CheckCircle,
  ChevronRight,
  Clock,
  Search,
  Filter,
  X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type RewardCategory = 'gift_card' | 'experience' | 'charity' | 'swag';

interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;
  emoji: string;
  available: boolean;
  stock?: number;
  deliveryInfo: string;
  brand?: string;
}

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  description: string;
  points: number;
  date: string;
}

interface OrderHistoryItem {
  id: string;
  rewardName: string;
  rewardEmoji: string;
  pointsUsed: number;
  status: 'processing' | 'fulfilled' | 'delivered';
  orderedAt: string;
  deliveryInfo: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_REWARDS: Reward[] = [
  {
    id: 'reward-001',
    name: 'Amazon Gift Card',
    description: '$25 Amazon.com gift card delivered via email within 24 hours.',
    category: 'gift_card',
    pointsCost: 250,
    emoji: '🛒',
    available: true,
    deliveryInfo: 'Email delivery in 24h',
    brand: 'Amazon',
  },
  {
    id: 'reward-002',
    name: 'Starbucks Gift Card',
    description: '$15 Starbucks gift card for your next coffee run.',
    category: 'gift_card',
    pointsCost: 150,
    emoji: '☕',
    available: true,
    deliveryInfo: 'Email delivery in 24h',
    brand: 'Starbucks',
  },
  {
    id: 'reward-003',
    name: 'Netflix Subscription',
    description: '1-month Netflix Standard subscription.',
    category: 'gift_card',
    pointsCost: 200,
    emoji: '🎬',
    available: true,
    deliveryInfo: 'Email delivery in 24h',
    brand: 'Netflix',
  },
  {
    id: 'reward-004',
    name: 'Spa Day Experience',
    description: 'Full-day relaxation experience at a partner spa of your choice.',
    category: 'experience',
    pointsCost: 1000,
    emoji: '🧖',
    available: true,
    deliveryInfo: 'Voucher mailed within 3 days',
    stock: 5,
  },
  {
    id: 'reward-005',
    name: 'Cooking Class',
    description: 'Online gourmet cooking class with professional chef — choose your cuisine.',
    category: 'experience',
    pointsCost: 500,
    emoji: '👨‍🍳',
    available: true,
    deliveryInfo: 'Access link in 48h',
  },
  {
    id: 'reward-006',
    name: 'Online Course Voucher',
    description: '$50 credit for Udemy, Coursera, or LinkedIn Learning courses.',
    category: 'experience',
    pointsCost: 500,
    emoji: '🎓',
    available: true,
    deliveryInfo: 'Email delivery in 24h',
  },
  {
    id: 'reward-007',
    name: 'Plant a Tree',
    description: 'Donate to plant 10 trees in a reforestation area on your behalf.',
    category: 'charity',
    pointsCost: 100,
    emoji: '🌳',
    available: true,
    deliveryInfo: 'Certificate emailed in 48h',
  },
  {
    id: 'reward-008',
    name: 'Feed a Family',
    description: 'Donate to provide food for a family for one week through our partner NGO.',
    category: 'charity',
    pointsCost: 150,
    emoji: '🥗',
    available: true,
    deliveryInfo: 'Impact report in 48h',
  },
  {
    id: 'reward-009',
    name: 'Animal Shelter Donation',
    description: 'Support local animal shelters with supplies worth your donation value.',
    category: 'charity',
    pointsCost: 200,
    emoji: '🐾',
    available: true,
    deliveryInfo: 'Receipt emailed in 24h',
  },
  {
    id: 'reward-010',
    name: 'Company Hoodie',
    description: 'Premium branded hoodie in your preferred color and size.',
    category: 'swag',
    pointsCost: 400,
    emoji: '👕',
    available: true,
    deliveryInfo: 'Shipped in 5-7 days',
    stock: 12,
  },
  {
    id: 'reward-011',
    name: 'Company Water Bottle',
    description: 'Stainless steel insulated water bottle with company branding.',
    category: 'swag',
    pointsCost: 200,
    emoji: '🫗',
    available: true,
    deliveryInfo: 'Shipped in 5-7 days',
    stock: 30,
  },
  {
    id: 'reward-012',
    name: 'Premium Notebook Set',
    description: 'Moleskine notebook set with company-branded cover.',
    category: 'swag',
    pointsCost: 150,
    emoji: '📓',
    available: false,
    deliveryInfo: 'Out of stock',
    stock: 0,
  },
];

const MOCK_TRANSACTIONS: PointsTransaction[] = [
  {
    id: 'tx-001',
    type: 'earned',
    description: 'Recognition from Jane Doe',
    points: 100,
    date: '2026-02-24',
  },
  {
    id: 'tx-002',
    type: 'earned',
    description: 'Q4 Performance Bonus Points',
    points: 500,
    date: '2026-02-15',
  },
  {
    id: 'tx-003',
    type: 'redeemed',
    description: 'Starbucks Gift Card',
    points: -150,
    date: '2026-02-10',
  },
  {
    id: 'tx-004',
    type: 'earned',
    description: 'Recognition from Team',
    points: 200,
    date: '2026-02-05',
  },
  {
    id: 'tx-005',
    type: 'earned',
    description: 'New Hire Welcome Bonus',
    points: 250,
    date: '2026-01-15',
  },
  {
    id: 'tx-006',
    type: 'redeemed',
    description: 'Plant a Tree Donation',
    points: -100,
    date: '2026-01-10',
  },
];

const MOCK_ORDER_HISTORY: OrderHistoryItem[] = [
  {
    id: 'order-001',
    rewardName: 'Starbucks Gift Card',
    rewardEmoji: '☕',
    pointsUsed: 150,
    status: 'delivered',
    orderedAt: '2026-02-10',
    deliveryInfo: 'Delivered to john.doe@company.com',
  },
  {
    id: 'order-002',
    rewardName: 'Plant a Tree',
    rewardEmoji: '🌳',
    pointsUsed: 100,
    status: 'fulfilled',
    orderedAt: '2026-01-10',
    deliveryInfo: '10 trees planted in Ethiopia',
  },
];

const CURRENT_BALANCE = MOCK_TRANSACTIONS.reduce((sum, tx) => sum + tx.points, 0);

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES: { key: RewardCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: ShoppingBag },
  { key: 'gift_card', label: 'Gift Cards', icon: Tag },
  { key: 'experience', label: 'Experiences', icon: Star },
  { key: 'charity', label: 'Charity', icon: Heart },
  { key: 'swag', label: 'Company Swag', icon: Gift },
];

// ── Redeem Modal ──────────────────────────────────────────────────────────────

function RedeemModal({
  reward,
  balance,
  onConfirm,
  onClose,
}: {
  reward: Reward;
  balance: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const canAfford = balance >= reward.pointsCost;
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 800));
    setConfirming(false);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="text-5xl mb-3">{reward.emoji}</div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">{reward.name}</h2>
          <p className="text-sm text-slate-500 mb-4">{reward.description}</p>
          <div className="bg-slate-50 rounded-xl p-4 mb-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Reward Cost</span>
              <span className="font-semibold text-amber-600">⭐ {reward.pointsCost} points</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Your Balance</span>
              <span className={`font-semibold ${canAfford ? 'text-emerald-600' : 'text-red-500'}`}>
                ⭐ {balance} points
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
              <span className="text-slate-500">After Redemption</span>
              <span className="font-semibold text-slate-700">
                ⭐ {balance - reward.pointsCost} points
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Delivery</span>
              <span className="text-slate-700">{reward.deliveryInfo}</span>
            </div>
          </div>
          {!canAfford && (
            <p className="text-sm text-red-500 mb-4">
              Insufficient points. You need {reward.pointsCost - balance} more points.
            </p>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canAfford || confirming}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {confirming ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirm Redeem
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface RewardsMarketplaceProps {
  employeeId?: string;
}

export default function RewardsMarketplace({ employeeId: _employeeId }: RewardsMarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState<RewardCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<Reward | null>(null);
  const [balance, setBalance] = useState(CURRENT_BALANCE);
  const [showHistory, setShowHistory] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryItem[]>(MOCK_ORDER_HISTORY);
  const [maxPoints, setMaxPoints] = useState<number | null>(null);

  const handleRedeem = () => {
    if (!selectedReward) return;
    setBalance((prev) => prev - selectedReward.pointsCost);
    setOrders((prev) => [
      {
        id: `order-${Date.now()}`,
        rewardName: selectedReward.name,
        rewardEmoji: selectedReward.emoji,
        pointsUsed: selectedReward.pointsCost,
        status: 'processing',
        orderedAt: new Date().toISOString().split('T')[0],
        deliveryInfo: selectedReward.deliveryInfo,
      },
      ...prev,
    ]);
    setRedeemSuccess(selectedReward);
    setSelectedReward(null);
  };

  const filtered = MOCK_REWARDS.filter((r) => {
    const matchCat = activeCategory === 'all' || r.category === activeCategory;
    const matchSearch = search === '' || r.name.toLowerCase().includes(search.toLowerCase());
    const matchPoints = maxPoints === null || r.pointsCost <= maxPoints;
    return matchCat && matchSearch && matchPoints;
  });

  if (redeemSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="text-6xl mb-4">{redeemSuccess.emoji}</div>
        <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reward Redeemed!</h2>
        <p className="text-slate-600 mb-1 font-medium">{redeemSuccess.name}</p>
        <p className="text-sm text-slate-400 mb-1">{redeemSuccess.deliveryInfo}</p>
        <p className="text-sm text-slate-500 mb-6">
          Your new balance: <strong>⭐ {balance} points</strong>
        </p>
        <button
          onClick={() => setRedeemSuccess(null)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      {selectedReward && (
        <RedeemModal
          reward={selectedReward}
          balance={balance}
          onConfirm={handleRedeem}
          onClose={() => setSelectedReward(null)}
        />
      )}

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rewards Marketplace</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Redeem your recognition points for amazing rewards
          </p>
        </div>

        {/* Points Balance */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Your Points Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
                <span className="text-white/70 text-sm">points</span>
              </div>
            </div>
            <div className="text-5xl">⭐</div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowTransactions(true);
                setShowHistory(false);
              }}
              className="flex items-center gap-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              Points History
            </button>
            <button
              onClick={() => {
                setShowHistory(true);
                setShowTransactions(false);
              }}
              className="flex items-center gap-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Order History ({orders.length})
            </button>
          </div>
        </div>

        {/* Transactions panel */}
        {showTransactions && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Points History</h3>
              <button
                onClick={() => setShowTransactions(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-700">{tx.description}</p>
                    <p className="text-xs text-slate-400">{tx.date}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${tx.type === 'earned' ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {tx.points > 0 ? '+' : ''}
                    {tx.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order history panel */}
        {showHistory && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Order History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.id} className="py-3 flex items-center gap-3">
                    <span className="text-2xl">{order.rewardEmoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{order.rewardName}</p>
                      <p className="text-xs text-slate-400">{order.deliveryInfo}</p>
                      <p className="text-xs text-slate-400">Ordered: {order.orderedAt}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-amber-600">
                        ⭐ {order.pointsUsed}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.status === 'fulfilled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rewards..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={maxPoints ?? ''}
              onChange={(e) => setMaxPoints(e.target.value ? Number(e.target.value) : null)}
              className="pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Prices</option>
              <option value="150">Up to 150 pts</option>
              <option value="300">Up to 300 pts</option>
              <option value="500">Up to 500 pts</option>
              <option value="1000">Up to 1000 pts</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key as RewardCategory | 'all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rewards grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No rewards match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((reward) => {
              const canAfford = balance >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    reward.available
                      ? 'border-slate-200 hover:shadow-md hover:border-blue-300'
                      : 'border-slate-100 opacity-60'
                  }`}
                >
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 h-24 flex items-center justify-center text-5xl">
                    {reward.emoji}
                  </div>
                  <div className="p-4">
                    {reward.brand && (
                      <p className="text-xs text-slate-400 mb-0.5">{reward.brand}</p>
                    )}
                    <h3 className="font-semibold text-slate-800 leading-snug">{reward.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{reward.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span
                          className={`text-lg font-bold ${canAfford ? 'text-amber-600' : 'text-slate-400'}`}
                        >
                          ⭐ {reward.pointsCost}
                        </span>
                        {!canAfford && reward.available && (
                          <p className="text-xs text-red-400">
                            Need {reward.pointsCost - balance} more
                          </p>
                        )}
                      </div>
                      {!reward.available ? (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedReward(reward)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            canAfford
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!canAfford}
                        >
                          Redeem
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {reward.stock !== undefined && reward.stock > 0 && reward.stock < 15 && (
                      <p className="text-xs text-orange-500 mt-1.5">Only {reward.stock} left!</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{reward.deliveryInfo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
