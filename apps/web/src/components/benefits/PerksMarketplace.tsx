"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Heart,
  Utensils,
  Bus,
  BookOpen,
  Wallet,
  Search,
  Star,
  CheckCircle2,
  Tag,
} from "lucide-react";

interface Perk {
  id: string;
  name: string;
  description: string;
  category: "wellness" | "food" | "transport" | "learning";
  cost: number;
  originalValue: number;
  rating: number;
  redemptions: number;
  available: boolean;
  featured: boolean;
}

interface PerksData {
  availableBalance: number;
  monthlyAllocation: number;
  totalRedeemed: number;
  perks: Perk[];
}

const mockData: PerksData = {
  availableBalance: 450,
  monthlyAllocation: 200,
  totalRedeemed: 1250,
  perks: [
    {
      id: "p-001",
      name: "Gym Membership - Monthly",
      description: "Full access to partner gyms nationwide including classes and equipment.",
      category: "wellness",
      cost: 75,
      originalValue: 120,
      rating: 4.8,
      redemptions: 234,
      available: true,
      featured: true,
    },
    {
      id: "p-002",
      name: "Meal Delivery Credit",
      description: "Credit for healthy meal delivery services including DoorDash and UberEats.",
      category: "food",
      cost: 50,
      originalValue: 75,
      rating: 4.6,
      redemptions: 567,
      available: true,
      featured: true,
    },
    {
      id: "p-003",
      name: "Transit Pass - Monthly",
      description: "Subsidized monthly transit pass for bus, subway, and commuter rail.",
      category: "transport",
      cost: 85,
      originalValue: 150,
      rating: 4.9,
      redemptions: 189,
      available: true,
      featured: false,
    },
    {
      id: "p-004",
      name: "Online Course Voucher",
      description: "Access to premium online learning platforms including Coursera and Udemy.",
      category: "learning",
      cost: 100,
      originalValue: 200,
      rating: 4.7,
      redemptions: 345,
      available: true,
      featured: true,
    },
    {
      id: "p-005",
      name: "Meditation App - Annual",
      description: "Annual subscription to Calm or Headspace meditation apps.",
      category: "wellness",
      cost: 60,
      originalValue: 100,
      rating: 4.5,
      redemptions: 412,
      available: true,
      featured: false,
    },
    {
      id: "p-006",
      name: "Coffee Shop Credit",
      description: "Monthly credit for Starbucks, Blue Bottle, or local partner cafes.",
      category: "food",
      cost: 30,
      originalValue: 45,
      rating: 4.4,
      redemptions: 678,
      available: true,
      featured: false,
    },
    {
      id: "p-007",
      name: "Ride Share Credits",
      description: "Monthly Uber/Lyft credits for commute or business travel.",
      category: "transport",
      cost: 100,
      originalValue: 150,
      rating: 4.6,
      redemptions: 234,
      available: true,
      featured: false,
    },
    {
      id: "p-008",
      name: "Conference Ticket Subsidy",
      description: "Partial coverage for industry conference registration fees.",
      category: "learning",
      cost: 200,
      originalValue: 500,
      rating: 4.9,
      redemptions: 89,
      available: true,
      featured: false,
    },
    {
      id: "p-009",
      name: "Ergonomic Equipment Credit",
      description: "Credit toward standing desks, ergonomic chairs, or monitor arms.",
      category: "wellness",
      cost: 150,
      originalValue: 300,
      rating: 4.8,
      redemptions: 156,
      available: true,
      featured: false,
    },
    {
      id: "p-010",
      name: "Healthy Snack Box",
      description: "Monthly delivery of curated healthy snacks to your home or office.",
      category: "food",
      cost: 35,
      originalValue: 55,
      rating: 4.3,
      redemptions: 298,
      available: true,
      featured: false,
    },
  ],
};

const categoryConfig = {
  wellness: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
  food: { icon: Utensils, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  transport: { icon: Bus, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  learning: { icon: BookOpen, color: "text-celestial-indigo", bg: "bg-celestial-indigo/10" },
};

export default function PerksMarketplace() {
  const [data] = useState<PerksData>(mockData);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());

  const filteredPerks = data.perks.filter((perk) => {
    const matchesCategory = activeCategory === "all" || perk.category === activeCategory;
    const matchesSearch =
      perk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perk.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRedeem = (id: string) => {
    setRedeemed((prev) => new Set([...prev, id]));
  };

  const categories = [
    { key: "all", label: "All Perks", icon: ShoppingBag },
    { key: "wellness", label: "Wellness", icon: Heart },
    { key: "food", label: "Food & Drink", icon: Utensils },
    { key: "transport", label: "Transport", icon: Bus },
    { key: "learning", label: "Learning", icon: BookOpen },
  ];

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-celestial-indigo" />
            <div>
              <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
                Perks Marketplace
              </h1>
              <p className="text-sm text-silver-mist">
                Redeem your perks budget on exclusive benefits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo/10 border border-celestial-indigo/20">
            <Wallet className="w-4 h-4 text-celestial-indigo" />
            <span className="text-sm font-bold text-celestial-indigo">
              ${data.availableBalance} available
            </span>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <p className="text-xs text-silver-mist mb-1">Available Balance</p>
            <p className="text-xl font-bold text-ink-black dark:text-pearl">${data.availableBalance}</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <p className="text-xs text-silver-mist mb-1">Monthly Allocation</p>
            <p className="text-xl font-bold text-celestial-indigo">${data.monthlyAllocation}</p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 text-center">
            <p className="text-xs text-silver-mist mb-1">Total Redeemed</p>
            <p className="text-xl font-bold text-aurora-green">${data.totalRedeemed}</p>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search perks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? "bg-celestial-indigo text-white"
                    : "border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
                }`}
              >
                <CatIcon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPerks.map((perk) => {
            const catConfig = categoryConfig[perk.category];
            const CatIcon = catConfig.icon;
            const isRedeemed = redeemed.has(perk.id);
            const canAfford = perk.cost <= data.availableBalance;

            return (
              <div
                key={perk.id}
                className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 hover:shadow-md transition-shadow"
              >
                {perk.featured && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium text-yellow-600">Featured</span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catConfig.bg}`}>
                    <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {perk.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-silver-mist">{perk.rating}</span>
                      <span className="text-xs text-silver-mist">({perk.redemptions})</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-silver-mist mb-3 line-clamp-2">
                  {perk.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-ink-black dark:text-pearl">${perk.cost}</span>
                  <span className="text-sm text-silver-mist line-through">${perk.originalValue}</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-aurora-green/10 text-aurora-green">
                    {Math.round(((perk.originalValue - perk.cost) / perk.originalValue) * 100)}% off
                  </span>
                </div>

                <button
                  onClick={() => handleRedeem(perk.id)}
                  disabled={isRedeemed || !canAfford}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRedeemed
                      ? "bg-aurora-green/10 text-aurora-green"
                      : !canAfford
                      ? "bg-cloud dark:bg-nebula-purple/20 text-silver-mist cursor-not-allowed"
                      : "bg-celestial-indigo text-white hover:bg-celestial-indigo/90"
                  }`}
                >
                  {isRedeemed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Redeemed
                    </>
                  ) : !canAfford ? (
                    "Insufficient Balance"
                  ) : (
                    <>
                      <Tag className="w-4 h-4" /> Redeem
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
