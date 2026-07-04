'use client';

import React, { useState } from 'react';
import {
  Share2,
  Globe,
  Slack,
  MessagesSquare,
  MessageCircle,
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  ToggleRight,
  Plug,
} from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import type { Channel } from '../types';

const iconMap: Record<string, React.ElementType> = {
  web: Globe,
  slack: Slack,
  teams: MessagesSquare,
  whatsapp: MessageCircle,
  facebook: MessageCircle,
  mobile: Smartphone,
};

const typeColors: Record<string, string> = {
  web: 'text-indigo-500',
  slack: 'text-rose-500',
  teams: 'text-blue-600',
  whatsapp: 'text-emerald-500',
  facebook: 'text-blue-500',
  mobile: 'text-purple-500',
};

export default function MultiChannelPage() {
  const { channels, loading, createChannel, updateChannel, deleteChannel, testChannel, addToast } =
    useChatbot();

  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<string>('web');
  const [isEnabled, setIsEnabled] = useState(true);
  const [configurationJson, setConfigurationJson] = useState('{}');

  const openAddModal = () => {
    setEditingChannel(null);
    setChannelName('');
    setChannelType('web');
    setIsEnabled(true);
    setConfigurationJson('{}');
    setShowModal(true);
  };

  const openEditModal = (channel: Channel) => {
    setEditingChannel(channel);
    setChannelName(channel.channelName);
    setChannelType(channel.channelType);
    setIsEnabled(channel.isEnabled);
    setConfigurationJson(JSON.stringify(channel.configuration, null, 2));
    setShowModal(true);
  };

  const handleSave = async () => {
    let config: any;
    try {
      config = JSON.parse(configurationJson);
    } catch {
      addToast({ type: 'error', message: 'Invalid configuration JSON' });
      return;
    }

    const data = {
      channelName,
      channelType: channelType as Channel['channelType'],
      isEnabled,
      configuration: config,
    };

    if (editingChannel) {
      await updateChannel(editingChannel.channelId, data);
    } else {
      await createChannel(data);
    }

    setShowModal(false);
  };

  const handleToggle = (channel: Channel) => {
    updateChannel(channel.channelId, { isEnabled: !channel.isEnabled });
  };

  const handleDelete = async (channelId: string) => {
    await deleteChannel(channelId);
    setDeleteConfirmId(null);
  };

  const handleTest = async (channelId: string) => {
    await testChannel(channelId);
  };

  const webChannel = channels.find((c) => c.channelType === 'web' || c.channelType === 'mobile');

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-500" />
            Multi-Channel Support
          </h1>
          <p className="text-slate-500 text-sm">Deploy your bot across various platforms.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>

      {loading && channels.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((channel) => {
            const Icon = iconMap[channel.channelType] || Globe;
            const color = typeColors[channel.channelType] || 'text-slate-500';
            const statusColor =
              channel.status === 'active'
                ? 'text-emerald-500'
                : channel.status === 'error'
                  ? 'text-red-500'
                  : 'text-slate-400';
            return (
              <div
                key={channel.channelId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(channel)}
                        className={`p-1 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${channel.isEnabled ? 'text-emerald-500' : 'text-slate-300'}`}
                      >
                        <ToggleRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg capitalize">{channel.channelName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor} bg-slate-50 dark:bg-slate-800`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusColor === 'text-emerald-500' ? 'bg-emerald-500' : statusColor === 'text-red-500' ? 'bg-red-500' : 'bg-slate-400'}`}
                      />
                      {channel.status}
                    </span>
                    {channel.lastSyncDate && (
                      <span className="text-xs text-slate-400">
                        synced {new Date(channel.lastSyncDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleTest(channel.channelId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Plug className="w-3.5 h-3.5" />
                    Test
                  </button>
                  <button
                    onClick={() => openEditModal(channel)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {deleteConfirmId === channel.channelId ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => handleDelete(channel.channelId)}
                        className="px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(channel.channelId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mt-6">
        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">
          Web Widget Installation
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Copy and paste this snippet into your intranet's HTML header.
        </p>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          &lt;script src="https://cdn.auraos.ai/widget/v2.js" data-id="
          {webChannel?.channelId || 'bot_placeholder'}"&gt;&lt;/script&gt;
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold">
                {editingChannel ? 'Edit Channel' : 'Add Channel'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Company Portal Widget"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Channel Type
                </label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="web">Web Widget</option>
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook Messenger</option>
                  <option value="mobile">Mobile App</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enabled
                </label>
                <button
                  onClick={() => setIsEnabled(!isEnabled)}
                  className={`p-1 rounded-lg transition-colors ${isEnabled ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  <ToggleRight className="w-6 h-6" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Configuration (JSON)
                </label>
                <textarea
                  value={configurationJson}
                  onChange={(e) => setConfigurationJson(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!channelName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                {editingChannel ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
