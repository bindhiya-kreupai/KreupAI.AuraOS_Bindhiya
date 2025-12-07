"use client";

import React, { useState } from 'react';
import {
    MapPin,
    Edit3,
    Eye
} from 'lucide-react';

export default function AddressFormatsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-indigo-500" />
                        Address Formats
                    </h1>
                    <p className="text-slate-500 text-sm">Configure address input fields and display formats per country.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                    { country: 'United States', fields: ['Street Address', 'Apt/Suite', 'City', 'State', 'Zip Code'], format: '{address}\n{city}, {state} {zip}' },
                    { country: 'United Kingdom', fields: ['Address Line 1', 'Address Line 2', 'Town/City', 'County', 'Postcode'], format: '{address1}\n{town}\n{postcode}' },
                    { country: 'Japan', fields: ['Postal Code', 'Prefecture', 'City', 'Ward/Block', 'Building'], format: '〒{postal}\n{prefecture}{city}{ward}' },
                    { country: 'India', fields: ['House No/Building', 'Street/Area', 'City', 'State', 'Pincode'], format: '{house}, {street}\n{city} - {pincode}, {state}' },
                ].map((fmt, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg">{fmt.country}</h3>
                            <button className="text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Input Fields</div>
                                <ul className="space-y-1">
                                    {fmt.fields.map((field, j) => (
                                        <li key={j} className="text-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {field}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Preview
                                </div>
                                <div className="text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {fmt.format
                                        .replace('{address}', '123 Main St')
                                        .replace('{city}', 'Anytown')
                                        .replace('{state}', 'NY')
                                        .replace('{zip}', '10001')
                                        .replace('{address1}', '10 Downing St')
                                        .replace('{town}', 'London')
                                        .replace('{postcode}', 'SW1A 2AA')
                                        .replace('{postal}', '100-0001')
                                        .replace('{prefecture}', 'Tokyo')
                                        .replace('{ward}', 'Chiyoda')
                                        .replace('{house}', '#42, Sunshine Apts')
                                        .replace('{street}', 'MG Road')
                                        .replace('{pincode}', '560001')
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
