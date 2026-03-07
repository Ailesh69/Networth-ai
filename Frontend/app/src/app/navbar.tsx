// src/Navbar.tsx
"use client";

import React from 'react';

// You would use icons from a library like lucide-react here. For now, we'll use simple text.
const navItems = [
  { id: 1, name: 'Home', icon: '🏠' },
  { id: 2, name: 'Chat', icon: '💬' },
  { id: 3, name: 'Insights', icon: '📈' },
  { id: 4, name: 'Settings', icon: '⚙️' },
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-800 text-white p-4">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center text-xs">
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}