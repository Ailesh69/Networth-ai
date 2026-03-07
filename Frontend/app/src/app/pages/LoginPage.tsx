"use client";

import React from "react";
import { BarChart3, Mail, ChevronDown } from "lucide-react";
import StatusBar from "../components/StatusBar";

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

interface LoginPageProps {
  loginStep: "phone" | "otp" | "email";
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
  onChangeStep: (step: "phone" | "otp" | "email") => void;
  setPhoneNumber?: (value: string) => void;
  otpError?: string | null;
  email?: string;
  setEmail?: (v: string) => void;
  handleEmailSubmit?: (e: React.FormEvent) => void;
}

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
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <StatusBar />
      <div className="px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
          <BarChart3 size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to FinanceAI</h1>
        <p className="text-gray-400 text-center mb-12">Your intelligent financial companion</p>

        {loginStep === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <div className="country-dropdown relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="absolute left-3 top-3 flex items-center space-x-1 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    <span className="text-sm">{countryCodes.find((c) => c.code === countryCode)?.flag}</span>
                    <span className="text-sm font-medium">{countryCode}</span>
                    <ChevronDown size={12} />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-12 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 w-48 max-h-60 overflow-y-auto">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => selectCountryCode(country.code)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center space-x-2 text-sm"
                        >
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                          <span className="text-gray-400">{country.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  ref={phoneInputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => (handlePhoneChange ? handlePhoneChange(e) : undefined)}
                  placeholder="Enter phone number"
                  className="w-full pl-20 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
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

            <div className="text-center">
              <p className="text-gray-400 text-sm">or continue with</p>
              <div className="flex justify-center space-x-4 mt-4">
                <button type="button" onClick={() => onChangeStep("email")} className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  <Mail size={20} />
                </button>
              </div>
            </div>
          </form>
        )}

        {loginStep === "email" && (
          <form onSubmit={handleEmailSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email ?? ""}
                onChange={(e) => setEmail && setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity">Continue</button>
            <button type="button" onClick={() => onChangeStep("phone")} className="w-full py-3 border border-gray-700 rounded-xl font-semibold hover:bg-gray-800 transition-colors">Use phone instead</button>
          </form>
        )}

        {loginStep === "otp" && (
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
              <p className="text-gray-400 text-sm mb-6">
                We sent a code to {countryCode} {formatPhoneDisplay(phoneNumber)}
              </p>
              <div className="mb-6">
                <input
                  ref={otpInputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit code"
                  className={`w-full py-3 px-4 text-center text-xl font-semibold bg-gray-800 border rounded-xl text-white focus:border-blue-500 focus:outline-none tracking-widest ${otpError ? "border-red-500 animate-[shake_.2s_ease-in-out_0s_2]" : "border-gray-700"}`}
                  autoComplete="one-time-code"
                  maxLength={6}
                />
                {otpError && (
                  <div className="mt-2 text-red-400 text-sm">{otpError}</div>
                )}
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Didn't receive code? {timer > 0 ? (
                    <span className="text-gray-500"> Resend in {timer}s</span>
                  ) : (
                    <button className="text-blue-400 ml-1 hover:underline">Resend</button>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => onChangeStep("phone")}
              className="w-full py-3 border border-gray-700 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Change Number
            </button>
            <p className="text-xs text-gray-500 text-center">Hint: Enter 123456 to continue to the app</p>
          </div>
        )}

        {/* Popup Toast */}
        {otpError && (
          <div className="fixed inset-x-0 top-4 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-red-600/90 text-white px-4 py-2 rounded-lg shadow-lg border border-red-400 animate-[fadeIn_.15s_ease-out,slideDown_.15s_ease-out]">
              Invalid OTP. Please try again.
            </div>
          </div>
        )}

        {/* Animations */}
        <style jsx>{`
          @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideDown { from { transform: translateY(-8px) } to { transform: translateY(0) } }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;
