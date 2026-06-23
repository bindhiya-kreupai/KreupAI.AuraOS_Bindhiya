import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2, Mail, Send, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Recipient {
    /** Stable identifier. Used as React key + dedupe. */
    id: string;
    /** Display name shown in chips and the dropdown. */
    name: string;
    /** RFC 5321 email address. Optional for role-like entries (e.g. "HR Managers"). */
    email?: string;
    /** Optional category — e.g. "Employee", "Role", "Group". */
    kind?: string;
}

export interface SendEmailPayload {
    to: Recipient[];
    cc: Recipient[];
    bcc: Recipient[];
    subject: string;
    message: string;
}

export interface EmailRecipientPickerProps {
    /**
     * Lookup recipients matching `query`. Called from the picker on debounced input.
     * Return your tenant-scoped users, roles, or distribution lists.
     */
    onSearch: (query: string) => Promise<Recipient[]>;
    /** Called when the user presses Send. Receives the composed payload. */
    onSend: (payload: SendEmailPayload) => Promise<void>;
    /** Optional initial recipients (typically passed when prefilling a context — e.g. row owners). */
    initialTo?: Recipient[];
    /** Default subject (caller can prefill with row context). */
    initialSubject?: string;
    /** Default message body. */
    initialMessage?: string;
    /** Optional title shown at the top of the panel. */
    title?: string;
    /** Hides the cc/bcc rows when caller doesn't need them. */
    hideCcBcc?: boolean;
    /** Render in compact mode. */
    compact?: boolean;
    className?: string;
}

type Bucket = 'to' | 'cc' | 'bcc';

/**
 * Self-contained recipient + compose primitive. Owns search-debouncing,
 * chip state, validation, and the Send button. Defers actual delivery to a
 * caller-provided `onSend` handler that should POST to
 * `/api/v1/share/email` (or any tenant-scoped email API).
 */
export function EmailRecipientPicker({
    onSearch,
    onSend,
    initialTo = [],
    initialSubject = '',
    initialMessage = '',
    title = 'Share by email',
    hideCcBcc = false,
    compact = false,
    className,
}: EmailRecipientPickerProps) {
    const [to, setTo] = useState<Recipient[]>(initialTo);
    const [cc, setCc] = useState<Recipient[]>([]);
    const [bcc, setBcc] = useState<Recipient[]>([]);
    const [subject, setSubject] = useState(initialSubject);
    const [message, setMessage] = useState(initialMessage);
    const [activeBucket, setActiveBucket] = useState<Bucket>('to');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Recipient[]>([]);
    const [searching, setSearching] = useState(false);
    const [showDrop, setShowDrop] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const buckets: Record<Bucket, [Recipient[], React.Dispatch<React.SetStateAction<Recipient[]>>]> = useMemo(
        () => ({ to: [to, setTo], cc: [cc, setCc], bcc: [bcc, setBcc] }),
        [to, cc, bcc],
    );

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        let cancelled = false;
        setSearching(true);
        const t = setTimeout(async () => {
            try {
                const found = await onSearch(query.trim());
                if (!cancelled) setResults(found);
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 200);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [query, onSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!showDrop) return;
        function onDocClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) setShowDrop(false);
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showDrop]);

    function addRecipient(bucket: Bucket, r: Recipient) {
        const [current, setter] = buckets[bucket];
        if (current.some((c) => c.id === r.id)) return;
        setter([...current, r]);
        setQuery('');
        setResults([]);
    }

    function removeRecipient(bucket: Bucket, id: string) {
        const [current, setter] = buckets[bucket];
        setter(current.filter((c) => c.id !== id));
    }

    function canSend() {
        if (sending) return false;
        if (to.length === 0) return false;
        if (!subject.trim()) return false;
        return true;
    }

    async function handleSend() {
        if (!canSend()) return;
        setSending(true);
        setError(null);
        try {
            await onSend({ to, cc, bcc, subject: subject.trim(), message: message.trim() });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email.');
        } finally {
            setSending(false);
        }
    }

    const padding = compact ? 'p-3' : 'p-4';

    return (
        <div
            ref={wrapperRef}
            className={cn(
                'rounded-xl border border-cloud dark:border-nebula-purple/40 bg-white dark:bg-stellar-blue',
                padding,
                'space-y-3',
                className,
            )}
        >
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-celestial-indigo" />
                <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">{title}</h3>
            </div>

            {/* Recipient rows */}
            <RecipientRow label="To" bucket="to" recipients={to} onRemove={removeRecipient} setActiveBucket={setActiveBucket} activeBucket={activeBucket} />
            {!hideCcBcc && (
                <>
                    <RecipientRow label="Cc" bucket="cc" recipients={cc} onRemove={removeRecipient} setActiveBucket={setActiveBucket} activeBucket={activeBucket} />
                    <RecipientRow label="Bcc" bucket="bcc" recipients={bcc} onRemove={removeRecipient} setActiveBucket={setActiveBucket} activeBucket={activeBucket} />
                </>
            )}

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={`Search recipients for ${activeBucket.toUpperCase()}…`}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDrop(true);
                    }}
                    onFocus={() => setShowDrop(true)}
                    className="w-full px-3 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos rounded-lg border-none focus:ring-2 focus:ring-celestial-indigo/50 placeholder:text-silver-mist text-ink-black dark:text-pearl"
                />
                {searching && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-silver-mist" />
                )}
                {showDrop && results.length > 0 && (
                    <ul
                        role="listbox"
                        className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-stellar-blue rounded-lg shadow-lg ring-1 ring-cloud dark:ring-nebula-purple/40"
                    >
                        {results.map((r) => (
                            <li key={r.id}>
                                <button
                                    type="button"
                                    onClick={() => addRecipient(activeBucket, r)}
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-left text-ink-black dark:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos"
                                >
                                    <span className="flex flex-col items-start min-w-0">
                                        <span className="truncate">{r.name}</span>
                                        {r.email && <span className="text-xs text-silver-mist truncate">{r.email}</span>}
                                    </span>
                                    {r.kind && (
                                        <span className="text-[10px] text-silver-mist uppercase tracking-wide shrink-0">{r.kind}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Subject + Message */}
            <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos rounded-lg border-none focus:ring-2 focus:ring-celestial-indigo/50 placeholder:text-silver-mist text-ink-black dark:text-pearl"
            />
            <textarea
                placeholder="Message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={compact ? 3 : 5}
                className="w-full px-3 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos rounded-lg border-none focus:ring-2 focus:ring-celestial-indigo/50 placeholder:text-silver-mist text-ink-black dark:text-pearl resize-y"
            />

            {error && (
                <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 rounded-md px-2 py-1.5">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend()}
                    className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        'bg-celestial-indigo text-white hover:bg-celestial-indigo/90',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{sending ? 'Sending…' : 'Send'}</span>
                </button>
            </div>
        </div>
    );
}

function RecipientRow({
    label,
    bucket,
    recipients,
    onRemove,
    setActiveBucket,
    activeBucket,
}: {
    label: string;
    bucket: Bucket;
    recipients: Recipient[];
    onRemove: (bucket: Bucket, id: string) => void;
    setActiveBucket: (b: Bucket) => void;
    activeBucket: Bucket;
}) {
    const isActive = activeBucket === bucket;
    return (
        <div
            onClick={() => setActiveBucket(bucket)}
            className={cn(
                'flex items-start gap-2 px-2 py-1.5 rounded-lg cursor-text',
                isActive ? 'bg-celestial-indigo/5 ring-1 ring-celestial-indigo/30' : 'hover:bg-pearl/60 dark:hover:bg-deep-cosmos/40',
            )}
        >
            <span className="text-xs text-silver-mist w-8 shrink-0 mt-0.5">{label}</span>
            <div className="flex flex-wrap gap-1.5 flex-1 min-h-[1.5rem]">
                {recipients.length === 0 && <span className="text-xs text-silver-mist">—</span>}
                {recipients.map((r) => (
                    <span
                        key={r.id}
                        className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs bg-celestial-indigo/10 text-celestial-indigo dark:bg-celestial-indigo/20 ring-1 ring-celestial-indigo/30"
                    >
                        <span className="max-w-[14rem] truncate">{r.name}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(bucket, r.id);
                            }}
                            className="rounded-full hover:bg-celestial-indigo/20 p-0.5"
                            aria-label={`Remove ${r.name}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            {isActive && <ChevronDown className="w-3.5 h-3.5 text-silver-mist mt-1" />}
        </div>
    );
}
