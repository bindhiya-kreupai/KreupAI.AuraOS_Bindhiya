import React from 'react';
import Image from 'next/image';
import { Button } from '@aura/ui/components/ui/button';
import { Check, X, ArrowRight, DollarSign, TrendingUp } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$8',
    period: '/user/mo',
    desc: 'Essential HR tools for small growing teams.',
    features: [
      'Core HR & Employee Database',
      'Time & Attendance',
      'Basic Payroll Integration',
      'Mobile App Access',
      'Self-Service Portal',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$15',
    period: '/user/mo',
    desc: 'Advanced automation and analytics for scaling companies.',
    features: [
      'Everything in Starter',
      'Performance Management',
      'Recruitment (ATS)',
      'AI Resume Screening',
      'Custom Reports',
      'Slack/Teams Integration',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Full-platform power for complex localized organizations.',
    features: [
      'Everything in Professional',
      'Global Payroll & Compliance',
      'Succession Planning',
      'Org Design Modeling',
      'Dedicated Success Manager',
      'SLA & 99.99% Uptime',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-pearl dark:bg-deep-cosmos min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* AuraOS Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/auraos-logo.png"
              alt="AuraOS Logo"
              width={120}
              height={120}
              className="w-24 h-24 md:w-28 md:h-28"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-black dark:text-pearl mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-twilight dark:text-silver-mist">
            No hidden implementation fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col ${plan.popular ? 'bg-white dark:bg-deep-cosmos border-2 border-celestial-indigo shadow-2xl scale-105 z-10' : 'bg-pearl dark:bg-stellar-blue/10 border border-cloud dark:border-nebula-purple'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-celestial-indigo text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-ink-black dark:text-pearl mb-2">
                  {plan.name}
                </h3>
                <p className="text-twilight dark:text-silver-mist text-sm min-h-[40px]">
                  {plan.desc}
                </p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-ink-black dark:text-pearl">
                  {plan.price}
                </span>
                <span className="text-twilight dark:text-silver-mist">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-celestial-indigo shrink-0" />
                    <span className="text-sm text-ink-black dark:text-pearl">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full h-12 ${plan.popular ? 'bg-celestial-indigo hover:bg-celestial-indigo/90 text-white' : 'bg-white dark:bg-stellar-blue/20 text-ink-black dark:text-pearl border border-cloud hover:bg-cloud/50'}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-20 text-center max-w-4xl mx-auto">
          <div className="bg-white dark:bg-deep-cosmos rounded-2xl p-8 md:p-12 border border-cloud dark:border-nebula-purple shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-celestial-indigo" />
              <h3 className="text-2xl md:text-3xl font-bold text-ink-black dark:text-pearl">
                See Your Potential Savings
              </h3>
            </div>

            <p className="text-twilight dark:text-silver-mist text-lg mb-8">
              Companies using AuraOS typically see these results in the first year:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-xl bg-pearl dark:bg-stellar-blue/10 border border-cloud dark:border-nebula-purple">
                <div className="text-3xl font-bold text-celestial-indigo mb-2">80%</div>
                <div className="text-sm text-twilight dark:text-silver-mist">
                  Reduction in HR admin time
                </div>
                <div className="text-xs text-twilight dark:text-silver-mist mt-2">
                  ≈ 15-20 hrs/week saved
                </div>
              </div>
              <div className="p-6 rounded-xl bg-pearl dark:bg-stellar-blue/10 border border-cloud dark:border-nebula-purple">
                <div className="text-3xl font-bold text-celestial-indigo mb-2">45%</div>
                <div className="text-sm text-twilight dark:text-silver-mist">
                  Faster time-to-hire
                </div>
                <div className="text-xs text-twilight dark:text-silver-mist mt-2">
                  From 42 to 23 days average
                </div>
              </div>
              <div className="p-6 rounded-xl bg-pearl dark:bg-stellar-blue/10 border border-cloud dark:border-nebula-purple">
                <div className="text-3xl font-bold text-celestial-indigo mb-2">$125K</div>
                <div className="text-sm text-twilight dark:text-silver-mist">
                  Avg. annual savings
                </div>
                <div className="text-xs text-twilight dark:text-silver-mist mt-2">
                  For 200-employee company
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-celestial-indigo/10 to-quantum-rose/10 rounded-xl p-6 border border-celestial-indigo/20">
              <div className="flex items-start gap-4">
                <DollarSign className="w-6 h-6 text-celestial-indigo shrink-0 mt-1" />
                <div className="text-left">
                  <div className="font-semibold text-ink-black dark:text-pearl mb-2">
                    Example: 200-employee company on Professional plan
                  </div>
                  <div className="text-sm text-twilight dark:text-silver-mist space-y-1">
                    <div>Monthly cost: $3,000 (200 users × $15)</div>
                    <div>Annual investment: $36,000</div>
                    <div className="font-semibold text-celestial-indigo pt-2">
                      Typical ROI: 3.5x in first year
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-ink-black dark:text-pearl text-center mb-12">
            Compare Plans
          </h3>

          <div className="bg-white dark:bg-deep-cosmos rounded-2xl border border-cloud dark:border-nebula-purple overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pearl dark:bg-stellar-blue/10">
                  <tr>
                    <th className="text-left p-6 text-ink-black dark:text-pearl font-semibold">
                      Features
                    </th>
                    <th className="text-center p-6 text-ink-black dark:text-pearl font-semibold">
                      Starter
                    </th>
                    <th className="text-center p-6 text-ink-black dark:text-pearl font-semibold bg-celestial-indigo/10">
                      <div>Professional</div>
                      <div className="text-xs text-celestial-indigo font-normal mt-1">
                        Most Popular
                      </div>
                    </th>
                    <th className="text-center p-6 text-ink-black dark:text-pearl font-semibold">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud dark:divide-nebula-purple">
                  {[
                    {
                      feature: 'Core HR & Employee Database',
                      starter: true,
                      pro: true,
                      enterprise: true,
                    },
                    {
                      feature: 'Time & Attendance Tracking',
                      starter: true,
                      pro: true,
                      enterprise: true,
                    },
                    { feature: 'Mobile App Access', starter: true, pro: true, enterprise: true },
                    { feature: 'Self-Service Portal', starter: true, pro: true, enterprise: true },
                    {
                      feature: 'Basic Payroll Integration',
                      starter: true,
                      pro: true,
                      enterprise: true,
                    },
                    {
                      feature: 'Performance Management',
                      starter: false,
                      pro: true,
                      enterprise: true,
                    },
                    { feature: 'Recruitment & ATS', starter: false, pro: true, enterprise: true },
                    { feature: 'AI Resume Screening', starter: false, pro: true, enterprise: true },
                    {
                      feature: 'Custom Reports & Analytics',
                      starter: false,
                      pro: true,
                      enterprise: true,
                    },
                    {
                      feature: 'Slack/Teams Integration',
                      starter: false,
                      pro: true,
                      enterprise: true,
                    },
                    {
                      feature: 'Advanced AI Agents',
                      starter: false,
                      pro: 'Limited',
                      enterprise: true,
                    },
                    {
                      feature: 'Global Payroll & Compliance',
                      starter: false,
                      pro: false,
                      enterprise: true,
                    },
                    {
                      feature: 'Succession Planning',
                      starter: false,
                      pro: false,
                      enterprise: true,
                    },
                    {
                      feature: 'Org Design Modeling',
                      starter: false,
                      pro: false,
                      enterprise: true,
                    },
                    {
                      feature: 'Dedicated Success Manager',
                      starter: false,
                      pro: false,
                      enterprise: true,
                    },
                    {
                      feature: 'SLA & 99.99% Uptime',
                      starter: '99.9%',
                      pro: '99.9%',
                      enterprise: true,
                    },
                    {
                      feature: 'Priority Support',
                      starter: false,
                      pro: 'Email',
                      enterprise: '24/7 Phone',
                    },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-pearl/50 dark:hover:bg-stellar-blue/5">
                      <td className="p-4 text-ink-black dark:text-pearl">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.starter === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.starter === false ? (
                          <X className="w-5 h-5 text-twilight/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-twilight dark:text-silver-mist">
                            {row.starter}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-celestial-indigo/5">
                        {row.pro === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.pro === false ? (
                          <X className="w-5 h-5 text-twilight/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-twilight dark:text-silver-mist">
                            {row.pro}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.enterprise === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.enterprise === false ? (
                          <X className="w-5 h-5 text-twilight/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-twilight dark:text-silver-mist">
                            {row.enterprise}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ for Pricing */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-ink-black dark:text-pearl text-center mb-12">
            Pricing Questions
          </h3>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.',
              },
              {
                q: 'What happens after my free trial?',
                a: 'Your trial includes full access to Professional features for 14 days. No credit card required. After the trial, you can choose a plan or continue with our free tier (up to 10 users).',
              },
              {
                q: 'Are there any setup or implementation fees?',
                a: 'No hidden fees. The price you see is what you pay. Enterprise plans include dedicated onboarding and migration support at no extra cost.',
              },
              {
                q: 'How does billing work for adding/removing users?',
                a: "We use prorated billing. If you add users mid-cycle, you're charged only for the remaining days. Removed users are credited to your next invoice.",
              },
              {
                q: 'Do you offer discounts for nonprofits or educational institutions?',
                a: 'Yes! We offer 30% discounts for registered nonprofits and educational institutions. Contact our sales team for details.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-deep-cosmos rounded-xl p-6 border border-cloud dark:border-nebula-purple"
              >
                <div className="font-semibold text-ink-black dark:text-pearl mb-3">{faq.q}</div>
                <div className="text-twilight dark:text-silver-mist leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-gradient-to-r from-celestial-indigo via-purple-600 to-quantum-rose p-1 rounded-2xl">
            <div className="bg-white dark:bg-deep-cosmos rounded-2xl px-12 py-10">
              <h3 className="text-2xl md:text-3xl font-bold text-ink-black dark:text-pearl mb-4">
                Ready to transform your HR?
              </h3>
              <p className="text-twilight dark:text-silver-mist mb-6 max-w-xl mx-auto">
                Join 500+ companies already saving time and money with AuraOS
              </p>
              <Button
                size="lg"
                className="bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-full px-8 h-12 text-base"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <div className="mt-4 text-sm text-twilight dark:text-silver-mist">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
