// src/components/EmergencySection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';


const EmergencySection = () => {
  const handleEmergencyClick = () => {
    // Implement the logic to handle emergency notification
    alert('Emergency button clicked!');
  };
  const navigate = useNavigate();
  return (
    <div className="bg-black rounded-lg p-6  text-center shadow-[0_0_20px_2px_rgba(255,255,255,0.2)]">
      <h2 className="text-2xl font-bold mb-2">ACİL! DURUM BİLDİRİMİ</h2>
      <p className="mb-4">Eğer hayvanlar normalden sessiz, hareketsiz, solgun görünüyorsa ya da garip bir durum sezdiyseniz bu butona basın. Fark edilen bu değişiklikler acil bir sorunun habercisi olabilir.</p>
      <button
        onClick={() => navigate("/notification")}
        className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-full hover:bg-red-700 transition duration-300"
      >
        BİLDİR !
      </button>
    </div>
  );
};

export default EmergencySection;
