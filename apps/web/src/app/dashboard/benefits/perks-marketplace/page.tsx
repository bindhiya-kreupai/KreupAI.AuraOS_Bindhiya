"use client";

import React, { useState, useEffect } from 'react';
import { Gift, Search, Tag, ShoppingBag, Star, Loader2 } from 'lucide-react';
import { BenefitPlanService } from '../services';

interface Perk {
  id: string;
  name: string;
  provider: string;
  category: string;
  discount: string;
  description: string;
  rating: number;
  featured: boolean;
}

export default function PerksMarketplacePage() {
  const [perks, setPerks] = useState<Perk[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerks();
  }, []);

  const fetchPerks = async () => {
    try {
      setLoading(true);
      // Load benefit plans and convert them to perks for the marketplace
      const response = await BenefitPlanService.getPlans({ status: 'ACTIVE' });
      const plans = response?.data || response || [];

      if (Array.isArray(plans) && plans.length > 0) {
        const perkItems: Perk[] = plans.map((plan: any) => {
          const cat = (plan.category || 'OTHER').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          const employeeCost = plan.employeePremium || 0;
          const employerCost = plan.employerPremium || 0;
          const discount = employeeCost === 0
            ? 'Fully Covered'
            : employerCost > 0
              ? `${Math.round((employerCost / (employeeCost + employerCost)) * 100)}% employer paid`
              : `$${employeeCost}/mo`;

          return {
            id: plan.id,
            name: plan.planName || plan.name || 'Benefit Plan',
            provider: plan.carrierName || 'Company',
            category: cat,
            discount,
            description: plan.description || 'Benefit plan available through your employer',
            rating: 0,
            featured: plan.displayOrder <= 2,
          };
        });

        setPerks(perkItems);

        // Extract unique categories
        const uniqueCats = ['All', ...new Set(perkItems.map(p => p.category))];
        setCategories(uniqueCats);
      } else {
        setPerks([]);
      }
    } catch (error) {
      console.error('Error fetching perks:', error);
      setPerks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPerks = perks.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Perks Marketplace</h1>
        <p className="text-sm text-silver-mist mt-1">Exclusive discounts and benefits for employees</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search perks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-celestial-indigo text-white'
                : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Banner */}
      {perks.some(p => p.featured) && (
        <div className="bg-gradient-to-r from-celestial-indigo/10 to-purple-500/10 dark:from-celestial-indigo/20 dark:to-purple-500/20 rounded-xl p-5 border border-celestial-indigo/20">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-sunset-amber" />
            <span className="text-xs font-bold text-celestial-indigo uppercase">Featured Benefits</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {perks.filter(p => p.featured).map((perk) => (
              <div key={perk.id} className="bg-white dark:bg-stellar-blue p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{perk.name}</p>
                <p className="text-xs text-silver-mist">{perk.provider}</p>
                <p className="text-xs font-bold text-celestial-indigo mt-1">{perk.discount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perks Grid */}
      {filteredPerks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gift className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-2">No Perks Available</h3>
          <p className="text-silver-mist max-w-md">
            {searchQuery ? 'No perks match your search. Try different keywords.' : 'No benefit perks are available at this time. Check back later.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPerks.map((perk) => (
            <div key={perk.id} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 hover:border-celestial-indigo/50 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-celestial-indigo/10">
                  <Gift className="w-5 h-5 text-celestial-indigo" />
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded-full text-silver-mist font-medium">{perk.category}</span>
              </div>
              <h3 className="text-sm font-bold text-ink-black dark:text-pearl">{perk.name}</h3>
              <p className="text-xs text-silver-mist mt-0.5">{perk.provider}</p>
              <p className="text-xs text-silver-mist mt-2">{perk.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/50">
                <div className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-celestial-indigo" />
                  <span className="text-xs font-bold text-celestial-indigo">{perk.discount}</span>
                </div>
                {perk.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-sunset-amber fill-sunset-amber" />
                    <span className="text-xs text-silver-mist">{perk.rating}</span>
                  </div>
                )}
              </div>
              <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-celestial-indigo bg-celestial-indigo/5 rounded-lg hover:bg-celestial-indigo/10 transition-colors opacity-0 group-hover:opacity-100">
                <ShoppingBag className="w-3.5 h-3.5" /> View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
