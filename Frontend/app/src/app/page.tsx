"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiService, UploadStatementResponse } from "./services/api";

// ── Page Imports ──────────────────────────────────────────────────────────────
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";

// ── Types ─────────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  time: string;
};

type PageKey = "login" | "home" | "chat" | "insights" | "settings";
type LoginStep = "phone" | "otp" | "email";
type Personality =
  | "Friendly Coach"
  | "Professional Advisor"
  | "Minimalist Numbers";

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
];

// Max digits allowed per country code
const PHONE_MAX_LENGTH: Record<string, number> = {
  "+1": 10,
  "+44": 10,
  "+91": 10,
  "+92": 10,
  "+86": 11,
  "+49": 11,
  "+33": 9,
  "+81": 10,
  "+82": 10,
  "+61": 9,
  "+55": 11,
};

const INITIAL_CHAT_MESSAGE: Message = {
  id: 1,
  text: "Hello there! I'm your AI financial guide, here to help you get a clear picture of your finances. What can I help you with today?",
  sender: "ai",
  time: "9:41 AM",
};

const OTP_TIMER_SECONDS = 30;
const DEMO_OTP = "123456";

// System prompt per AI mentor personality
// These are injected into the /chat request so the AI behaves accordingly
const PERSONALITY_PROMPTS: Record<Personality, string> = {
  "Friendly Coach":
    "You are a warm, encouraging personal finance coach. Use simple language, be supportive, add relevant emojis, and celebrate small wins.",
  "Professional Advisor":
    "You are a formal, data-driven financial advisor. Be precise, use professional terminology, cite numbers, and avoid casual language.",
  "Minimalist Numbers":
    "You are a minimalist finance assistant. Respond with bullet points and numbers only. No fluff, no emojis, just the key figures and actions.",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const FinanceApp: React.FC = () => {
  // ── Hydration Guard ─────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<PageKey>("login");

  // ── Shared Financial Data ───────────────────────────────────────────────────
  // Lifted up so HomePage and InsightsPage stay in sync
  const [financialData, setFinancialData] =
    useState<UploadStatementResponse | null>(null);

  // ── Login State ─────────────────────────────────────────────────────────────
  const [loginStep, setLoginStep] = useState<LoginStep>("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS);

  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // ── Chat State ──────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Message[]>([
    INITIAL_CHAT_MESSAGE,
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ── Settings State ──────────────────────────────────────────────────────────
  const [biometric, setBiometric] = useState(true);
  const [localProcessing, setLocalProcessing] = useState(true);
  const [endToEnd, setEndToEnd] = useState(true);

  // AI mentor personality — affects chat system prompt
  const [personality, setPersonality] = useState<Personality>("Friendly Coach");

  // ── OTP Countdown Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loginStep === "otp" && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [loginStep, timer]);

  // ── Close Country Dropdown on Outside Click ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCountryDropdown &&
        !(event.target as Element).closest(".country-dropdown")
      ) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCountryDropdown]);

  // ── Login Handlers ──────────────────────────────────────────────────────────

  const handlePhoneSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Use country-specific required length
      const requiredLength = PHONE_MAX_LENGTH[countryCode] ?? 10;
      if (phoneNumber.length >= requiredLength) {
        setLoginStep("otp");
        setOtp("");
        setOtpError(null);
        setTimer(OTP_TIMER_SECONDS);
      }
    },
    [phoneNumber, countryCode],
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhoneNumber(e.target.value.replace(/\D/g, ""));
    },
    [],
  );

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      setCurrentPage("home");
      setEmail("");
    },
    [email],
  );

  const selectCountryCode = useCallback((code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
  }, []);

  const handleOtpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "");
      setOtp(value);
      setOtpError(null);
      if (value.length === 6) {
        if (value === DEMO_OTP) {
          setTimeout(() => setCurrentPage("home"), 500);
        } else {
          setOtpError("Invalid OTP. Please try again.");
          setTimeout(() => setOtpError(null), 1500);
        }
      }
    },
    [],
  );

  // ── Chat Handler ────────────────────────────────────────────────────────────

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: Message = {
      id: chatMessages.length + 1,
      text: newMessage,
      sender: "user",
      time: getCurrentTime(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setIsTyping(true);

    try {
      // Pass personality prompt so backend adjusts AI behavior accordingly
      const data = await apiService.chat(
        newMessage,
        PERSONALITY_PROMPTS[personality],
      );
      const aiMsg: Message = {
        id: userMsg.id + 1,
        text: data.reply,
        sender: "ai",
        time: getCurrentTime(),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: userMsg.id + 1,
        text: "Sorry, I couldn't connect to the server. Please try again.",
        sender: "ai",
        time: getCurrentTime(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Render Guard ────────────────────────────────────────────────────────────
  if (!mounted) return null;

  // ── Page Routing ────────────────────────────────────────────────────────────

  if (currentPage === "login") {
    return (
      <LoginPage
        loginStep={loginStep}
        countryCode={countryCode}
        showCountryDropdown={showCountryDropdown}
        setShowCountryDropdown={setShowCountryDropdown}
        phoneNumber={phoneNumber}
        handlePhoneSubmit={handlePhoneSubmit}
        handlePhoneChange={handlePhoneChange}
        selectCountryCode={selectCountryCode}
        countryCodes={COUNTRY_CODES}
        phoneInputRef={phoneInputRef}
        otpInputRef={otpInputRef}
        formatPhoneDisplay={formatPhoneDisplay}
        otp={otp}
        handleOtpChange={handleOtpChange}
        timer={timer}
        onChangeStep={setLoginStep}
        otpError={otpError}
        email={email}
        setEmail={setEmail}
        handleEmailSubmit={handleEmailSubmit}
        phoneMaxLength={PHONE_MAX_LENGTH}
      />
    );
  }

  if (currentPage === "chat") {
    return (
      <ChatPage
        active="chat"
        setCurrentPage={(p) => setCurrentPage(p as PageKey)}
        chatMessages={chatMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isTyping={isTyping}
      />
    );
  }

  if (currentPage === "insights") {
    return (
      // Pass shared financialData so InsightsPage stays in sync with HomePage
      <InsightsPage
        active="insights"
        setCurrentPage={(p) => setCurrentPage(p as PageKey)}
        financialData={financialData}
      />
    );
  }

  if (currentPage === "settings") {
    const displayPhone = phoneNumber
      ? `${countryCode} ${formatPhoneDisplay(phoneNumber)}`
      : "+91 555-123-4567";

    return (
      <SettingsPage
        active="settings"
        setCurrentPage={(p) => setCurrentPage(p as PageKey)}
        displayPhone={displayPhone}
        biometric={biometric}
        localProcessing={localProcessing}
        endToEnd={endToEnd}
        onToggleBiometric={() => setBiometric((v) => !v)}
        onToggleLocalProcessing={() => setLocalProcessing((v) => !v)}
        onToggleEndToEnd={() => setEndToEnd((v) => !v)}
        // Pass personality state so SettingsPage can change it
        personality={personality}
        onPersonalityChange={setPersonality}
      />
    );
  }

  return (
    <HomePage
      active="home"
      setCurrentPage={(p) => setCurrentPage(p as PageKey)}
      financialData={financialData}
      onFinancialDataChange={setFinancialData}
    />
  );
};

export default FinanceApp;
