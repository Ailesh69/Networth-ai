"use client";

import React from "react";
import { BarChart3, Mail, ChevronDown } from "lucide-react";
import StatusBar from "../components/StatusBar";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

type LoginStep = "phone" | "otp" | "email";

interface LoginPageProps {
  loginStep: LoginStep;
  countryCode: string;
  showCountryDropdown: boolean;
  setShowCountryDropdown: (show: boolean) => void;
  phoneNumber: string;
  handlePhoneSubmit: (e: React.FormEvent) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectCountryCode: (code: string) => void;
  countryCodes: CountryCode[];
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  formatPhoneDisplay: (phone: string) => string;
  otp: string;
  handleOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  timer: number;
  onChangeStep: (step: LoginStep) => void;
  otpError?: string | null;
  email?: string;
  setEmail?: (v: string) => void;
  handleEmailSubmit?: (e: React.FormEvent) => void;
  phoneMaxLength: Record<string, number>; // Max digits per country code
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Login page with three steps: phone entry, OTP verification, and email login.
 * Step is controlled by the parent (page.tsx) via loginStep + onChangeStep props.
 */
const LoginPage: React.FC<LoginPageProps> = ({
  loginStep,
  countryCode,
  showCountryDropdown,
  setShowCountryDropdown,
  phoneNumber,
  handlePhoneSubmit,
  handlePhoneChange,
  selectCountryCode,
  countryCodes,
  phoneInputRef,
  otpInputRef,
  formatPhoneDisplay,
  otp,
  handleOtpChange,
  timer,
  onChangeStep,
  otpError,
  email,
  setEmail,
  handleEmailSubmit,
  phoneMaxLength,
}) => {
  // Find the flag for the currently selected country code
  const selectedCountry = countryCodes.find((c) => c.code === countryCode);

  return (
    <div className="min-h-screen bg-background text-white">
      <StatusBar />

      <div className="px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* App logo */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
          <BarChart3 size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Welcome to FinanceAI</h1>
        <p className="text-zinc-400 text-center mb-12">
          Your intelligent financial companion
        </p>

        {/* ── Step 1: Phone Entry ─────────────────────────────────────────── */}
        {loginStep === "phone" && (
          <form
            onSubmit={handlePhoneSubmit}
            className="w-full max-w-sm space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                {/* Country code selector dropdown */}
                <div className="country-dropdown relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="absolute left-3 top-3 flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors z-10"
                  >
                    <span className="text-sm">{selectedCountry?.flag}</span>
                    <span className="text-sm font-medium">{countryCode}</span>
                    <ChevronDown size={12} />
                  </button>

                  {/* Dropdown list of country codes */}
                  {showCountryDropdown && (
                    <div className="absolute top-12 left-0 bg-[#0A0F1E] border border-white/10 rounded-lg shadow-lg z-20 w-48 max-h-60 overflow-y-auto scrollbar-thin">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => selectCountryCode(country.code)}
                          className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-sm transition-colors"
                        >
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                          <span className="text-zinc-400">
                            {country.country}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input — maxLength enforces country-specific digit limit */}
                <input
                  ref={phoneInputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  maxLength={phoneMaxLength[countryCode] ?? 10}
                  className="w-full pl-20 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  autoComplete="tel"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Send OTP
            </button>

            {/* Alternative login method */}
            <div className="text-center">
              <p className="text-zinc-400 text-sm">or continue with</p>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  aria-label="Continue with email"
                  onClick={() => onChangeStep("email")}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Mail size={20} />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── Step 2: Email Login ─────────────────────────────────────────── */}
        {loginStep === "email" && (
          <form
            onSubmit={handleEmailSubmit}
            className="w-full max-w-sm space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email ?? ""}
                onChange={(e) => setEmail?.(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={() => onChangeStep("phone")}
              className="w-full py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
            >
              Use phone instead
            </button>
          </form>
        )}

        {/* ── Step 3: OTP Verification ────────────────────────────────────── */}
        {loginStep === "otp" && (
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
              <p className="text-zinc-400 text-sm mb-6">
                We sent a code to {countryCode}{" "}
                {formatPhoneDisplay(phoneNumber)}
              </p>

              {/* OTP input — shakes and turns red on invalid entry */}
              <div className="mb-6">
                <input
                  ref={otpInputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit code"
                  className={`w-full py-3 px-4 text-center text-xl font-semibold bg-white/5 border rounded-xl text-white focus:border-blue-500 focus:outline-none tracking-widest transition-colors ${
                    otpError
                      ? "border-red-500 animate-[shake_.2s_ease-in-out_0s_2]"
                      : "border-white/10"
                  }`}
                  autoComplete="one-time-code"
                  maxLength={6}
                />

                {/* Inline error message below OTP input */}
                {otpError && (
                  <p className="mt-2 text-red-400 text-sm text-center">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Resend code timer */}
              <div className="text-center">
                <p className="text-zinc-400 text-sm">
                  Didn&apos;t receive code?{" "}
                  {timer > 0 ? (
                    <span className="text-zinc-500">Resend in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      className="text-blue-400 ml-1 hover:underline"
                      onClick={() => onChangeStep("phone")}
                    >
                      Resend
                    </button>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onChangeStep("phone")}
              className="w-full py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
            >
              Change Number
            </button>

            {/* Demo hint — remove before production */}
            <p className="text-xs text-zinc-500 text-center">
              Hint: Enter 123456 to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
