import React, { useState } from 'react';
import { Plus, Heart, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const PartnersTab = ({ partners, setPartners }) => {
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
        {partners.map((partner) => (
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
                      <span
                        className={`flex items-center space-x-1 ${partner.dataSharing.cyclePhase ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {partner.dataSharing.cyclePhase ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span>Cycle</span>
                      </span>
                      <span
                        className={`flex items-center space-x-1 ${partner.dataSharing.mood ? 'text-green-600' : 'text-gray-400'}`}
                      >
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

export default PartnersTab;
