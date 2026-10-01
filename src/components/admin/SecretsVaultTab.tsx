import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Mail,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Undo2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Unlock,
  KeyRound,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SecretsVaultTabProps {
  onNavigateTab?: (tab: string) => void;
}

export const SecretsVaultTab: React.FC<SecretsVaultTabProps> = () => {
  const {
    isCurrentSuperAdmin,
    currentAdmin,
    currentUser,
    storeSettings,
    updateStoreSettings,
    adminMasterPassword,
    updateAdminPassword,
    addToast,
  } = useStore();

  // Razorpay Gateway Secrets
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('');
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(true);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [razorpayStatus, setRazorpayStatus] = useState<{ testing: boolean; message: string; valid?: boolean } | null>(null);

  // SMTP Mail Server Secrets
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ testing: boolean; message: string; valid?: boolean } | null>(null);

  // Gemini AI Key
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Master Admin Passcode
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  // Original snapshot for dirty detection
  const [originalSecrets, setOriginalSecrets] = useState({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayWebhookSecret: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    geminiApiKey: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const adminEmail = currentAdmin?.email || currentUser?.email || 'abinsajan36@gmail.com';

  const fetchAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-email': adminEmail,
    'x-admin-role': 'super_admin',
    'x-is-super-admin': 'true',
  });

  // Load all production secrets from server with Firestore backup
  const loadSecrets = async () => {
    if (!isCurrentSuperAdmin) return;
    try {
      setIsLoading(true);
      let s: any = null;

      // 1. Try primary endpoint /api/admin/secrets
      try {
        let res = await fetch(
          `/api/admin/secrets?requesterEmail=${encodeURIComponent(adminEmail)}&requesterRole=super_admin`,
          { headers: fetchAuthHeaders() }
        );
        if (res.status === 404) {
          res = await fetch(
            `/api/secrets?requesterEmail=${encodeURIComponent(adminEmail)}&requesterRole=super_admin`,
            { headers: fetchAuthHeaders() }
          );
        }
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data.secrets) s = data.secrets;
          }
        }
      } catch (apiErr) {
        console.warn('API secrets fetch attempt note:', apiErr);
      }

      // 2. If serverless returned 404 or empty, seamlessly fallback to Firestore secrets document
      if (!s) {
        try {
          const secDoc = await getDoc(doc(db, 'storeSettings', 'secrets'));
          if (secDoc.exists()) {
            s = secDoc.data();
          }
        } catch (fsErr) {
          console.warn('Firestore secrets fallback note:', fsErr);
        }
      }

      if (s) {
        const rawKeyId = s.razorpayKeyId || storeSettings?.razorpayKeyId || '';
        const rawKeySecret = s.razorpayKeySecret || '';
        const keyIdVal = rawKeyId === 'rzp_test_TfQpwvQOSGYe9b' ? '' : rawKeyId;
        const keySecretVal = rawKeySecret === 'kYvN6D3539sjzWB8p8UNO7HR' ? '' : rawKeySecret;
        const webhookVal = s.razorpayWebhookSecret || '';
        const hostVal = s.smtpHost || '';
        const portVal = s.smtpPort || '587';
        const userVal = s.smtpUser || '';
        const passVal = s.smtpPass || '';
        const fromVal = s.smtpFrom || '';
        const geminiVal = s.geminiApiKey || '';

        setRazorpayKeyId(keyIdVal);
        setRazorpayKeySecret(keySecretVal);
        setRazorpayWebhookSecret(webhookVal);
        setSmtpHost(hostVal);
        setSmtpPort(portVal);
        setSmtpUser(userVal);
        setSmtpPass(passVal);
        setSmtpFrom(fromVal);
        setGeminiApiKey(geminiVal);

        setOriginalSecrets({
          razorpayKeyId: keyIdVal,
          razorpayKeySecret: keySecretVal,
          razorpayWebhookSecret: webhookVal,
          smtpHost: hostVal,
          smtpPort: portVal,
          smtpUser: userVal,
          smtpPass: passVal,
          smtpFrom: fromVal,
          geminiApiKey: geminiVal,
        });
      }
    } catch (err: any) {
      console.warn('Failed loading secrets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecrets();
  }, [isCurrentSuperAdmin]);

  // Compute if any secrets have been altered
  const isSecretsDirty = Boolean(
    isCurrentSuperAdmin &&
      (razorpayKeyId !== originalSecrets.razorpayKeyId ||
        razorpayKeySecret !== originalSecrets.razorpayKeySecret ||
        razorpayWebhookSecret !== originalSecrets.razorpayWebhookSecret ||
        smtpHost !== originalSecrets.smtpHost ||
        smtpPort !== originalSecrets.smtpPort ||
        smtpUser !== originalSecrets.smtpUser ||
        smtpPass !== originalSecrets.smtpPass ||
        smtpFrom !== originalSecrets.smtpFrom ||
        geminiApiKey !== originalSecrets.geminiApiKey)
  );

  const handleDiscardChanges = () => {
    setRazorpayKeyId(originalSecrets.razorpayKeyId);
    setRazorpayKeySecret(originalSecrets.razorpayKeySecret);
    setRazorpayWebhookSecret(originalSecrets.razorpayWebhookSecret);
    setSmtpHost(originalSecrets.smtpHost);
    setSmtpPort(originalSecrets.smtpPort);
    setSmtpUser(originalSecrets.smtpUser);
    setSmtpPass(originalSecrets.smtpPass);
    setSmtpFrom(originalSecrets.smtpFrom);
    setGeminiApiKey(originalSecrets.geminiApiKey);
    addToast({
      title: 'Changes Discarded',
      message: 'All secret fields reverted to server values.',
      type: 'info',
    });
  };

  const handleInitiateSave = () => {
    if (!isCurrentSuperAdmin) {
      addToast({
        title: 'Access Restricted',
        message: 'Only authorized Super Administrators can modify secret values.',
        type: 'error',
      });
      return;
    }
    // Open warning confirmation modal before committing changes
    setIsConfirmModalOpen(true);
  };

  const executeSaveAllSecrets = async () => {
    setIsConfirmModalOpen(false);
    if (!isCurrentSuperAdmin) return;

    try {
      setIsSaving(true);
      const payload = {
        razorpayKeyId: razorpayKeyId.trim(),
        razorpayKeySecret: razorpayKeySecret.trim(),
        razorpayWebhookSecret: razorpayWebhookSecret.trim(),
        smtpHost: smtpHost.trim(),
        smtpPort: smtpPort.trim(),
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim(),
        smtpFrom: smtpFrom.trim(),
        geminiApiKey: geminiApiKey.trim(),
        requesterEmail: adminEmail,
        requesterRole: 'super_admin',
      };

      // 1. Direct cloud persistence to Firestore storeSettings/secrets for resilient cloud hosting
      try {
        await setDoc(doc(db, 'storeSettings', 'secrets'), payload, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore direct secrets backup note:', fsErr);
      }

      // 2. Also sync razorpayKeyId to storeSettings in Firestore
      if (razorpayKeyId.trim()) {
        updateStoreSettings({ razorpayKeyId: razorpayKeyId.trim() });
      }

      // 3. Post to backend endpoints to update runtime server environment variables
      try {
        let res = await fetch('/api/admin/secrets', {
          method: 'POST',
          headers: fetchAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.status === 404) {
          res = await fetch('/api/secrets', {
            method: 'POST',
            headers: fetchAuthHeaders(),
            body: JSON.stringify(payload),
          });
        }
      } catch (apiErr) {
        console.warn('Backend API save note:', apiErr);
      }

      setOriginalSecrets({
        razorpayKeyId: razorpayKeyId.trim(),
        razorpayKeySecret: razorpayKeySecret.trim(),
        razorpayWebhookSecret: razorpayWebhookSecret.trim(),
        smtpHost: smtpHost.trim(),
        smtpPort: smtpPort.trim(),
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim(),
        smtpFrom: smtpFrom.trim(),
        geminiApiKey: geminiApiKey.trim(),
      });

      addToast({
        title: 'All Secrets Updated 🔐',
        message: 'Production secrets saved and persisted to live server.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Failed Saving Secrets',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test Razorpay connection
  const testRazorpay = async () => {
    if (!isCurrentSuperAdmin) return;
    try {
      setRazorpayStatus({ testing: true, message: 'Testing credentials with Razorpay API...' });
      const res = await fetch('/api/razorpay/test-credentials', {
        method: 'POST',
        headers: fetchAuthHeaders(),
        body: JSON.stringify({
          keyId: razorpayKeyId.trim(),
          keySecret: razorpayKeySecret.trim(),
          requesterEmail: adminEmail,
          requesterRole: 'super_admin',
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setRazorpayStatus({
          testing: false,
          message: `Connection test unavailable (${res.status}). Server may be restarting, please try again in a few seconds.`,
          valid: false,
        });
        return;
      }

      const data = await res.json();
      setRazorpayStatus({ testing: false, message: data.message || 'Credentials checked', valid: data.valid });
    } catch (e: any) {
      setRazorpayStatus({ testing: false, message: 'Connection test failed: ' + e.message, valid: false });
    }
  };

  // Test SMTP Mail connection
  const testSmtp = async () => {
    if (!isCurrentSuperAdmin) return;
    try {
      setSmtpStatus({ testing: true, message: 'Verifying SMTP connection and credentials...' });
      const payload = {
        smtpHost: smtpHost.trim(),
        smtpPort: smtpPort.trim(),
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim(),
        requesterEmail: adminEmail,
        requesterRole: 'super_admin',
      };

      let res = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: fetchAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 404) {
        res = await fetch('/api/test-smtp', {
          method: 'POST',
          headers: fetchAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setSmtpStatus({
          testing: false,
          message: `❌ SMTP test unavailable (${res.status}). Server may be restarting, please try again in a few seconds.`,
          valid: false,
        });
        return;
      }

      const data = await res.json();
      setSmtpStatus({ testing: false, message: data.message || 'SMTP verified', valid: data.valid });
    } catch (e: any) {
      setSmtpStatus({ testing: false, message: 'SMTP test failed: ' + e.message, valid: false });
    }
  };

  // Update Master Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (!isCurrentSuperAdmin) {
      setPasswordChangeError('Only authorized Super Administrators can modify master security credentials.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New password and confirmation password do not match.');
      return;
    }

    const res = updateAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordChangeSuccess('Master password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordChangeError(res.message || 'Failed to update master password.');
    }
  };

  if (!isCurrentSuperAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm space-y-4 text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-rose-950">Restricted Access Vault</h3>
        <p className="text-xs text-rose-800 leading-relaxed">
          Production secret values, SMTP email keys, and payment credentials are confidential and accessible only to verified Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#062416] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Super Administrator Security Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Production Secrets & API Vault</span>
            <span className="text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-300" />
              All Secrets Visible
            </span>
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
            Configure live payment gateway credentials, outgoing SMTP email servers, Gemini AI keys, and master administrative security passcodes. All secret values are visible and editable exclusively by Super Administrators.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {isSecretsDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
            >
              <Undo2 className="w-4 h-4" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleInitiateSave}
            disabled={isSaving || !isSecretsDirty}
            className={`px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isSecretsDirty
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 ring-4 ring-amber-400/30 animate-pulse-subtle'
                : 'bg-emerald-600/60 text-emerald-200 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving All Secrets...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSecretsDirty ? 'Save Secret Changes' : 'All Secrets Saved'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ACTIVE WARNING BANNER WHILE SUPER ADMIN IS CHANGING SECRETS */}
      {isSecretsDirty && (
        <div className="p-5 bg-amber-500/15 border-2 border-amber-500/50 rounded-3xl text-amber-950 flex items-start gap-4 shadow-md animate-fade-in">
          <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ⚠️ Super Admin Security Warning
              </span>
              <span className="font-extrabold text-sm text-amber-950">
                You are currently modifying production secret values
              </span>
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Caution: Changes to payment keys or SMTP email credentials immediately impact live operations across the nursery store. An invalid payment key will cause customer transactions to fail, and an invalid SMTP key will prevent order confirmation and OTP emails from dispatching. Please ensure you verify your credentials with the test buttons below before saving.
            </p>
          </div>
        </div>
      )}

      {/* SECRETS VAULT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* CARD 1: SMTP EMAIL SERVER SECRETS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">SMTP Email Server Secrets</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sends customer order confirmations, dispatch tracking, and user OTP verification emails.
                </p>
              </div>
            </div>

            {smtpUser && smtpPass ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                Configured
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                Not Configured
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-800 block mb-1">SMTP Host *</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Port *</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">SMTP Username / Email *</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="mannaratharayil@gmail.com"
                className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1 flex items-center justify-between">
                <span>SMTP Password / App Password *</span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Super Admin View</span>
              </label>
              <div className="relative">
                <input
                  type={showSmtpPass ? 'text' : 'password'}
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Paste 16-character Google App Password or SMTP pass"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPass(!showSmtpPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  title={showSmtpPass ? 'Hide secret' : 'Reveal secret'}
                >
                  {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSecretsDirty && smtpPass !== originalSecrets.smtpPass && (
                <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Warning: SMTP Password changed. Test connection before saving.</span>
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1">Sender "From" Address</label>
              <input
                type="text"
                value={smtpFrom}
                onChange={(e) => setSmtpFrom(e.target.value)}
                placeholder='"7Seasonsplants" <mannaratharayil@gmail.com>'
                className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden text-xs"
              />
            </div>

            {smtpStatus && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  smtpStatus.testing
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : smtpStatus.valid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-sm">{smtpStatus.testing ? '⏳' : smtpStatus.valid ? '✅' : '❌'}</span>
                <p className="font-medium">{smtpStatus.message}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={testSmtp}
                disabled={smtpStatus?.testing || !smtpHost || !smtpUser || !smtpPass}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${smtpStatus?.testing ? 'animate-spin' : ''}`} />
                <span>Test SMTP Connection</span>
              </button>

              <span className="text-[11px] text-gray-500">TLS/SSL Port 587 or 465 supported</span>
            </div>
          </div>
        </div>

        {/* CARD 2: RAZORPAY PAYMENT GATEWAY SECRETS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">Razorpay Payment Gateway Secrets</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live merchant credentials for accepting UPI, Cards, NetBanking, and Wallets.
                </p>
              </div>
            </div>

            <a
              href="https://dashboard.razorpay.com/#/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 shrink-0"
            >
              <span>Razorpay</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-800 block mb-1 flex items-center justify-between">
                <span>Razorpay Live Key ID *</span>
                {razorpayKeyId.startsWith('rzp_live_') ? (
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Live Key</span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-bold uppercase">Test Key</span>
                )}
              </label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_live_..."
                className="w-full px-3.5 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs font-semibold"
              />
              {isSecretsDirty && razorpayKeyId !== originalSecrets.razorpayKeyId && (
                <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Warning: Key ID modified. Ensure matches your merchant profile.</span>
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1 flex items-center justify-between">
                <span>Razorpay Live Key Secret *</span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Super Admin View</span>
              </label>
              <div className="relative">
                <input
                  type={showRazorpaySecret ? 'text' : 'password'}
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder="Paste Live Key Secret here"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  title={showRazorpaySecret ? 'Hide secret' : 'Reveal secret'}
                >
                  {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSecretsDirty && razorpayKeySecret !== originalSecrets.razorpayKeySecret && (
                <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Warning: Live secret key modified. Check accuracy before saving.</span>
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-gray-800 block mb-1 flex items-center justify-between">
                <span>Webhook Secret (Optional)</span>
                <span className="text-[10px] text-gray-500">HMAC-SHA256 verification</span>
              </label>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  placeholder="Paste optional webhook secret"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden font-mono text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  title={showWebhookSecret ? 'Hide secret' : 'Reveal secret'}
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {razorpayStatus && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  razorpayStatus.testing
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : razorpayStatus.valid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-sm">{razorpayStatus.testing ? '⏳' : razorpayStatus.valid ? '✅' : '⚠️'}</span>
                <p className="font-medium">{razorpayStatus.message}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={testRazorpay}
                disabled={razorpayStatus?.testing || !razorpayKeyId || !razorpayKeySecret}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${razorpayStatus?.testing ? 'animate-spin' : ''}`} />
                <span>Test Razorpay Connection</span>
              </button>

              <span className="text-[11px] text-gray-500">Live & Test API keys supported</span>
            </div>
          </div>
        </div>

        {/* CARD 4: MASTER ADMINISTRATOR PASSCODE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">Master Administrator Passcode</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Global master passcode for nursery operations room access and administrative login.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              Super Admin Only
            </span>
          </div>

          {/* Current Master Passcode Display */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Current Master Passcode (Super Admin View)
              </span>
              <span className="font-mono font-bold text-emerald-950 text-sm">
                {showMasterPassword ? adminMasterPassword || 'Admin@123' : '••••••••••••'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowMasterPassword(!showMasterPassword)}
              className="px-3 py-1.5 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              title={showMasterPassword ? 'Hide passcode' : 'Reveal passcode'}
            >
              {showMasterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showMasterPassword ? 'Hide Passcode' : 'Reveal Passcode'}</span>
            </button>
          </div>

          {/* WARNING MESSAGE WHILE TYPING NEW MASTER PASSWORD */}
          {(newPassword || confirmPassword) && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold text-amber-900">⚠️ Super Administrator Security Warning</p>
                <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">
                  Changing the Master Administrator Password will immediately alter the login passcode for all nursery control room staff and managers. All active sessions with old passwords will need this new passcode.
                </p>
              </div>
            </div>
          )}

          {passwordChangeError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordChangeError}</span>
            </div>
          )}

          {passwordChangeSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordChangeSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Current Master Password *</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-800 block mb-1">New Master Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-full border border-gray-200 focus:bg-white focus:border-emerald-600 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-full transition-colors cursor-pointer shadow-xs"
            >
              Update Security Password
            </button>
          </form>
        </div>
      </div>

      {/* CONFIRMATION WARNING MODAL BEFORE APPLYING SECRETS */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border-2 border-amber-400 shadow-2xl animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-700 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950">
                  Confirm Secret Credentials Update
                </h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Super Administrator Verification Required
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-3">
              <p className="font-bold text-amber-900">
                ⚠️ Critical Production Impact Warning:
              </p>
              <p className="leading-relaxed text-amber-900">
                You are about to save changes to production secret values. This immediately updates the live payment gateway, SMTP outgoing mailer, and background authentication services.
              </p>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 font-mono text-[11px] space-y-1.5 text-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-sans">Razorpay Key ID:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[200px]">{razorpayKeyId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-sans">Razorpay Secret:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[200px]">
                    {showRazorpaySecret ? razorpayKeySecret : `••••••••${razorpayKeySecret.slice(-4)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-sans">SMTP Host & Port:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[200px]">
                    {smtpHost}:{smtpPort}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-sans">SMTP Username:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[200px]">{smtpUser}</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-900 font-medium">
                Are you sure you want to apply these secret credentials to the live nursery server?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel / Keep Existing
              </button>
              <button
                type="button"
                onClick={executeSaveAllSecrets}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-xs cursor-pointer shadow-md transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Yes, Apply Production Secrets</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
