import React from 'react';
import { Heart, Users, Calendar, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
    <div className="flex justify-around">
      {[
        { id: 'dashboard', icon: Heart, label: 'Dashboard' },
        { id: 'partners', icon: Users, label: 'Partners' },
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-colors ${
            activeTab === id ? 'text-pink-600 bg-pink-50' : 'text-gray-500'
          }`}
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default BottomNav;
