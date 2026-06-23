// @ts-nocheck
"use client";

import React, { useState, useRef } from "react";
import {
  Sliders,
  User,
  Bell,
  Shield,
  Languages,
  ChevronDown,
  ChevronUp,
  Pencil,
  Upload,
  Info,
  Lock,
  List,
  Zap,
  RotateCcw,
  Download,
  History,
  Check,
  X,
  FileText,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Mail,
  Key,
  Camera,
  Crown,
  MessageSquare,
  Save,
  Monitor,
  CheckCircle2,
  Smartphone
} from "lucide-react";
import api from "../../api/axios";
import { adminToast } from "./AdminToast";

interface SettingsManagementProps {
  onSaveSuccess: (title?: string, body?: string) => void;
  settingsSection: string | null;
  setSettingsSection: (section: string | null) => void;
  adminName: string;
  setAdminName: (name: string) => void;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  profilePhoto: string;
  setProfilePhoto: (photo: string) => void;
}

export default function SettingsManagement({
  onSaveSuccess,
  settingsSection,
  setSettingsSection,
  adminName,
  setAdminName,
  adminEmail,
  setAdminEmail,
  currentPassword,
  setCurrentPassword,
  profilePhoto,
  setProfilePhoto
}: SettingsManagementProps) {
  const platformNameInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [platformName, setPlatformName] = useState("TIJARUK");
  const [timeZone, setTimeZone] = useState("Asia/Riyadh (GMT+3)");
  const [currency, setCurrency] = useState("SAR - Saudi Riyal");
  const [platformLogoPreview, setPlatformLogoPreview] = useState<string | null>(null);
  const platformLogoInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handlePlatformLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPlatformLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setLocalPhotoFile(file);
    setLocalPhoto(url);
    e.target.value = "";
  };
  
  // Account Form local edit states
  const [localName, setLocalName] = useState(adminName);
  const [localEmail, setLocalEmail] = useState(adminEmail);
  const [localPassword, setLocalPassword] = useState(currentPassword);
  const [localPhoto, setLocalPhoto] = useState(profilePhoto);
  const [localPhotoFile, setLocalPhotoFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState("");

  React.useEffect(() => {
    if (accountSaveError) {
      adminToast.error("Unable to save account", accountSaveError);
      setAccountSaveError("");
    }
  }, [accountSaveError]);

  // Synchronize local states with hoisted props
  React.useEffect(() => {
    setLocalName(adminName);
    setLocalEmail(adminEmail);
    setLocalPassword(currentPassword);
    setLocalPhoto(profilePhoto);
    setLocalPhotoFile(null);
  }, [adminName, adminEmail, currentPassword, profilePhoto]);

  // Notification states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [notifFrequency, setNotifFrequency] = useState("Instant");

  // Notification local edit states
  const [localEmailNotif, setLocalEmailNotif] = useState(emailNotif);
  const [localSmsNotif, setLocalSmsNotif] = useState(smsNotif);
  const [localPushNotif, setLocalPushNotif] = useState(pushNotif);
  const [localFrequency, setLocalFrequency] = useState(notifFrequency);

  // Synchronize local notification states
  React.useEffect(() => {
    setLocalEmailNotif(emailNotif);
    setLocalSmsNotif(smsNotif);
    setLocalPushNotif(pushNotif);
    setLocalFrequency(notifFrequency);
  }, [emailNotif, smsNotif, pushNotif, notifFrequency]);

  // Security states
  const [twoFactor, setTwoFactor] = useState(true); // Default to true as per mockup
  const [sessionTimeout, setSessionTimeout] = useState("off"); // Default to off as per mockup

  // Security local edit states
  const [localTwoFactor, setLocalTwoFactor] = useState(twoFactor);
  const [localTwoFactorType, setLocalTwoFactorType] = useState<"authApp" | "sms">("authApp");
  const [localSessionTimeout, setLocalSessionTimeout] = useState(sessionTimeout);

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome - Riyadh, SA", status: "Current session - Active now", current: true },
    { id: 2, device: "Safari - iPhone", status: "2 hours ago", current: false }
  ]);

  // Change password local states
  const [currentSecPassword, setCurrentSecPassword] = useState("");
  const [newSecPassword, setNewSecPassword] = useState("");
  const [confirmSecPassword, setConfirmSecPassword] = useState("");
  const [showCurrentSecPassword, setShowCurrentSecPassword] = useState(false);
  const [showNewSecPassword, setShowNewSecPassword] = useState(false);
  const [showConfirmSecPassword, setShowConfirmSecPassword] = useState(false);

  // Sync security states
  React.useEffect(() => {
    setLocalTwoFactor(twoFactor);
    setLocalSessionTimeout(sessionTimeout);
  }, [twoFactor, sessionTimeout]);

  // Password criteria checklist evaluator
  const getPasswordCriteria = (password: string) => {
    // If empty, evaluate default 'SarahAdminPassword' to match mockup default criteria
    const pwdToEval = password || "SarahAdminPassword";
    return {
      minLength: pwdToEval.length >= 8,
      hasUpper: /[A-Z]/.test(pwdToEval),
      hasLower: /[a-z]/.test(pwdToEval),
      hasNumber: /[0-9]/.test(pwdToEval),
      hasSpecial: /[^A-Za-z0-9]/.test(pwdToEval)
    };
  };

  const getPasswordStrengthDetails = (password: string) => {
    const criteria = getPasswordCriteria(password);
    const score = Object.values(criteria).filter(Boolean).length;
    let name = "Weak";
    if (score === 5) name = "Strong";
    else if (score >= 3) name = "Medium";
    return { score, name, criteria };
  };

  // Language states
  const [systemLanguage, setSystemLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  // Language local edit states
  const [localInterfaceLanguage, setLocalInterfaceLanguage] = useState(systemLanguage);
  const [localDisplayLanguage, setLocalDisplayLanguage] = useState("English (United States)");
  const [localTextDirection, setLocalTextDirection] = useState("LTR");
  const [localSystemDateFormat, setLocalSystemDateFormat] = useState("MM/DD/YYYY (e.g. 07/14/2025)");
  const [localNumberFormat, setLocalNumberFormat] = useState("1,000.00 (Western)");

  // Sync language local states
  React.useEffect(() => {
    setLocalInterfaceLanguage(systemLanguage);
    if (systemLanguage === "ar") {
      setLocalDisplayLanguage("Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Saudi Arabia)");
      setLocalTextDirection("RTL");
    } else {
      setLocalDisplayLanguage("English (United States)");
      setLocalTextDirection("LTR");
    }
  }, [systemLanguage]);

  React.useEffect(() => {
    if (dateFormat === "DD/MM/YYYY") {
      setLocalSystemDateFormat("DD/MM/YYYY (e.g. 14/07/2025)");
    } else if (dateFormat === "YYYY-MM-DD") {
      setLocalSystemDateFormat("YYYY-MM-DD (e.g. 2025-07-14)");
    } else {
      setLocalSystemDateFormat("MM/DD/YYYY (e.g. 07/14/2025)");
    }
  }, [dateFormat]);

  // Modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);

  // Completion statuses
  const [statuses, setStatuses] = useState({
    general: "Configured",
    account: "Configured",
    notifications: "Configured",
    security: "Configured", // Default state is Configured when inactive (2FA is enabled by default)
    language: "Configured"
  });

  // Calculate Overall Completion
  const getCompletionPercentage = () => {
    let score = 0;
    
    // General
    score += 20;
    
    // Account
    score += 20;
    
    // Notifications (active/configured with >= 2 active channels gets 20%)
    const count = [emailNotif, smsNotif, pushNotif].filter(Boolean).length;
    if (count >= 2) score += 20;
    else if (count === 1) score += 10;
    else score += 5;

    // Security (Weight: 20%)
    // 2FA active: +5%
    // Inactivity timeout active (not "off"): +5%
    // Password Strength (Strong: +10%, Medium: +3%, Weak: +0%)
    if (twoFactor) score += 5;
    if (sessionTimeout !== "off") score += 5;
    
    const pwdStrength = getPasswordStrengthDetails(newSecPassword).name;
    if (pwdStrength === "Strong") score += 10;
    else if (pwdStrength === "Medium") score += 3;

    // Language
    score += 20;

    return score;
  };

  const handleAccordionToggle = (section: string) => {
    setSettingsSection(settingsSection === section ? null : section);
  };

  const handleGeneralSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSuccess();
    setStatuses(prev => ({ ...prev, general: "Configured" }));
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSaveError("");
    setIsAccountSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", localName);
      formData.append("email", localEmail);

      if (localPassword) {
        formData.append("password", localPassword);
      }

      if (localPhotoFile) {
        formData.append("photo", localPhotoFile);
      }

      const { data } = await api.patch("/accounts/me/", formData);

      setAdminName(data.name || localName);
      setAdminEmail(data.email || localEmail);
      setCurrentPassword("");
      setLocalPassword("");
      setLocalPhotoFile(null);
      setProfilePhoto(data.photo_url || localPhoto || "/home-images/testimonial-avatar.webp");
      setLocalPhoto(data.photo_url || localPhoto || "/home-images/testimonial-avatar.webp");
      onSaveSuccess("Account profile updated", "Your profile changes have been saved.");
      setStatuses(prev => ({ ...prev, account: "Updated" }));
    } catch (error) {
      const responseData = error?.response?.data;
      const message =
        responseData?.email?.[0] ||
        responseData?.photo?.[0] ||
        responseData?.password?.[0] ||
        responseData?.detail ||
        "Unable to save account profile.";
      setAccountSaveError(message);
    } finally {
      setIsAccountSaving(false);
    }
  };

  const handleDiscardAccountChanges = () => {
    setLocalName(adminName);
    setLocalEmail(adminEmail);
    setLocalPassword(currentPassword);
    setLocalPhoto(profilePhoto);
    setLocalPhotoFile(null);
    setAccountSaveError("");
    alert("Changes discarded!");
  };

  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to real states
    setEmailNotif(localEmailNotif);
    setSmsNotif(localSmsNotif);
    setPushNotif(localPushNotif);
    setNotifFrequency(localFrequency);

    // Calculate completion status
    const count = [localEmailNotif, localSmsNotif, localPushNotif].filter(Boolean).length;
    let status = "Attention";
    if (count === 3) status = "Configured";
    else if (count > 0) status = "Partial";
    setStatuses(prev => ({ ...prev, notifications: status }));

    onSaveSuccess("Notification preferences updated", "Your changes have been saved successfully and are now active.");
  };

  const handleDiscardNotifications = () => {
    setLocalEmailNotif(emailNotif);
    setLocalSmsNotif(smsNotif);
    setLocalPushNotif(pushNotif);
    setLocalFrequency(notifFrequency);
    alert("Changes discarded!");
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newSecPassword && newSecPassword !== confirmSecPassword) {
      alert("New password and confirmation password do not match!");
      return;
    }

    // Save to real states
    setTwoFactor(localTwoFactor);
    setSessionTimeout(localSessionTimeout);

    if (newSecPassword) {
      // Mock update password in parent
      setCurrentPassword(newSecPassword);
      // Warning action: revoke other sessions
      setActiveSessions([
        { id: 1, device: "Chrome - Riyadh, SA", status: "Current session - Active now", current: true }
      ]);
      // Clear password inputs
      setCurrentSecPassword("");
      setNewSecPassword("");
      setConfirmSecPassword("");
      
      onSaveSuccess("Security settings updated", "Your admin password has been changed, and other active sessions have been revoked.");
    } else {
      onSaveSuccess("Security settings updated", "Your account protection parameters are now active.");
    }

    setStatuses(prev => ({ ...prev, security: localTwoFactor ? "Configured" : "Attention" }));
  };

  const handleDiscardSecurityChanges = () => {
    setLocalTwoFactor(twoFactor);
    setLocalTwoFactorType("authApp");
    setLocalSessionTimeout(sessionTimeout);
    setCurrentSecPassword("");
    setNewSecPassword("");
    setConfirmSecPassword("");
    alert("Security changes discarded!");
  };

  const handleRevokeSession = (id: number) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    alert("Session revoked successfully.");
  };

  const handleRevokeAllOther = () => {
    setActiveSessions(prev => prev.filter(s => s.current));
    alert("All other active sessions have been revoked.");
  };

  const handleLanguageSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to real states
    setSystemLanguage(localInterfaceLanguage);
    
    let realDateFormat = "DD/MM/YYYY";
    if (localSystemDateFormat.includes("MM/DD/YYYY")) {
      realDateFormat = "MM/DD/YYYY";
    } else if (localSystemDateFormat.includes("YYYY-MM-DD")) {
      realDateFormat = "YYYY-MM-DD";
    }
    setDateFormat(realDateFormat);

    // Call save success callback
    onSaveSuccess("Language preferences updated", "Your interface language has been successfully saved and applied.");
    setStatuses(prev => ({ ...prev, language: "Configured" }));
  };

  const handleDiscardLanguageChanges = () => {
    setLocalInterfaceLanguage(systemLanguage);
    if (systemLanguage === "ar") {
      setLocalDisplayLanguage("Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Saudi Arabia)");
      setLocalTextDirection("RTL");
    } else {
      setLocalDisplayLanguage("English (United States)");
      setLocalTextDirection("LTR");
    }

    if (dateFormat === "DD/MM/YYYY") {
      setLocalSystemDateFormat("DD/MM/YYYY (e.g. 14/07/2025)");
    } else if (dateFormat === "YYYY-MM-DD") {
      setLocalSystemDateFormat("YYYY-MM-DD (e.g. 2025-07-14)");
    } else {
      setLocalSystemDateFormat("MM/DD/YYYY (e.g. 07/14/2025)");
    }
    setLocalNumberFormat("1,000.00 (Western)");
    alert("Language changes discarded!");
  };

  const triggerPlatformNameFocus = () => {
    if (platformNameInputRef.current) {
      platformNameInputRef.current.focus();
    }
  };

  const handleResetDefaults = () => {
    setPlatformName("TIJARUK");
    setTimeZone("Asia/Riyadh (GMT+3)");
    setCurrency("SAR - Saudi Riyal");
    
    // Reset props
    setAdminName("Sarah Admin");
    setAdminEmail("sarah.admin@tijaruk.sa");
    setCurrentPassword("securepassword");
    setProfilePhoto("/home-images/testimonial-avatar.webp");

    // Reset local edit states
    setLocalName("Sarah Admin");
    setLocalEmail("sarah.admin@tijaruk.sa");
    setLocalPassword("securepassword");
    setLocalPhoto("/home-images/testimonial-avatar.webp");
    
    // Reset notification preferences
    setEmailNotif(true);
    setSmsNotif(false);
    setPushNotif(true);
    setNotifFrequency("Instant");

    setLocalEmailNotif(true);
    setLocalSmsNotif(false);
    setLocalPushNotif(true);
    setLocalFrequency("Instant");

    setTwoFactor(false);
    setSessionTimeout("30");
    setSystemLanguage("en");
    setDateFormat("DD/MM/YYYY");
    
    setStatuses({
      general: "Configured",
      account: "Active",
      notifications: "Partial",
      security: "Attention",
      language: "Configured"
    });

    setIsResetModalOpen(false);
    onSaveSuccess();
  };

  const handleExportConfig = () => {
    const config = {
      platformName,
      timeZone,
      currency,
      adminName,
      adminEmail,
      notifications: { emailNotif, smsNotif, pushNotif },
      security: { twoFactor, sessionTimeout },
      language: { systemLanguage, dateFormat },
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tijaruk_config_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onSaveSuccess();
  };

  const changeLogs = [
    { id: 1, user: "Super Admin", action: "Updated security parameters (2FA)", date: "Today, 10:24 AM", icon: Shield, color: "text-[#ea5455] bg-[#ea5455]/10" },
    { id: 2, user: "Super Admin", action: "Changed Platform Logo configuration", date: "Yesterday, 04:12 PM", icon: Sliders, color: "text-[#500c56] bg-[#500c56]/10" },
    { id: 3, user: "System Auto", action: "Daily configurations export generated", date: "June 2, 2026, 12:00 AM", icon: Download, color: "text-[#2b87e3] bg-[#2b87e3]/10" },
    { id: 4, user: "Super Admin", action: "Configured Language Settings to English", date: "May 28, 2026, 09:30 AM", icon: Languages, color: "text-[#28c76f] bg-[#28c76f]/10" }
  ];

  return (
    <div className="space-y-6 w-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left Column: Accordions (2/3 width on desktop) */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* 1. General Settings Accordion */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] overflow-hidden shadow-sm transition-all duration-300">
          <div
            onClick={() => handleAccordionToggle("general")}
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#500c56]/10 text-[#500c56] flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-bold text-gray-800">General Settings</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Platform name, logo and regional settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settingsSection === "general" && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f] border border-[#28c76f]/10">
                  Expanded
                </span>
              )}
              {settingsSection === "general" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {settingsSection === "general" && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <form onSubmit={handleGeneralSave} className="space-y-6">
                
                {/* Platform Name field */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Platform Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      ref={platformNameInputRef}
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={triggerPlatformNameFocus}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#500c56] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Platform Logo upload area */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Platform Logo</label>
                  <input
                    ref={platformLogoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handlePlatformLogoChange}
                  />
                  <div
                    onClick={() => platformLogoInputRef.current?.click()}
                    className="border-2 border-dashed border-[#eef0f3] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white justify-between cursor-pointer hover:border-[#500c56]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {platformLogoPreview ? (
                        <img src={platformLogoPreview} alt="Platform logo" className="w-14 h-14 rounded-2xl object-contain border border-gray-100 shrink-0 bg-gray-50" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#e39b4d] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-inner">
                          {platformName ? platformName.charAt(0).toUpperCase() : "T"}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-bold text-gray-700">
                          Drop your logo here, or <span className="text-[#500c56] underline cursor-pointer hover:text-[#6c1674]">browse</span>
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">
                          Supports PNG, JPG, SVG - Max 2MB. Recommended 256x256px
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); platformLogoInputRef.current?.click(); }}
                      className="border border-[#eef0f3] hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm shrink-0 mt-3 sm:mt-0 w-full sm:w-auto justify-center"
                    >
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span>{platformLogoPreview ? "Change" : "Upload"}</span>
                    </button>
                  </div>
                </div>

                {/* Grid for Time Zone and Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Time Zone Select */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Time Zone</label>
                    <div className="relative">
                      <select
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="appearance-none w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer"
                      >
                        <option value="Asia/Riyadh (GMT+3)">Asia/Riyadh (GMT+3)</option>
                        <option value="Asia/Dubai (GMT+4)">Asia/Dubai (GMT+4)</option>
                        <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                        <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                        <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Currency Select */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Currency</label>
                    <div className="relative">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="appearance-none w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer"
                      >
                        <option value="SAR - Saudi Riyal">SAR - Saudi Riyal</option>
                        <option value="AED - UAE Dirham">AED - UAE Dirham</option>
                        <option value="USD - US Dollar">USD - US Dollar</option>
                        <option value="EUR - Euro">EUR - Euro</option>
                        <option value="GBP - British Pound">GBP - British Pound</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] font-semibold">Changes will apply platform-wide immediately</span>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#df8a3c] hover:bg-[#c27c38] text-white text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* 2. Account Settings Accordion */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] overflow-hidden shadow-sm transition-all duration-300">
          <div
            onClick={() => handleAccordionToggle("account")}
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2b87e3]/10 text-[#2b87e3] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-bold text-gray-800">Account Settings</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Admin profile, email and password management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settingsSection === "account" && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#2b87e3]/10 text-[#2b87e3] border border-[#2b87e3]/10">
                  Expanded
                </span>
              )}
              {settingsSection === "account" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {settingsSection === "account" && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <form onSubmit={handleAccountSave} className="space-y-6">
                
                {/* PROFILE PICTURE */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Profile Picture</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
                    
                    {/* Circle avatar image with overlay camera button */}
                    <div className="relative w-20 h-20 rounded-full border-2 border-[#e39b4d]/30 overflow-visible shrink-0 shadow-inner">
                      <img 
                        src={localPhoto} 
                        className="w-full h-full object-cover rounded-full" 
                        alt="Sarah Admin" 
                      />
                      <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#df8a3c] text-white hover:bg-[#c27c38] cursor-pointer transition-colors shadow-md border-2 border-white flex items-center justify-center shrink-0">
                        <Camera className="h-3.5 w-3.5" />
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLocalPhotoFile(file);
                              setLocalPhoto(URL.createObjectURL(file));
                            }
                          }} 
                        />
                      </label>
                    </div>

                    {/* Upload box */}
                    <input
                      ref={profilePhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    <div
                      onClick={() => profilePhotoInputRef.current?.click()}
                      className="border-2 border-dashed border-[#eef0f3] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white justify-between flex-1 w-full cursor-pointer hover:border-[#500c56]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2b87e3] flex items-center justify-center shrink-0">
                          <Upload className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-gray-700">
                            Drop your photo here, or <span className="text-[#500c56] underline cursor-pointer hover:text-[#6c1674]">browse</span>
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">
                            PNG, JPG supported - Max 2MB. Recommended 256x256px
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); profilePhotoInputRef.current?.click(); }}
                        className="border border-[#eef0f3] hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-sm shrink-0 mt-3 sm:mt-0 w-full sm:w-auto justify-center"
                      >
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* FULL NAME with user icon inside */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="text"
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* EMAIL ADDRESS with mail icon and verified badge */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type="email"
                      value={localEmail}
                      onChange={(e) => setLocalEmail(e.target.value)}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-28 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                      required
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                {/* CURRENT PASSWORD with lock and eye toggle */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={localPassword}
                      onChange={(e) => setLocalPassword(e.target.value)}
                      className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-11 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 mt-1 pl-1">
                    <Info className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold">Leave blank to keep your current password unchanged</span>
                  </div>
                </div>

                {/* Key blue callout box */}
                {/* Key blue callout box */}
                <div className="bg-[#f0f6ff] text-[#2b87e3] border border-[#d2e4ff] rounded-2xl p-4 flex items-center gap-3.5 text-xs sm:text-sm font-bold text-left mt-2">
                  <div className="p-2 bg-blue-500 text-white rounded-xl">
                    <Key className="h-4 w-4" />
                  </div>
                  <p>
                    Want to change your password? <span className="underline cursor-pointer hover:text-blue-755" onClick={() => alert("Password reset link has been dispatched to your verified email.")}>Click here to set a new one</span>
                  </p>
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2b87e3]" />
                    <span className="text-[11px] font-bold text-gray-400">Last updated: Today at 2:34 PM</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDiscardAccountChanges}
                      className="w-full sm:w-auto border border-[#eef0f3] hover:bg-gray-50 text-gray-700 text-xs sm:text-sm px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-sm"
                    >
                      Discard
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isAccountSaving}
                      className="w-full sm:w-auto bg-[#df8a3c] hover:bg-[#c27c38] text-white text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{isAccountSaving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* 3. Notification Settings Accordion */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] overflow-hidden shadow-sm transition-all duration-300">
          <div
            onClick={() => handleAccordionToggle("notifications")}
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff9f43]/10 text-[#ff9f43] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-bold text-gray-800">Notification Settings</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Email, SMS and push notification preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settingsSection === "notifications" && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#ff9f43]/10 text-[#ff9f43] border border-[#ff9f43]/10">
                  Expanded
                </span>
              )}
              {settingsSection === "notifications" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {settingsSection === "notifications" && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 font-semibold text-left mb-6 leading-relaxed">
                Choose how you want to receive alerts and updates from the TIJARUK platform. You can enable or disable each channel independently.
              </p>

              <form onSubmit={handleNotificationsSave} className="space-y-6">
                
                {/* 1. Email Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#eef0f3] bg-white gap-4">
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-11 h-11 rounded-full bg-[#2b87e3]/10 text-[#2b87e3] flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-800">Email Notifications</p>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Receive alerts, reports, and activity summaries directly to your registered email address.
                      </p>
                      
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-0.5 rounded-full text-[10px] font-bold">
                          {adminEmail}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 fill-current" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setLocalEmailNotif(!localEmailNotif)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        localEmailNotif ? "bg-[#df8a3c]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localEmailNotif ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">
                      {localEmailNotif ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* 2. SMS Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#eef0f3] bg-white gap-4">
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-11 h-11 rounded-full bg-[#500c56]/10 text-[#500c56] flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-800">SMS Notifications</p>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Get instant text messages for critical alerts, approvals, and time-sensitive updates.
                      </p>
                      
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        <span className="bg-[#500c56]/5 text-[#500c56] border border-[#500c56]/10 px-3 py-0.5 rounded-full text-[10px] font-bold">
                          +966 5XX XXX XXXX
                        </span>
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span>Unverified</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setLocalSmsNotif(!localSmsNotif)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        localSmsNotif ? "bg-[#df8a3c]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSmsNotif ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">
                      {localSmsNotif ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* 3. Push Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#eef0f3] bg-white gap-4">
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-11 h-11 rounded-full bg-[#ea5455]/10 text-[#ea5455] flex items-center justify-center shrink-0">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-800">Push Notifications</p>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Browser and device push alerts for real-time platform activity and urgent notifications.
                      </p>
                      
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        <span className="bg-red-50 text-red-750 border border-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <Monitor className="h-3 w-3 text-red-500" />
                          <span>Browser Enabled</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setLocalPushNotif(!localPushNotif)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        localPushNotif ? "bg-[#df8a3c]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localPushNotif ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">
                      {localPushNotif ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* 4. Notification Frequency Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#eef0f3] bg-white gap-4">
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-11 h-11 rounded-full bg-[#500c56]/10 text-[#500c56] flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-800">Notification Frequency</p>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Control how often digests and summaries are sent
                      </p>
                    </div>
                  </div>

                  {/* Frequency select */}
                  <div className="relative shrink-0 w-full sm:w-36">
                    <select
                      value={localFrequency}
                      onChange={(e) => setLocalFrequency(e.target.value)}
                      className="appearance-none w-full bg-white border border-[#eef0f3] rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer"
                    >
                      <option value="Instant">Instant</option>
                      <option value="Daily">Daily Digest</option>
                      <option value="Weekly">Weekly Digest</option>
                      <option value="Never">Never</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-gray-400">Last updated: Today at 3:47 PM</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDiscardNotifications}
                      className="w-full sm:w-auto border border-[#eef0f3] hover:bg-gray-50 text-gray-700 text-xs sm:text-sm px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-sm"
                    >
                      Discard
                    </button>
                    
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-[#df8a3c] hover:bg-[#c27c38] text-white text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}
        </div>

        {/* 4. Security Settings Accordion */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] overflow-hidden shadow-sm transition-all duration-300">
          <div
            onClick={() => handleAccordionToggle("security")}
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ea5455]/10 text-[#ea5455] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-bold text-gray-800">Security Settings</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Two-factor auth, password strength and access control</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settingsSection === "security" && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#ea5455]/10 text-[#ea5455] border border-[#ea5455]/10">
                  Expanded
                </span>
              )}
              {settingsSection === "security" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {settingsSection === "security" && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 font-semibold text-left mb-6 leading-relaxed">
                Manage your platform's security settings. Enable two-factor authentication, configure password strength requirements, and update your admin password below.
              </p>

              <form onSubmit={handleSecuritySave} className="space-y-6">
                
                {/* 1. TWO-FACTOR AUTHENTICATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Two-Factor Authentication</span>
                  </div>

                  <div className="border border-[#eef0f3] rounded-2xl p-5 bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#500c56]/10 text-[#500c56] flex items-center justify-center shrink-0">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-extrabold text-gray-800">Enable Two-Factor Authentication</h4>
                          <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">
                            Add an extra layer of security to your account. You'll be prompted for a verification code each time you log in.
                          </p>
                          <div className="flex gap-2 mt-2.5">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>Recommended</span>
                            </span>
                            <span className="bg-[#500c56]/5 text-[#500c56] border border-[#500c56]/10 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                              Authenticator App
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setLocalTwoFactor(!localTwoFactor)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            localTwoFactor ? "bg-[#df8a3c]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              localTwoFactor ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">
                          {localTwoFactor ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    {/* Radio Options */}
                    {localTwoFactor && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        {/* Option A: Authenticator App */}
                        <div 
                          onClick={() => setLocalTwoFactorType("authApp")}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            localTwoFactorType === "authApp" 
                              ? "border-[#500c56] bg-[#500c56]/5" 
                              : "border-gray-200 bg-white hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              localTwoFactorType === "authApp" ? "bg-[#500c56] text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                              <Shield className="h-4.5 w-4.5" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs sm:text-sm font-extrabold text-gray-800">Authenticator App</p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Google / Microsoft Auth</p>
                            </div>
                          </div>
                          <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                            localTwoFactorType === "authApp" ? "border-[#500c56]" : "border-gray-300"
                          }`}>
                            {localTwoFactorType === "authApp" && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#500c56]" />
                            )}
                          </div>
                        </div>

                        {/* Option B: SMS Code */}
                        <div 
                          onClick={() => setLocalTwoFactorType("sms")}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            localTwoFactorType === "sms" 
                              ? "border-[#500c56] bg-[#500c56]/5" 
                              : "border-gray-200 bg-white hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              localTwoFactorType === "sms" ? "bg-[#500c56] text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                              <MessageSquare className="h-4.5 w-4.5" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs sm:text-sm font-extrabold text-gray-800">SMS Code</p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Via mobile number</p>
                            </div>
                          </div>
                          <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                            localTwoFactorType === "sms" ? "border-[#500c56]" : "border-gray-300"
                          }`}>
                            {localTwoFactorType === "sms" && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#500c56]" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. PASSWORD STRENGTH SETTINGS */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Password Strength Settings</span>
                  </div>

                  {(() => {
                    const pwdDetails = getPasswordStrengthDetails(newSecPassword);
                    return (
                      <div className="border border-[#eef0f3] rounded-2xl p-5 bg-white space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-left">
                            <Lock className="h-4.5 w-4.5 text-gray-400" />
                            <span className="text-xs sm:text-sm font-extrabold text-gray-700">Current Password Strength</span>
                          </div>
                          <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm ${
                            pwdDetails.name === "Strong" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : pwdDetails.name === "Medium"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                            {pwdDetails.name}
                          </span>
                        </div>

                        {/* 5-bar indicator */}
                        <div className="grid grid-cols-5 gap-1.5 h-2">
                          {[1, 2, 3, 4, 5].map((idx) => {
                            let filled = idx <= pwdDetails.score;
                            let barColor = "bg-gray-100";
                            if (filled) {
                              if (pwdDetails.name === "Strong") barColor = "bg-[#28c76f]";
                              else if (pwdDetails.name === "Medium") barColor = "bg-[#df8a3c]";
                              else barColor = "bg-[#ea5455]";
                            }
                            return <div key={idx} className={`h-full rounded-full ${barColor}`} />;
                          })}
                        </div>

                        <p className="text-[10px] text-gray-400 font-semibold text-left">
                          Your password meets {pwdDetails.score} of 5 strength criteria. Improve it by satisfying all requirements below.
                        </p>

                        {/* Criteria Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-1">
                          {/* Min 8 chars */}
                          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                            pwdDetails.criteria.minLength 
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-800 font-extrabold" 
                              : "bg-gray-50/20 border-gray-100 text-gray-400"
                          }`}>
                            {pwdDetails.criteria.minLength ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-current shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-300 shrink-0" />
                            )}
                            <span>Min. 8 characters</span>
                          </div>

                          {/* Uppercase */}
                          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                            pwdDetails.criteria.hasUpper 
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-800 font-extrabold" 
                              : "bg-gray-50/20 border-gray-100 text-gray-400"
                          }`}>
                            {pwdDetails.criteria.hasUpper ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-current shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-355 shrink-0" />
                            )}
                            <span>Uppercase letters</span>
                          </div>

                          {/* Lowercase */}
                          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                            pwdDetails.criteria.hasLower 
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-800 font-extrabold" 
                              : "bg-gray-50/20 border-gray-100 text-gray-400"
                          }`}>
                            {pwdDetails.criteria.hasLower ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-current shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-355 shrink-0" />
                            )}
                            <span>Lowercase letters</span>
                          </div>

                          {/* Numbers */}
                          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                            pwdDetails.criteria.hasNumber 
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-800 font-extrabold" 
                              : "bg-gray-50/20 border-gray-100 text-gray-400"
                          }`}>
                            {pwdDetails.criteria.hasNumber ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-current shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-355 shrink-0" />
                            )}
                            <span>Numbers required</span>
                          </div>

                          {/* Special characters */}
                          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                            pwdDetails.criteria.hasSpecial 
                              ? "bg-emerald-50/40 border-emerald-100 text-emerald-800 font-extrabold" 
                              : "bg-gray-50/20 border-gray-100 text-gray-400"
                          }`}>
                            {pwdDetails.criteria.hasSpecial ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-current shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-355 shrink-0" />
                            )}
                            <span>Special characters (e.g. !@#$%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. CHANGE ADMIN PASSWORD */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Change Admin Password</span>
                  </div>

                  <div className="space-y-4 text-left">
                    {/* Current Password Field */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-0.5">
                        <span>Current Password</span>
                        <span className="text-[#ea5455] font-extrabold">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type={showCurrentSecPassword ? "text" : "password"}
                          value={currentSecPassword}
                          onChange={(e) => setCurrentSecPassword(e.target.value)}
                          placeholder="************"
                          className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-11 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentSecPassword(!showCurrentSecPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrentSecPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password Field */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-0.5">
                        <span>New Password</span>
                        <span className="text-[#ea5455] font-extrabold">*</span>
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                        <input
                          type={showNewSecPassword ? "text" : "password"}
                          value={newSecPassword}
                          onChange={(e) => setNewSecPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-11 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewSecPassword(!showNewSecPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewSecPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold pl-1">
                        Use at least 12 characters including numbers and special characters.
                      </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-0.5">
                        <span>Confirm New Password</span>
                        <span className="text-[#ea5455] font-extrabold">*</span>
                      </label>
                      <div className="relative">
                        <RotateCcw className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showConfirmSecPassword ? "text" : "password"}
                          value={confirmSecPassword}
                          onChange={(e) => setConfirmSecPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-11 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmSecPassword(!showConfirmSecPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmSecPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Yellow/Amber Warning Alert */}
                    <div className="bg-amber-50 text-amber-900 border border-amber-100 rounded-2xl p-4 flex items-start gap-3.5 text-xs sm:text-sm font-bold text-left mt-2">
                      <div className="p-1.5 bg-[#df8a3c] text-white rounded-lg shrink-0 mt-0.5 shadow-sm">
                        <AlertTriangle className="h-4.5 w-4.5" />
                      </div>
                      <p className="leading-relaxed">
                        Changing your password will log you out of all active sessions. You'll need to log in again with the new password.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-gray-400">Last updated: 5 days ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDiscardSecurityChanges}
                      className="w-full sm:w-auto border border-[#eef0f3] hover:bg-gray-50 text-gray-700 text-xs sm:text-sm px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-sm"
                    >
                      Discard
                    </button>
                    
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-[#df8a3c] hover:bg-[#c27c38] text-white text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}
        </div>

        {/* 5. Language Settings Accordion */}
        <div className="bg-white border border-[#eef0f3] rounded-[24px] overflow-hidden shadow-sm transition-all duration-300">
          <div
            onClick={() => handleAccordionToggle("language")}
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#28c76f]/10 text-[#28c76f] flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-bold text-gray-800">Language Settings</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Interface language and regional display options</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {settingsSection === "language" && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f] border border-[#28c76f]/10">
                  Expanded
                </span>
              )}
              {settingsSection === "language" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {settingsSection === "language" && (
            <div className="p-6 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 font-semibold text-left mb-6 leading-relaxed">
                Choose your preferred interface language. This setting affects how text, labels, and content direction are displayed across the TIJARUK platform.
              </p>

              <form onSubmit={handleLanguageSave} className="space-y-6">
                
                {/* 1. INTERFACE LANGUAGE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Interface Language</span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Option English */}
                    <div 
                      onClick={() => {
                        setLocalInterfaceLanguage("en");
                        setLocalDisplayLanguage("English (United States)");
                        setLocalTextDirection("LTR");
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        localInterfaceLanguage === "en" 
                          ? "border-[#500c56] bg-[#500c56]/5" 
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl">
                          ðŸ‡¬ðŸ‡§
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-gray-800">English</span>
                            <span className="bg-[#500c56]/10 text-[#500c56] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Current</span>
                          </div>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">Left-to-right (LTR) - International</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        localInterfaceLanguage === "en" ? "border-[#500c56]" : "border-gray-300"
                      }`}>
                        {localInterfaceLanguage === "en" && (
                          <span className="w-3 h-3 rounded-full bg-[#500c56]" />
                        )}
                      </div>
                    </div>

                    {/* Option Arabic */}
                    <div 
                      onClick={() => {
                        setLocalInterfaceLanguage("ar");
                        setLocalDisplayLanguage("Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Saudi Arabia)");
                        setLocalTextDirection("RTL");
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        localInterfaceLanguage === "ar" 
                          ? "border-[#500c56] bg-[#500c56]/5" 
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl">
                          ðŸ‡¸ðŸ‡¦
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-extrabold text-gray-800">Arabic</span>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">Right-to-left (RTL) - Middle East</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        localInterfaceLanguage === "ar" ? "border-[#500c56]" : "border-gray-300"
                      }`}>
                        {localInterfaceLanguage === "ar" && (
                          <span className="w-3 h-3 rounded-full bg-[#500c56]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DISPLAY LANGUAGE */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Display Language</span>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-0.5">
                      <span>Select Platform Language</span>
                      <span className="text-[#ea5455] font-extrabold">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                        {/* Custom Globe SVG */}
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9m-9-9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <select
                        value={localDisplayLanguage}
                        onChange={(e) => setLocalDisplayLanguage(e.target.value)}
                        className="appearance-none w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer"
                      >
                        <option value="English (United States)">English (United States)</option>
                        <option value="Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Saudi Arabia)">Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Saudi Arabia)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <ChevronDown className="h-4.5 w-4.5" />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold pl-1">
                      Changing the language will reload the interface to apply changes.
                    </p>
                  </div>
                </div>

                {/* 3. TEXT DIRECTION */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Text Direction</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* LTR Option */}
                    <div 
                      onClick={() => setLocalTextDirection("LTR")}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        localTextDirection === "LTR" 
                          ? "border-[#500c56] bg-[#500c56]/5" 
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          localTextDirection === "LTR" ? "bg-[#500c56] text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
                          </svg>
                        </div>
                        <div className="text-left font-sans">
                          <p className="text-xs sm:text-sm font-extrabold text-gray-800">LTR</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Left to Right</p>
                        </div>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        localTextDirection === "LTR" ? "border-[#500c56]" : "border-gray-300"
                      }`}>
                        {localTextDirection === "LTR" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#500c56]" />
                        )}
                      </div>
                    </div>

                    {/* RTL Option */}
                    <div 
                      onClick={() => setLocalTextDirection("RTL")}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        localTextDirection === "RTL" 
                          ? "border-[#500c56] bg-[#500c56]/5" 
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          localTextDirection === "RTL" ? "bg-[#500c56] text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M10 12h10M4 18h16" />
                          </svg>
                        </div>
                        <div className="text-left font-sans">
                          <p className="text-xs sm:text-sm font-extrabold text-gray-800">RTL</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Right to Left</p>
                        </div>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        localTextDirection === "RTL" ? "border-[#500c56]" : "border-gray-300"
                      }`}>
                        {localTextDirection === "RTL" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#500c56]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. DATE & NUMBER FORMAT */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-l-4 border-[#500c56] pl-3 mb-4">
                    <span className="text-xs font-bold text-[#500c56] tracking-wider uppercase">Date & Number Format</span>
                  </div>

                  <div className="space-y-4 text-left">
                    {/* Date Format Select */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Date Format</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          {/* Calendar Custom SVG */}
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <select
                          value={localSystemDateFormat}
                          onChange={(e) => setLocalSystemDateFormat(e.target.value)}
                          className="appearance-none w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer"
                        >
                          <option value="MM/DD/YYYY (e.g. 07/14/2025)">MM/DD/YYYY (e.g. 07/14/2025)</option>
                          <option value="DD/MM/YYYY (e.g. 14/07/2025)">DD/MM/YYYY (e.g. 14/07/2025)</option>
                          <option value="YYYY-MM-DD (e.g. 2025-07-14)">YYYY-MM-DD (e.g. 2025-07-14)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <ChevronDown className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    </div>

                    {/* Number Format Select */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-[#8c9ba5] uppercase tracking-wider">Number Format</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none font-bold text-sm">
                          #
                        </div>
                        <select
                          value={localNumberFormat}
                          onChange={(e) => setLocalNumberFormat(e.target.value)}
                          className="appearance-none w-full bg-white border border-[#eef0f3] rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#500c56] focus:ring-1 focus:ring-[#500c56] transition-all cursor-pointer"
                        >
                          <option value="1,000.00 (Western)">1,000.00 (Western)</option>
                          <option value="1.000,00 (European)">1.000,00 (European)</option>
                          <option value="1000,00 (Simple)">1000,00 (Simple)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                          <ChevronDown className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    </div>

                    {/* Green Callout Alert Box */}
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3.5 text-xs sm:text-sm font-bold text-left mt-2">
                      <div className="p-1.5 bg-[#28c76f] text-white rounded-lg shrink-0 mt-0.5 shadow-sm">
                        <Info className="h-4.5 w-4.5" />
                      </div>
                      <p className="leading-relaxed">
                        Format preferences apply across all dates, currency amounts, and numeric values displayed on the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-gray-400">Last updated: Just now</span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDiscardLanguageChanges}
                      className="w-full sm:w-auto border border-[#eef0f3] hover:bg-gray-50 text-gray-700 text-xs sm:text-sm px-6 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-sm"
                    >
                      Discard
                    </button>
                    
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-[#df8a3c] hover:bg-[#c27c38] text-white text-xs sm:text-sm px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Dynamic widgets (1/3 width on desktop) */}
      <div className="space-y-6">
        {settingsSection === "account" ? (
          <>
            {/* Account Overview Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#500c56] rounded-xl">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Account Overview</h3>
                </div>

                <div className="text-center py-4 flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full border border-gray-200 overflow-visible mb-3">
                    <img 
                      src={profilePhoto} 
                      className="w-full h-full object-cover rounded-full" 
                      alt={adminName} 
                    />
                    <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full bg-[#28c76f] border-2 border-white" />
                  </div>

                  <h4 className="font-bold text-gray-800 text-base">{adminName}</h4>
                  <p className="text-xs text-gray-400 font-bold mb-3">Platform Administrator</p>

                  <div className="inline-flex items-center gap-1.5 bg-[#500c56]/10 text-[#500c56] text-xs font-bold px-4 py-1.5 rounded-full">
                    <Crown className="h-3.5 w-3.5 text-[#500c56] fill-current shrink-0" />
                    <span>Super Admin</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-2 text-left">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs sm:text-sm font-semibold text-gray-400">Email</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-700 truncate max-w-[165px]">{adminEmail}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs sm:text-sm font-semibold text-gray-400">Member Since</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-700">Jan 2023</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-xs sm:text-sm font-semibold text-gray-400">2FA Status</span>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                      Not Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Overview Card (Account shows "Active") */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#500c56] rounded-xl">
                    <List className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Settings Overview</h3>
                </div>

                <div className="space-y-1">
                  <div 
                    onClick={() => handleAccordionToggle("general")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">General</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.general}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("account")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2b87e3]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Account</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#2b87e3]/10 text-[#2b87e3]">
                      Active
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("notifications")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff9f43]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Notifications</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ff9f43]/10 text-[#ff9f43]">
                      {statuses.notifications}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("security")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ea5455]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Security</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ea5455]/10 text-[#ea5455]">
                      {statuses.security}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("language")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Language</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.language}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Overall Completion</span>
                    <span className="text-[#500c56] font-extrabold">{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#500c56] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : settingsSection === "security" ? (
          <>
            {/* Security Status Card */}
            {(() => {
              const pwdDetails = getPasswordStrengthDetails(newSecPassword);
              // Base 20 + 2FA (40) + Password strength (Medium = 22, Strong = 40) + Session timeout (active = 20)
              let secScore = 20;
              if (localTwoFactor) secScore += 40;
              if (localSessionTimeout !== "off") secScore += 20;
              
              if (pwdDetails.name === "Strong") secScore += 40;
              else if (pwdDetails.name === "Medium") secScore += 22;
              
              if (secScore > 100) secScore = 100;

              return (
                <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                      <div className="p-2 bg-[#ea5455]/10 text-[#ea5455] rounded-xl">
                        <Shield className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">Security Status</h3>
                    </div>

                    <div className="space-y-4 mt-4">
                      {/* Security Score */}
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <span className="text-xs sm:text-sm font-semibold text-gray-600">Security Score</span>
                        </div>
                        <span className="text-[#df8a3c] font-extrabold text-sm sm:text-base">{secScore} / 100</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            secScore >= 80 ? "bg-[#28c76f]" : secScore >= 50 ? "bg-[#df8a3c]" : "bg-[#ea5455]"
                          }`} 
                          style={{ width: `${secScore}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                        Enable all security features to reach a 100% score.
                      </p>

                      {/* 2FA Row */}
                      <div className="flex items-center justify-between py-2 border-t border-gray-100/50">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            localTwoFactor ? "bg-emerald-50 text-emerald-500" : "bg-gray-50 text-gray-400"
                          }`}>
                            <Shield className="h-4 w-4" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">2FA</span>
                        </div>
                        <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm ${
                          localTwoFactor ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-50 text-gray-400 border border-gray-100"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${localTwoFactor ? "bg-emerald-500" : "bg-gray-300"}`} />
                          <span>{localTwoFactor ? "Active" : "Inactive"}</span>
                        </span>
                      </div>

                      {/* Password Row */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            pwdDetails.name === "Strong" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                          }`}>
                            <Lock className="h-4 w-4" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">Password</span>
                        </div>
                        <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm ${
                          pwdDetails.name === "Strong" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : pwdDetails.name === "Medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-red-50 text-red-750 border border-red-100"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            pwdDetails.name === "Strong" ? "bg-emerald-500" : pwdDetails.name === "Medium" ? "bg-amber-500" : "bg-red-500"
                          }`} />
                          <span>{pwdDetails.name}</span>
                        </span>
                      </div>

                      {/* Session Timeout Row */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">Session Timeout</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-400">
                          Off
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Settings Overview Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#500c56] rounded-xl">
                    <List className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Settings Overview</h3>
                </div>

                <div className="space-y-1">
                  <div 
                    onClick={() => handleAccordionToggle("general")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">General</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.general}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("account")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2b87e3]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Account</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#2b87e3]/10 text-[#2b87e3]">
                      Configured
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("notifications")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff9f43]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Notifications</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ff9f43]/10 text-[#ff9f43]">
                      Configured
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("security")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ea5455]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Security</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ea5455]/10 text-[#ea5455]">
                      Active
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("language")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Language</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.language}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Overall Completion</span>
                    <span className="text-[#500c56] font-extrabold">{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#500c56] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Sessions Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-[#500c56]/10 text-[#500c56] rounded-xl">
                    <Monitor className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Active Sessions</h3>
                </div>

                <div className="space-y-3 mt-4">
                  {activeSessions.map((sess) => (
                    <div key={sess.id} className="flex items-center justify-between py-1 border-b border-gray-100/40 last:border-b-0 pb-2.5 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-gray-500 flex items-center justify-center shrink-0">
                          {sess.device.includes("iPhone") ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Monitor className="h-4 w-4" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-xs sm:text-sm font-extrabold text-gray-700">{sess.device}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{sess.status}</p>
                        </div>
                      </div>
                      
                      {sess.current ? (
                        <span className="h-2 w-2 rounded-full bg-[#28c76f] mr-2" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="text-[11px] font-extrabold text-[#ea5455] hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {activeSessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRevokeAllOther}
                    className="w-full mt-4 py-2.5 border border-red-100 hover:bg-red-50/50 text-[#ea5455] rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Key className="h-3.5 w-3.5" />
                    <span>Revoke All Other Sessions</span>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : settingsSection === "language" ? (
          <>
            {/* Language Preview Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-[#28c76f]/10 text-[#28c76f] rounded-xl">
                    {/* custom globe icon */}
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9m-9-9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Language Preview</h3>
                </div>

                <div className="space-y-4 mt-4">
                  {/* English preview box */}
                  <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2 text-left">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
                      <span className="text-sm">ðŸ‡¬ðŸ‡§</span>
                      <span className="text-xs font-bold text-gray-800">English Â· LTR</span>
                    </div>
                    <p className="text-[11px] font-extrabold text-gray-800">Welcome to TIJARUK</p>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Manage your RFQs, products, and supplier relationships all in one place.
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      <span className="bg-[#500c56] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">Dashboard</span>
                      <span className="bg-white border border-gray-200 text-gray-400 text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">Settings</span>
                    </div>
                  </div>

                  {/* Arabic preview box */}
                  <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2 text-right font-sans" dir="rtl">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100 justify-start" dir="ltr">
                      <span className="text-sm">ðŸ‡¸ðŸ‡¦</span>
                      <span className="text-xs font-bold text-gray-800">Arabic Â· RTL</span>
                    </div>
                    <p className="text-[11px] font-extrabold text-gray-800">Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ ÙÙŠ ØªØ¬Ø§Ø±ÙˆÙƒ</p>
                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                      Ø¥Ø¯Ø§Ø±Ø© Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø£Ø³Ø¹Ø§Ø± ÙˆØ§Ù„Ù…Ù†ØªØ¬Ø§Øª ÙˆØ¹Ù„Ø§Ù‚Ø§Øª Ø§Ù„Ù…ÙˆØ±Ø¯ÙŠÙ† ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯.
                    </p>
                    <div className="flex gap-1.5 pt-1 justify-start">
                      <span className="bg-[#500c56] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…</span>
                      <span className="bg-white border border-gray-200 text-gray-400 text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Overview Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#500c56] rounded-xl">
                    <List className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Settings Overview</h3>
                </div>

                <div className="space-y-1">
                  <div 
                    onClick={() => handleAccordionToggle("general")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">General</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.general}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("account")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2b87e3]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Account</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#2b87e3]/10 text-[#2b87e3]">
                      Configured
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("notifications")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff9f43]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Notifications</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ff9f43]/10 text-[#ff9f43]">
                      Configured
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("security")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ea5455]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Security</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ea5455]/10 text-[#ea5455]">
                      Configured
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("language")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Language</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      Active
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Overall Completion</span>
                    <span className="text-[#500c56] font-extrabold">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#500c56] h-full rounded-full transition-all duration-500" 
                      style={{ width: `100%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-extrabold mt-2 pt-1 border-t border-gray-50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-current shrink-0" />
                    <span>All settings fully configured</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Languages Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#2b87e3] rounded-xl">
                    <Languages className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Supported Languages</h3>
                </div>

                <div className="space-y-4 mt-4">
                  {/* English row */}
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100/50 last:border-b-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base shrink-0">ðŸ‡¬ðŸ‡§</span>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-extrabold text-gray-800">English</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">LTR Â· Default</p>
                      </div>
                    </div>
                    <span className="bg-purple-50 text-[#500c56] border border-purple-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#500c56]" />
                      <span>Active</span>
                    </span>
                  </div>

                  {/* Arabic row */}
                  <div className="flex items-center justify-between py-1.5 border-b border-gray-100/50 last:border-b-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base shrink-0">ðŸ‡¸ðŸ‡¦</span>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-extrabold text-gray-800">Arabic</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">RTL Â· Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Available</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : settingsSection === "notifications" ? (
          <>
            {/* Notification Summary Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-[#ff9f43]/10 text-[#ff9f43] rounded-xl">
                    <Bell className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Notification Summary</h3>
                </div>

                <div className="space-y-3 mt-4">
                  {/* Email Channel */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Email</span>
                    </div>
                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      localEmailNotif 
                        ? "bg-amber-50 text-amber-700 border border-amber-100" 
                        : "bg-slate-50 text-gray-400 border border-gray-100"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${localEmailNotif ? "bg-amber-500" : "bg-gray-300"}`} />
                      <span>{localEmailNotif ? "Active" : "Inactive"}</span>
                    </span>
                  </div>

                  {/* SMS Channel */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">SMS</span>
                    </div>
                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      localSmsNotif 
                        ? "bg-amber-50 text-amber-700 border border-amber-100" 
                        : "bg-slate-50 text-gray-400 border border-gray-100"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${localSmsNotif ? "bg-amber-500" : "bg-gray-300"}`} />
                      <span>{localSmsNotif ? "Active" : "Inactive"}</span>
                    </span>
                  </div>

                  {/* Push Channel */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <Bell className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Push</span>
                    </div>
                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      localPushNotif 
                        ? "bg-amber-50 text-amber-700 border border-amber-100" 
                        : "bg-slate-50 text-gray-400 border border-gray-100"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${localPushNotif ? "bg-amber-500" : "bg-gray-300"}`} />
                      <span>{localPushNotif ? "Active" : "Inactive"}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Active Channels */}
                <div className="border-t border-gray-100 pt-4 mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Channels Active</span>
                    <span className="text-gray-800 font-extrabold">
                      {[localEmailNotif, localSmsNotif, localPushNotif].filter(Boolean).length} / 3
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#df8a3c] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${([localEmailNotif, localSmsNotif, localPushNotif].filter(Boolean).length / 3) * 100}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    {!localSmsNotif 
                      ? "Enable SMS to reach full notification coverage." 
                      : [localEmailNotif, localSmsNotif, localPushNotif].filter(Boolean).length === 3 
                      ? "All notification channels active." 
                      : "Configure active channels above."}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Overview Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#500c56] rounded-xl">
                    <List className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Settings Overview</h3>
                </div>

                <div className="space-y-1">
                  <div 
                    onClick={() => handleAccordionToggle("general")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">General</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.general}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("account")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2b87e3]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Account</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#2b87e3]/10 text-[#2b87e3]">
                      Configured
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("notifications")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff9f43]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Notifications</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ff9f43]/10 text-[#ff9f43]">
                      Active
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("security")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ea5455]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Security</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ea5455]/10 text-[#ea5455]">
                      {statuses.security}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("language")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Language</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.language}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Overall Completion</span>
                    <span className="text-[#500c56] font-extrabold">{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#500c56] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Settings Overview Card (Default) */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#500c56] rounded-xl">
                    <List className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Settings Overview</h3>
                </div>

                <div className="space-y-1">
                  <div 
                    onClick={() => handleAccordionToggle("general")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">General</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.general}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("account")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2b87e3]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Account</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#2b87e3]/10 text-[#2b87e3]">
                      {statuses.account}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("notifications")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff9f43]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Notifications</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ff9f43]/10 text-[#ff9f43]">
                      {statuses.notifications}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("security")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ea5455]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Security</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#ea5455]/10 text-[#ea5455]">
                      {statuses.security}
                    </span>
                  </div>

                  <div 
                    onClick={() => handleAccordionToggle("language")}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100/50 last:border-b-0 cursor-pointer hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28c76f]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">Language</span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#28c76f]/10 text-[#28c76f]">
                      {statuses.language}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Overall Completion</span>
                    <span className="text-[#500c56] font-extrabold">{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#500c56] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#eef0f3] rounded-[24px] p-6 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
                  <div className="p-2 bg-slate-50 text-[#ff9f43] rounded-xl">
                    <Zap className="h-4.5 w-4.5 fill-current" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Quick Actions</h3>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => setIsResetModalOpen(true)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-gray-100/50 hover:border-purple-200/50 hover:bg-purple-50/10 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#500c56]/10 text-[#500c56] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-gray-900">Reset to Defaults</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleExportConfig}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-gray-100/50 hover:border-blue-200/50 hover:bg-blue-50/10 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#2b87e3]/10 text-[#2b87e3] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <Download className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-gray-900">Export Configuration</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setIsChangeLogOpen(true)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-[#eef0f3] hover:border-amber-200/50 hover:bg-amber-50/10 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#ff9f43]/10 text-[#ff9f43] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <History className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-gray-900">View Change Log</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal for Reset Defaults */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden transform transition-all duration-300 scale-100">
            <div className="bg-[#ea5455] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="text-sm font-bold">Reset Settings Defaults</h4>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left">
              <p className="text-sm text-gray-600">
                Are you sure you want to reset all platform configurations to their default values? This action will overwrite your current settings and logo reference.
              </p>
              
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex-1 py-2.5 bg-[#ea5455] hover:bg-[#d94445] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Change Log Drawer Modal */}
      {isChangeLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white h-full max-w-md w-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300 translate-x-0 relative">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#500c56] text-white">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#ff9f43]" />
                <h3 className="font-bold text-base">Platform Settings Log</h3>
              </div>
              <button
                onClick={() => setIsChangeLogOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:bg-white/10"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-left">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Recent Activities</p>
              
              <div className="space-y-4">
                {changeLogs.map((log) => {
                  const LogIcon = log.icon;
                  return (
                    <div key={log.id} className="flex gap-4 items-start p-3 rounded-2xl border border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.color}`}>
                        <LogIcon className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{log.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold">{log.user}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span className="text-[10px] text-gray-400 font-medium">{log.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium shrink-0">
              <span className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                Showing latest 4 entries
              </span>
              <button 
                onClick={() => alert("Loading more change records...")}
                className="text-[#500c56] font-bold hover:underline"
              >
                View Full Log
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  </div>
  );
}
