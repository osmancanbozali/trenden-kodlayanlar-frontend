// src/components/EmergencySection.jsx
import React from 'react';

const EmergencySection = () => {
  const handleEmergencyClick = () => {
    // Implement the logic to handle emergency notification
    alert('Emergency button clicked!');
  };

  return (
    <div className="bg-black rounded-lg p-6 text-center shadow-[0_0_20px_2px_rgba(255,255,255,0.2)]">
      <h2 className="text-2xl font-bold mb-2">Emergency Title</h2>
      <p className="mb-4">Emergency description goes here. Provide details about when to use this feature.</p>
      <button
        onClick={handleEmergencyClick}
        className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-full hover:bg-red-700 transition duration-300"
      >
        Emergency
      </button>
    </div>
  );
};

export default EmergencySection;
