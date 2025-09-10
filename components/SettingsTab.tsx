import React from 'react';

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

export default SettingsTab;
