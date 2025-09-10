import React from 'react';
import { Calendar } from 'lucide-react';

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

export default CalendarTab;
