"use client";

import React, { useState } from "react";
import {
  Heart,
  Baby,
  UserMinus,
  Skull,
  MapPin,
  ShieldOff,
  ArrowRight,
} from "lucide-react";

interface LifeEventType {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  deadlineDays: number;
}

const lifeEventTypes: LifeEventType[] = [
  {
    id: "marriage",
    label: "Marriage",
    description: "You recently got married or entered a domestic partnership.",
    icon: Heart,
    deadlineDays: 30,
  },
  {
    id: "birth_adoption",
    label: "Birth / Adoption",
    description: "You had a baby or adopted a child and need to add them to your plan.",
    icon: Baby,
    deadlineDays: 30,
  },
  {
    id: "divorce",
    label: "Divorce",
    description: "You are divorced or ended a domestic partnership.",
    icon: UserMinus,
    deadlineDays: 30,
  },
  {
    id: "death_dependent",
    label: "Death of Dependent",
    description: "A covered dependent has passed away.",
    icon: Skull,
    deadlineDays: 60,
  },
  {
    id: "address_change",
    label: "Address Change",
    description: "You moved to a new address that may affect plan availability.",
    icon: MapPin,
    deadlineDays: 60,
  },
  {
    id: "loss_of_coverage",
    label: "Loss of Coverage",
    description: "You or a dependent lost coverage from another source.",
    icon: ShieldOff,
    deadlineDays: 60,
  },
];

export default function LifeEventManager() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Report a Life Event
        </h2>
        <p className="text-silver-mist mt-1 text-sm">
          Select the type of qualifying life event to update your benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lifeEventTypes.map((event) => {
          const Icon = event.icon;
          const isSelected = selectedEvent === event.id;
          return (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event.id)}
              className={`p-5 rounded-lg border text-left transition-all hover:shadow-sm ${
                isSelected
                  ? "border-celestial-indigo bg-celestial-indigo/5 shadow-sm"
                  : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/50"
              } bg-white dark:bg-stellar-blue`}
            >
              <div className="flex flex-col gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-celestial-indigo/10 text-celestial-indigo"
                      : "bg-gray-100 dark:bg-nebula-purple/20 text-silver-mist"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-ink-black dark:text-pearl">{event.label}</p>
                  <p className="text-xs text-silver-mist mt-1 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <p className="text-xs text-celestial-indigo font-medium">
                  Report within {event.deadlineDays} days
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-celestial-indigo text-white font-medium hover:bg-celestial-indigo/90 transition-colors">
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
