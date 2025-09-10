import React, { useState, useEffect } from 'react';
import { Heart, Bell } from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import PartnersTab from './components/PartnersTab';
import SettingsTab from './components/SettingsTab';
import BottomNav from './components/BottomNav';
import CalendarTab from './components/CalendarTab';
import QuickLogModal from './components/QuickLogModal';

const CycleSyncApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [partners, setPartners] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initialize app with sample data
  useEffect(() => {
    // Simulate logged in user
    setCurrentUser({
      id: 1,
      name: "Alex Johnson",
      email: "alex@example.com"
    });

    // Sample partner data
    setPartners([
      {
        id: 1,
        name: "Sarah",
        relationship: "Partner",
        consentGranted: true,
        consentDate: "2025-08-01",
        lastPeriodStart: "2025-08-10",
        cycleLength: 28,
        dataSharing: {
          cyclePhase: true,
          mood: true,
          energy: true,
          ovulation: false
        }
      }
    ]);

    // Sample notifications
    setNotifications([
      {
        id: 1,
        type: "support",
        message: "Sarah is in her luteal phase - consider extra patience and comfort",
        date: new Date().toISOString(),
        priority: "medium"
      }
    ]);
  }, []);

  // Cycle calculation logic
  const calculateCycleInfo = (lastPeriodStart, cycleLength) => {
    const startDate = new Date(lastPeriodStart);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSinceStart % cycleLength) + 1;

    let phase, phaseDay, nextPhase, daysToNext, energy, mood, supportTips;

    if (cycleDay >= 1 && cycleDay <= 5) {
      phase = "Menstruation";
      phaseDay = cycleDay;
      nextPhase = "Follicular";
      daysToNext = 6 - cycleDay;
      energy = "Low";
      mood = "Variable";
      supportTips = [
        "Offer comfort items like heating pads or warm tea",
        "Be understanding of mood changes",
        "Suggest gentle activities or rest time",
        "Stock up on her preferred menstrual products"
      ];
    } else if (cycleDay >= 6 && cycleDay <= 13) {
      phase = "Follicular";
      phaseDay = cycleDay - 5;
      nextPhase = "Ovulation";
      daysToNext = 14 - cycleDay;
      energy = "Rising";
      mood = "Positive";
      supportTips = [
        "Great time for planning activities together",
        "Energy levels are increasing - suggest active dates",
        "Support new projects or goals she mentions",
        "Show appreciation for her positive energy"
      ];
    } else if (cycleDay === 14) {
      phase = "Ovulation";
      phaseDay = 1;
      nextPhase = "Luteal";
      daysToNext = 1;
      energy = "High";
      mood = "Confident";
      supportTips = [
        "Peak energy time - great for adventures",
        "She may feel more social and outgoing",
        "Support any important conversations or decisions",
        "Appreciate her confidence and vitality"
      ];
    } else {
      phase = "Luteal";
      phaseDay = cycleDay - 14;
      nextPhase = "Menstruation";
      daysToNext = cycleLength - cycleDay + 1;
      energy = "Declining";
      mood = "Sensitive";
      supportTips = [
        "Practice extra patience and understanding",
        "Offer emotional support and listening",
        "Help with stress management",
        "Prepare for upcoming period needs"
      ];
    }

    return {
      cycleDay,
      phase,
      phaseDay,
      nextPhase,
      daysToNext,
      energy,
      mood,
      supportTips
    };
  };

  if (!currentUser) {
    return <LoginScreen setCurrentUser={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">CycleSync</h1>
              <p className="text-sm text-gray-600">Welcome back, {currentUser.name}</p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'dashboard' && (
          <Dashboard
            partners={partners}
            setActiveTab={setActiveTab}
            calculateCycleInfo={calculateCycleInfo}
          />
        )}
        {activeTab === 'partners' && (
          <PartnersTab partners={partners} setPartners={setPartners} />
        )}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Quick Log Modal */}
      <QuickLogModal />
    </div>
  );
};

export {
  LoginScreen,
  Dashboard,
  PartnersTab,
  SettingsTab,
  BottomNav,
  CalendarTab,
  QuickLogModal,
};

export default CycleSyncApp;
