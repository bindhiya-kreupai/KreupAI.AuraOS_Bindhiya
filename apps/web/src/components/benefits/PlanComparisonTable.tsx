"use client";

import React from "react";
import { Check, X, Shield } from "lucide-react";

interface PlanDetails {
  id: string;
  name: string;
  monthlyPremium: number;
  deductible: number;
  copay: number;
  maxOutOfPocket: number;
  coveredServices: { name: string; covered: boolean }[];
}

const mockPlans: PlanDetails[] = [
  {
    id: "basic",
    name: "Basic",
    monthlyPremium: 150,
    deductible: 5000,
    copay: 40,
    maxOutOfPocket: 8000,
    coveredServices: [
      { name: "Preventive Care", covered: true },
      { name: "Emergency Room", covered: true },
      { name: "Specialist Visits", covered: false },
      { name: "Mental Health", covered: false },
      { name: "Prescription Drugs", covered: true },
      { name: "Vision & Dental", covered: false },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    monthlyPremium: 300,
    deductible: 2500,
    copay: 25,
    maxOutOfPocket: 5000,
    coveredServices: [
      { name: "Preventive Care", covered: true },
      { name: "Emergency Room", covered: true },
      { name: "Specialist Visits", covered: true },
      { name: "Mental Health", covered: true },
      { name: "Prescription Drugs", covered: true },
      { name: "Vision & Dental", covered: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPremium: 500,
    deductible: 1000,
    copay: 10,
    maxOutOfPocket: 3000,
    coveredServices: [
      { name: "Preventive Care", covered: true },
      { name: "Emergency Room", covered: true },
      { name: "Specialist Visits", covered: true },
      { name: "Mental Health", covered: true },
      { name: "Prescription Drugs", covered: true },
      { name: "Vision & Dental", covered: true },
    ],
  },
];

export default function PlanComparisonTable() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Plan Comparison
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cloud dark:border-nebula-purple/50">
              <th className="py-3 px-4 text-silver-mist font-medium text-sm">Feature</th>
              {mockPlans.map((plan) => (
                <th
                  key={plan.id}
                  className="py-3 px-4 text-center"
                >
                  <span className="text-ink-black dark:text-pearl font-semibold text-base">
                    {plan.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
            <tr>
              <td className="py-3 px-4 text-ink-black dark:text-pearl text-sm font-medium">
                Monthly Premium
              </td>
              {mockPlans.map((plan) => (
                <td key={plan.id} className="py-3 px-4 text-center text-celestial-indigo font-semibold">
                  ${ plan.monthlyPremium}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-ink-black dark:text-pearl text-sm font-medium">
                Annual Deductible
              </td>
              {mockPlans.map((plan) => (
                <td key={plan.id} className="py-3 px-4 text-center text-ink-black dark:text-pearl">
                  ${ plan.deductible.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-ink-black dark:text-pearl text-sm font-medium">
                Copay
              </td>
              {mockPlans.map((plan) => (
                <td key={plan.id} className="py-3 px-4 text-center text-ink-black dark:text-pearl">
                  ${ plan.copay}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-ink-black dark:text-pearl text-sm font-medium">
                Max Out-of-Pocket
              </td>
              {mockPlans.map((plan) => (
                <td key={plan.id} className="py-3 px-4 text-center text-ink-black dark:text-pearl">
                  ${ plan.maxOutOfPocket.toLocaleString()}
                </td>
              ))}
            </tr>
            {mockPlans[0].coveredServices.map((service) => (
              <tr key={service.name}>
                <td className="py-3 px-4 text-ink-black dark:text-pearl text-sm font-medium">
                  {service.name}
                </td>
                {mockPlans.map((plan) => {
                  const planService = plan.coveredServices.find(
                    (s) => s.name === service.name
                  );
                  return (
                    <td key={plan.id} className="py-3 px-4 text-center">
                      {planService?.covered ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
