"use client";

import React, { useState } from "react";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ExternalLink,
  CheckCircle,
  X,
} from "lucide-react";

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  status: "active" | "expired" | "pending";
}

const mockCertifications: Certification[] = [
  {
    id: "1",
    name: "AWS Solutions Architect - Professional",
    issuingOrganization: "Amazon Web Services",
    issueDate: "2023-06-15",
    expiryDate: "2026-06-15",
    credentialId: "AWS-SAP-2023-0042",
    credentialUrl: "https://aws.amazon.com/verify",
    status: "active",
  },
  {
    id: "2",
    name: "PMP - Project Management Professional",
    issuingOrganization: "Project Management Institute",
    issueDate: "2022-01-10",
    expiryDate: "2025-01-10",
    credentialId: "PMI-PMP-2022-8891",
    credentialUrl: "",
    status: "expired",
  },
  {
    id: "3",
    name: "Certified Kubernetes Administrator",
    issuingOrganization: "Cloud Native Computing Foundation",
    issueDate: "2024-03-20",
    expiryDate: "2027-03-20",
    credentialId: "CKA-2024-1156",
    credentialUrl: "https://cncf.io/verify",
    status: "active",
  },
];

const emptyCert: Omit<Certification, "id"> = {
  name: "",
  issuingOrganization: "",
  issueDate: "",
  expiryDate: "",
  credentialId: "",
  credentialUrl: "",
  status: "active",
};

export default function CertificationsSelfUpdate() {
  const [certifications, setCertifications] = useState<Certification[]>(mockCertifications);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Certification, "id">>(emptyCert);

  const handleAdd = () => {
    setFormData(emptyCert);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (cert: Certification) => {
    setFormData({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      credentialId: cert.credentialId,
      credentialUrl: cert.credentialUrl,
      status: cert.status,
    });
    setEditingId(cert.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setCertifications((prev) =>
        prev.map((c) => (c.id === editingId ? { ...formData, id: editingId } : c))
      );
    } else {
      const newCert: Certification = {
        ...formData,
        id: Math.random().toString(36).substring(2, 11),
      };
      setCertifications((prev) => [...prev, newCert]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyCert);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyCert);
  };

  const getStatusBadge = (status: Certification["status"]) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" },
      expired: { label: "Expired", className: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
      pending: { label: "Pending", className: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" },
    };
    const c = config[status];
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.className}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Award className="w-5 h-5 text-indigo-500" /> Skills & Certifications
        </h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      {/* Certifications List */}
      <div className="space-y-3">
        {certifications.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">
            No certifications added yet. Click &quot;Add Certification&quot; to get started.
          </p>
        )}
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {cert.name}
                </h4>
                {getStatusBadge(cert.status)}
              </div>
              <p className="text-xs text-slate-500 mb-1">{cert.issuingOrganization}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </span>
                {cert.expiryDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                  </span>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600"
                  >
                    <ExternalLink className="w-3 h-3" /> Verify
                  </a>
                )}
              </div>
              {cert.credentialId && (
                <p className="text-xs text-slate-400 mt-1">ID: {cert.credentialId}</p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleEdit(cert)}
                className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cert.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {editingId ? "Edit Certification" : "Add Certification"}
              </h4>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Certification Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., AWS Solutions Architect"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  value={formData.issuingOrganization}
                  onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                  placeholder="e.g., Amazon Web Services"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Credential ID</label>
                <input
                  type="text"
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  placeholder="e.g., AWS-SAP-2023-0042"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Credential URL</label>
                <input
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? "Update" : "Add"} Certification
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
