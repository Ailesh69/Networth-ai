import React from "react";
import { Home, MessageCircle, BarChart3, Settings } from "lucide-react";

interface NavBarProps {
  active: string;
  setCurrentPage: (page: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ active, setCurrentPage }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 px-4 py-2">
      <div className="flex justify-around items-center">
        {[
          { key: "home", icon: Home, label: "Home" },
          { key: "chat", icon: MessageCircle, label: "Chat" },
          { key: "insights", icon: BarChart3, label: "Insights" },
          { key: "settings", icon: Settings, label: "Settings" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setCurrentPage(key)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 ${
              active === key ? "text-blue-400" : "text-gray-400"
            }`}
          >
            <Icon size={20} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
      <div className="w-32 h-1 bg-white rounded-full mx-auto mt-2"></div>
    </div>
  );
};

export default NavBar;

