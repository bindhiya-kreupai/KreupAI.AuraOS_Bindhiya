/**
 * @module MFASetup
 * @description Multi-factor authentication setup flow:
 *              method selector → QR code / SMS / Email → 6-digit verify → backup codes.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  MessageSquare,
  Mail,
  QrCode,
  Copy,
  CheckCircle,
  Download,
  Loader2,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';
import { AuthClientService, type MFAMethod, type MFASetupResult } from '@/services/authService';

// ── Method option ─────────────────────────────────────────────────────────────

interface MethodCardProps {
  value: MFAMethod;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

function MethodCard({ icon, title, description, selected, onSelect }: MethodCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/10'
          : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/40 bg-white dark:bg-stellar-blue'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            selected
              ? 'bg-celestial-indigo text-white'
              : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${selected ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
          >
            {title}
          </p>
          <p className="text-xs text-silver-mist mt-0.5">{description}</p>
        </div>
        {selected && <CheckCircle className="w-5 h-5 text-celestial-indigo flex-shrink-0" />}
      </div>
    </div>
  );
}

// ── 6-digit code input ────────────────────────────────────────────────────────

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

function CodeInput({ value, onChange, disabled }: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center justify-center gap-3">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="\d*"
        maxLength={6}
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
          onChange(val);
        }}
        disabled={disabled}
        className="w-48 py-3 text-center text-2xl font-mono tracking-[0.4em] rounded-xl border-2 border-cloud dark:border-nebula-purple/40 bg-transparent text-ink-black dark:text-pearl focus:outline-none focus:border-celestial-indigo placeholder:text-silver-mist/40 disabled:opacity-60"
        placeholder="000000"
        autoComplete="one-time-code"
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

type Step = 'method' | 'setup' | 'verify' | 'backup' | 'complete';

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<Step>('method');
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod>('totp');
  const [setupResult, setSetupResult] = useState<MFASetupResult | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await AuthClientService.enableMFA(selectedMethod);
      setSetupResult(result);
      setStep('setup');
    } catch {
      setError('Failed to initialize MFA setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await AuthClientService.verifyMFA(verifyCode, setupResult?.setupToken);
      if (result.success) {
        if (setupResult?.backupCodes?.length) {
          setStep('backup');
        } else {
          setStep('complete');
        }
      } else {
        setError(result.message);
        setVerifyCode('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  const downloadBackupCodes = () => {
    const codes = setupResult?.backupCodes ?? [];
    const content = `AuraOS MFA Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\nStore these codes in a safe place. Each code can only be used once.\n\n${codes.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auraos-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setBackupDownloaded(true);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-celestial-indigo" />
            Set Up Two-Factor Authentication
          </h2>
          <p className="text-xs text-silver-mist mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos text-silver-mist transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Step 1: Choose Method */}
      {step === 'method' && (
        <div className="space-y-4">
          <p className="text-sm text-silver-mist">
            Choose how you want to receive verification codes:
          </p>

          <div className="space-y-3">
            <MethodCard
              value="totp"
              icon={<Smartphone className="w-5 h-5" />}
              title="Authenticator App"
              description="Use Google Authenticator, Authy, or any TOTP app. Most secure."
              selected={selectedMethod === 'totp'}
              onSelect={() => setSelectedMethod('totp')}
            />
            <MethodCard
              value="sms"
              icon={<MessageSquare className="w-5 h-5" />}
              title="SMS Text Message"
              description="Receive codes via text to your registered phone number."
              selected={selectedMethod === 'sms'}
              onSelect={() => setSelectedMethod('sms')}
            />
            <MethodCard
              value="email"
              icon={<Mail className="w-5 h-5" />}
              title="Email"
              description="Receive codes to your work email address."
              selected={selectedMethod === 'email'}
              onSelect={() => setSelectedMethod('email')}
            />
          </div>

          {error && (
            <p className="text-xs text-quantum-rose bg-quantum-rose/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleStartSetup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Continue with{' '}
            {selectedMethod === 'totp'
              ? 'Authenticator App'
              : selectedMethod === 'sms'
                ? 'SMS'
                : 'Email'}
          </button>
        </div>
      )}

      {/* Step 2: Setup Instructions */}
      {step === 'setup' && setupResult && (
        <div className="space-y-5">
          {selectedMethod === 'totp' && (
            <>
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl mb-2">
                  1. Open your authenticator app and scan this QR code:
                </p>
                <div className="flex items-center justify-center p-6 bg-white rounded-xl border border-cloud dark:border-nebula-purple/30">
                  {setupResult.qrCodeDataUri ? (
                    <img src={setupResult.qrCodeDataUri} alt="MFA QR Code" className="w-40 h-40" />
                  ) : (
                    <QrCode className="w-40 h-40 text-silver-mist/30" />
                  )}
                </div>
              </div>

              {setupResult.secret && (
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl mb-2">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-pearl dark:bg-deep-cosmos rounded-lg text-sm font-mono text-ink-black dark:text-pearl tracking-wider">
                      {setupResult.secret.match(/.{1,4}/g)?.join(' ')}
                    </code>
                    <button
                      onClick={async () => {
                        await copyToClipboard(setupResult.secret!);
                        setSecretCopied(true);
                        setTimeout(() => setSecretCopied(false), 2000);
                      }}
                      className="p-2 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                    >
                      {secretCopied ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {(selectedMethod === 'sms' || selectedMethod === 'email') &&
            setupResult.deliveryTarget && (
              <div className="p-4 bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl border border-celestial-indigo/20">
                <p className="text-sm text-ink-black dark:text-pearl">
                  A verification code has been sent to:
                </p>
                <p className="text-base font-mono font-semibold text-celestial-indigo mt-1">
                  {setupResult.deliveryTarget}
                </p>
              </div>
            )}

          <button
            onClick={() => setStep('verify')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Enter Verification Code
          </button>
        </div>
      )}

      {/* Step 3: Verify */}
      {step === 'verify' && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-sm font-medium text-ink-black dark:text-pearl mb-1">
              {selectedMethod === 'totp'
                ? 'Enter the 6-digit code from your authenticator app'
                : `Enter the 6-digit code sent to ${setupResult?.deliveryTarget}`}
            </p>
            <p className="text-xs text-silver-mist">
              {selectedMethod === 'totp'
                ? 'Code refreshes every 30 seconds'
                : 'Code expires in 10 minutes'}
            </p>
          </div>

          <CodeInput value={verifyCode} onChange={setVerifyCode} disabled={isLoading} />

          {error && (
            <p className="text-xs text-quantum-rose text-center bg-quantum-rose/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={verifyCode.length !== 6 || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Verify Code
          </button>

          <button
            onClick={() => setStep('setup')}
            className="w-full text-xs text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors py-2"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 4: Backup codes */}
      {step === 'backup' && setupResult?.backupCodes && (
        <div className="space-y-5">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Save these backup codes
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              If you lose access to your authenticator, you can use these codes to sign in. Each
              code can only be used once.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {setupResult.backupCodes.map((code, i) => (
              <code
                key={i}
                className="px-3 py-1.5 bg-pearl dark:bg-deep-cosmos rounded-lg text-sm font-mono text-ink-black dark:text-pearl text-center"
              >
                {code}
              </code>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadBackupCodes}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-cloud dark:border-nebula-purple/40 rounded-xl text-sm font-medium text-ink-black dark:text-pearl hover:border-celestial-indigo/40 transition-colors"
            >
              <Download className="w-4 h-4" />
              {backupDownloaded ? 'Downloaded!' : 'Download'}
            </button>
            <button
              onClick={async () => {
                await copyToClipboard(setupResult.backupCodes!.join('\n'));
                setBackupCopied(true);
                setTimeout(() => setBackupCopied(false), 2000);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-cloud dark:border-nebula-purple/40 rounded-xl text-sm font-medium text-ink-black dark:text-pearl hover:border-celestial-indigo/40 transition-colors"
            >
              {backupCopied ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {backupCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={() => setStep('complete')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            I&apos;ve saved my backup codes
          </button>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && (
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
            Two-Factor Authentication Enabled!
          </h3>
          <p className="text-sm text-silver-mist mt-2 max-w-xs">
            Your account is now protected with{' '}
            {selectedMethod === 'totp'
              ? 'an authenticator app'
              : selectedMethod === 'sms'
                ? 'SMS codes'
                : 'email codes'}
            .
          </p>
          <button
            onClick={onComplete}
            className="mt-6 px-6 py-3 bg-celestial-indigo text-white rounded-xl text-sm font-semibold hover:bg-celestial-indigo/90 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default MFASetup;
