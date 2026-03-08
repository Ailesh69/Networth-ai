import React, { useState } from "react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";

// ── Types ─────────────────────────────────────────────────────────────────────
type Personality =
  | "Friendly Coach"
  | "Professional Advisor"
  | "Minimalist Numbers";

interface SettingsPageProps {
  active: string;
  setCurrentPage: (page: string) => void;
  displayPhone: string;
  displayName?: string;
  biometric: boolean;
  localProcessing: boolean;
  endToEnd: boolean;
  onToggleBiometric: () => void;
  onToggleLocalProcessing: () => void;
  onToggleEndToEnd: () => void;
  personality: Personality;
  onPersonalityChange: (p: Personality) => void;
}

interface ToggleProps {
  checked: boolean;
  onClick: () => void;
  label?: string;
}

// ── Toggle Component ──────────────────────────────────────────────────────────

const Toggle: React.FC<ToggleProps> = ({ checked, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={checked}
    aria-label={label}
    className={`w-12 h-6 rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
      checked ? "bg-blue-500" : "bg-white/20"
    }`}
  >
    <span
      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${
        checked ? "right-0.5" : "left-0.5"
      }`}
    />
  </button>
);

// ── Settings Row Helper ───────────────────────────────────────────────────────

const SettingRow: React.FC<{
  label: string;
  checked: boolean;
  onToggle: () => void;
}> = ({ label, checked, onToggle }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm">{label}</span>
    <Toggle checked={checked} onClick={onToggle} label={`Toggle ${label}`} />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const SettingsPage: React.FC<SettingsPageProps> = ({
  active,
  setCurrentPage,
  displayPhone,
  displayName = "User",
  biometric,
  localProcessing,
  endToEnd,
  onToggleBiometric,
  onToggleLocalProcessing,
  onToggleEndToEnd,
  personality, // ← from props
  onPersonalityChange, // ← from props
}) => {
  const [spendAlerts, setSpendAlerts] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [investmentUpdates, setInvestmentUpdates] = useState(false);
  const [adviceFrequency, setAdviceFrequency] = useState("Weekly");
  // personality is now a prop — removed local useState for it

  return (
    <div className="min-h-screen bg-background text-white">
      <StatusBar />

      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6 mb-20">
          {/* ── Profile ──────────────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">Profile</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-zinc-400 text-sm">{displayPhone}</p>
              </div>
            </div>
          </div>

          {/* ── Security & Privacy ────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">Security &amp; Privacy</h3>
            <div className="space-y-4">
              <SettingRow
                label="Biometric Login"
                checked={biometric}
                onToggle={onToggleBiometric}
              />
              <SettingRow
                label="Local Data Processing"
                checked={localProcessing}
                onToggle={onToggleLocalProcessing}
              />
              <SettingRow
                label="End-to-End Encryption"
                checked={endToEnd}
                onToggle={onToggleEndToEnd}
              />
            </div>
          </div>

          {/* ── Notifications ─────────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <SettingRow
                label="Spend Alerts"
                checked={spendAlerts}
                onToggle={() => setSpendAlerts((v) => !v)}
              />
              <SettingRow
                label="Goal Reminders"
                checked={goalReminders}
                onToggle={() => setGoalReminders((v) => !v)}
              />
              <SettingRow
                label="Investment Updates"
                checked={investmentUpdates}
                onToggle={() => setInvestmentUpdates((v) => !v)}
              />
            </div>
          </div>

          {/* ── AI Mentor Settings ────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-medium mb-4">AI Mentor Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Personality
                </label>
                {/* Wired to props — change here updates chat behavior in real time */}
                <select
                  value={personality}
                  onChange={(e) =>
                    onPersonalityChange(e.target.value as Personality)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Friendly Coach">Friendly Coach</option>
                  <option value="Professional Advisor">
                    Professional Advisor
                  </option>
                  <option value="Minimalist Numbers">Minimalist Numbers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Advice Frequency
                </label>
                <select
                  value={adviceFrequency}
                  onChange={(e) => setAdviceFrequency(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Account Actions ───────────────────────────────────────────── */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full py-3 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
            <button
              type="button"
              className="w-full py-3 text-zinc-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <NavBar active={active} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default SettingsPage;
