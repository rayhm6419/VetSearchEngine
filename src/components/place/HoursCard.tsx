'use client';

import { Place } from '@/lib/types';
import { useState } from 'react';

interface HoursCardProps {
  place: Place;
}

export default function HoursCard({ place }: HoursCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!place.hours || place.hours.length === 0) {
    return null;
  }

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Hours</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className={`${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="space-y-2">
          {place.hours.map((hour, index) => (
            <div
              key={index}
              className={`flex justify-between items-center py-2 px-3 rounded ${
                hour.day === currentDay ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <span className={`font-medium ${
                hour.day === currentDay ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {hour.day}
              </span>
              <span className={`${
                hour.day === currentDay ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {hour.isClosed ? 'Closed' : `${hour.open} - ${hour.close}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Show current day only when collapsed */}
      {!isExpanded && (
        <div className="md:hidden">
          <div className="flex justify-between items-center py-2 px-3 rounded bg-blue-50 border-l-4 border-blue-500">
            <span className="font-medium text-blue-900">{currentDay}</span>
            <span className="text-blue-700">
              {place.hours.find(h => h.day === currentDay)?.isClosed 
                ? 'Closed' 
                : `${place.hours.find(h => h.day === currentDay)?.open} - ${place.hours.find(h => h.day === currentDay)?.close}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
