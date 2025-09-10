import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Settings, Plus, Users, Shield, Bell, Gift, AlertCircle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';

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

  // Login component
  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CycleSync</h1>
          <p className="text-gray-600">Understand. Respect. Support.</p>
        </div>
        
        <button
          onClick={() => setCurrentUser({ id: 1, name: "Alex Johnson", email: "alex@example.com" })}
          className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
        >
          Continue with Demo Account
        </button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            A respectful period tracker for men to better support the women in their lives
          </p>
        </div>
      </div>
    </div>
  );

  // Dashboard component
  const Dashboard = () => {
    const partner = partners[0]; // For demo, showing first partner
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

  // Partners management component
  const PartnersTab = () => {
    const [showAddPartner, setShowAddPartner] = useState(false);
    const [newPartnerName, setNewPartnerName] = useState('');
    const [newPartnerRelation, setNewPartnerRelation] = useState('partner');

    const handleAddPartner = () => {
      if (newPartnerName.trim()) {
        const newPartner = {
          id: Date.now(),
          name: newPartnerName.trim(),
          relationship: newPartnerRelation,
          consentGranted: false,
          inviteSent: true,
          inviteDate: new Date().toISOString()
        };
        setPartners([...partners, newPartner]);
        setNewPartnerName('');
        setShowAddPartner(false);
      }
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Partners</h2>
          <button
            onClick={() => setShowAddPartner(true)}
            className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Partner</span>
          </button>
        </div>

        {showAddPartner && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Partner</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partner's Name</label>
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter partner's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  value={newPartnerRelation}
                  onChange={(e) => setNewPartnerRelation(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="partner">Romantic Partner</option>
                  <option value="daughter">Daughter</option>
                  <option value="friend">Friend</option>
                  <option value="colleague">Colleague</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddPartner}
                  className="flex-1 bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition-colors"
                >
                  Send Consent Invite
                </button>
                <button
                  onClick={() => setShowAddPartner(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {partners.map(partner => (
            <div key={partner.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{partner.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{partner.relationship}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {partner.consentGranted ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Consent Granted</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Pending Consent</span>
                    </div>
                  )}
                </div>
              </div>
              
              {partner.consentGranted && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Data Sharing</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`flex items-center space-x-1 ${partner.dataSharing.cyclePhase ? 'text-green-600' : 'text-gray-400'}`}>
                          {partner.dataSharing.cyclePhase ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span>Cycle</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${partner.dataSharing.mood ? 'text-green-600' : 'text-gray-400'}`}>
                          {partner.dataSharing.mood ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span>Mood</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Updated</p>
                      <p className="text-gray-800 mt-1">Today</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Settings component
  const SettingsTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Data Encryption</p>
                <p className="text-sm text-gray-600">All data is encrypted end-to-end</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Consent Logging</p>
                <p className="text-sm text-gray-600">Track all consent changes</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Support Reminders</p>
                <p className="text-sm text-gray-600">Get tips during different phases</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Phase Changes</p>
                <p className="text-sm text-gray-600">Alert when cycles change phases</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full flex items-center justify-start px-1">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              Export My Data
            </button>
            <button className="w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              Delete Account
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">About CycleSync</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Version 1.0.0</p>
            <p>Built with respect, consent, and privacy at its core</p>
            <div className="pt-3 border-t border-gray-100">
              <button className="text-pink-600 hover:text-pink-700">Privacy Policy</button>
              <span className="mx-2">•</span>
              <button className="text-pink-600 hover:text-pink-700">Terms of Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main navigation
  const BottomNav = () => (
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

  // Calendar component (placeholder)
  const CalendarTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cycle Calendar</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Calendar View</h3>
        <p className="text-gray-600">Visual cycle tracking and predictions coming soon</p>
      </div>
    </div>
  );

  if (!currentUser) {
    return <LoginScreen />;
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
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'partners' && <PartnersTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Quick Log Modal */}
      <QuickLogModal />
    </div>
  );
};

export default CycleSyncApp;