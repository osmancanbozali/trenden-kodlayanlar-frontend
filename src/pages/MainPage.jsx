// src/pages/MainPage.jsx
import React, { useState, useEffect } from 'react';
import SpeciesSummary from '../components/species_summary';
import SpeciesTabs from '../components/species_details';
import EmergencySection from '../components/species_emergency';
import Navbar from '../components/Navbar';
//import BackgroundParticles from '../components/FancyParticles';
import FancyParticles from '../components/FancyParticles';


const MainPage = () => {
  const [totalPopulation, setTotalPopulation] = useState(0);
  
  useEffect(() => {
    const fetchSpeciesCount = async () => {
      const response = await fetch('https://trenden-kodlayanlar-backend.onrender.com/api/statistics/total-population/');
      const data = await response.json();
      setTotalPopulation(data.totalPopulation);
    };
    fetchSpeciesCount();
  }, []);
  return (
    <div className="min-h-screen bg-gray-800 text-white pt-24 px-6">
      <Navbar />

      {/* Particle zone wrapper */}
      <div className="relative space-y-12 z-10 min-h-[100vh]">
        <FancyParticles />

        <div className="relative z-10">
          <SpeciesSummary totalAlive={totalPopulation} speciesCount={5} />
        </div>

        <div className="relative z-10">
          <SpeciesTabs />
        </div>

        <div className="relative z-10 pb-8">
          <EmergencySection />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
