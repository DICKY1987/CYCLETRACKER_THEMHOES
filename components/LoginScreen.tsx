import React from 'react';
import { Heart } from 'lucide-react';

const LoginScreen = ({ setCurrentUser }) => (
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

export default LoginScreen;
