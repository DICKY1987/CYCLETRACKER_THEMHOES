import React from 'react';
import { Heart, Calendar, Users, Gift, Bell } from 'lucide-react';

const Dashboard = ({ partners, setActiveTab, calculateCycleInfo }) => {
  const partner = partners[0];
  if (!partner) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Partners Added</h3>
          <p className="text-gray-600 mb-4">Add a partner to start tracking and providing support</p>
          <button
            onClick={() => setActiveTab('partners')}
            className="bg-pink-500 text-white px-6 py-2 rounded-xl hover:bg-pink-600 transition-colors"
          >
            Add Partner
          </button>
        </div>
      </div>
    );
  }

  const cycleInfo = calculateCycleInfo(partner.lastPeriodStart, partner.cycleLength);

  return (
    <div className="p-6 space-y-6">
      {/* Current Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Current Status</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Day {cycleInfo.cycleDay} of {partner.cycleLength}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-1">{partner.name}'s Phase</h3>
            <p className="text-2xl font-bold text-pink-600">{cycleInfo.phase}</p>
            <p className="text-sm text-gray-600">Day {cycleInfo.phaseDay}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-1">Next Phase</h3>
            <p className="text-xl font-semibold text-purple-600">{cycleInfo.nextPhase}</p>
            <p className="text-sm text-gray-600">In {cycleInfo.daysToNext} days</p>
          </div>
        </div>
      </div>

      {/* Energy & Mood */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Energy & Mood Forecast</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-800">Energy</p>
              <p className="text-sm text-gray-600">{cycleInfo.energy}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-800">Mood</p>
              <p className="text-sm text-gray-600">{cycleInfo.mood}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Support Tips for Today</h3>
        <div className="space-y-3">
          {cycleInfo.supportTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center space-x-2 bg-pink-50 p-3 rounded-xl hover:bg-pink-100 transition-colors">
            <Gift className="w-5 h-5 text-pink-600" />
            <span className="text-pink-800 font-medium">Plan Surprise</span>
          </button>
          <button className="flex items-center space-x-2 bg-purple-50 p-3 rounded-xl hover:bg-purple-100 transition-colors">
            <Bell className="w-5 h-5 text-purple-600" />
            <span className="text-purple-800 font-medium">Set Reminder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
