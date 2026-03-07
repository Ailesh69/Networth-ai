import React from "react";

const StatusBar: React.FC = () => {
  return (
    <div className="flex justify-between items-center text-white text-sm font-medium px-6 py-2">
      <span>6:41</span>
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
        </div>
        <div className="w-6 h-3 bg-white rounded-sm ml-2"></div>
      </div>
    </div>
  );
};

export default StatusBar;

