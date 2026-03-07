import React from "react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";

interface SettingsPageProps {
  active: string;
  setCurrentPage: (page: string) => void;
  displayPhone: string;
  biometric: boolean;
  localProcessing: boolean;
  endToEnd: boolean;
  onToggleBiometric: () => void;
  onToggleLocalProcessing: () => void;
  onToggleEndToEnd: () => void;
}

const Toggle: React.FC<{checked: boolean; onClick: () => void; left?: boolean}> = ({ checked, onClick, left }) => (
  <button onClick={onClick} aria-pressed={checked} className={`w-12 h-6 ${checked ? "bg-blue-500" : "bg-gray-600"} rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-400`}>
    <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${checked ? "right-0.5" : "left-0.5"}`}></span>
  </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ active, setCurrentPage, displayPhone, biometric, localProcessing, endToEnd, onToggleBiometric, onToggleLocalProcessing, onToggleEndToEnd }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <StatusBar />
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="space-y-6 mb-20">
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-4">Profile</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
              <div>
                <p className="font-medium">Ailesh</p>
                <p className="text-gray-400 text-sm">{displayPhone}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-4">Security & Privacy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span>Biometric Login</span><Toggle checked={biometric} onClick={onToggleBiometric} /></div>
              <div className="flex justify-between items-center"><span>Local Data Processing</span><Toggle checked={localProcessing} onClick={onToggleLocalProcessing} /></div>
              <div className="flex justify-between items-center"><span>End-to-End Encryption</span><Toggle checked={endToEnd} onClick={onToggleEndToEnd} /></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span>Spend Alerts</span><Toggle checked={true} onClick={() => {}} /></div>
              <div className="flex justify-between items-center"><span>Goal Reminders</span><Toggle checked={true} onClick={() => {}} /></div>
              <div className="flex justify-between items-center"><span>Investment Updates</span><Toggle checked={false} onClick={() => {}} /></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-white font-medium mb-4">AI Mentor Settings</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Personality</label><select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"><option>Friendly Coach</option><option>Professional Advisor</option><option>Minimalist Numbers</option></select></div>
              <div><label className="block text-sm font-medium mb-2">Advice Frequency</label><select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"><option>Daily</option><option>Weekly</option><option>Monthly</option></select></div>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full py-3 text-red-400 border border-red-800 rounded-xl hover:bg-red-900/20 transition-colors">Sign Out</button>
            <button className="w-full py-3 text-gray-400 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors">Delete Account</button>
          </div>
        </div>
      </div>
      <NavBar active={active} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default SettingsPage;
