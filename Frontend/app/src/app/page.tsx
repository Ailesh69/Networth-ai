"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Extracted pages
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";

// Types
 type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  time: string;
};

 type PageKey = "login" | "home" | "chat" | "insights" | "settings";

const FinanceApp: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [currentPage, setCurrentPage] = useState<PageKey>("login");
  const [loginStep, setLoginStep] = useState<"phone" | "otp" | "email">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(30);

  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 1, text: "Hello there! I'm your AI financial guide, here to help you get a clear picture of your finances. What can I help you with today?", sender: "ai", time: "9:41 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Settings toggles
  const [biometric, setBiometric] = useState(true);
  const [localProcessing, setLocalProcessing] = useState(true);
  const [endToEnd, setEndToEnd] = useState(true);

  const countryCodes = [
    { code: "+1", country: "US", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+92", country: "PK", flag: "🇵🇰" },
    { code: "+86", country: "CN", flag: "🇨🇳" },
    { code: "+49", country: "DE", flag: "🇩🇪" },
    { code: "+33", country: "FR", flag: "🇫🇷" },
    { code: "+81", country: "JP", flag: "🇯🇵" },
    { code: "+82", country: "KR", flag: "🇰🇷" },
    { code: "+61", country: "AU", flag: "🇦🇺" },
    { code: "+55", country: "BR", flag: "🇧🇷" },
  ];

  // Preserve your current OTP timer behavior (0ms interval as set)
  useEffect(() => {
    if (loginStep === "otp" && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 0);
      return () => clearInterval(interval);
    }
  }, [loginStep, timer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCountryDropdown && !(event.target as Element).closest(".country-dropdown")) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCountryDropdown]);

  const handlePhoneSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setLoginStep("otp");
      setOtp("");
      setOtpError(null);
      setTimer(30);
    }
  }, [phoneNumber]);

  const handleEmailSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Demo: treat any email as success and go to home
    setCurrentPage("home");
    setEmail("");
  }, [email]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value.replace(/\D/g, ""));
    setTimeout(() => { phoneInputRef.current?.focus(); }, 0);
  }, []);

  const selectCountryCode = useCallback((code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
  }, []);

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
    setOtpError(null);
    setTimeout(() => { otpInputRef.current?.focus(); }, 0);
    if (value.length === 6) {
      if (value === "123456") {
        setTimeout(() => setCurrentPage("home"), 500);
      } else {
        setOtpError("Invalid OTP");
        setTimeout(() => setOtpError(null), 1500);
      }
    }
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: Message = { id: chatMessages.length + 1, text: newMessage, sender: "user", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages((prev) => [...prev, userMsg]);
    setNewMessage("");

    // Show typing indicator
    setIsTyping(true);
    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg: Message = { id: userMsg.id + 1, text: "Unavailable", sender: "ai", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  if (!mounted) return null;

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
        countryCodes={countryCodes}
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
    return <InsightsPage active="insights" setCurrentPage={(p) => setCurrentPage(p as PageKey)} />;
  }

  if (currentPage === "settings") {
    const displayPhone = phoneNumber ? `${countryCode} ${formatPhoneDisplay(phoneNumber)}` : "+1 555-123-4567";
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
      />
    );
  }

  return <HomePage active="home" setCurrentPage={(p) => setCurrentPage(p as PageKey)} />;
};

export default FinanceApp;
