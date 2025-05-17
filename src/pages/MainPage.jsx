// src/pages/MainPage.jsx
import React from 'react';
import SpeciesSummary from '../components/species_summary';
import SpeciesTabs from '../components/species_details';
import EmergencySection from '../components/species_emergency';
import Navbar from '../components/Navbar';
//import BackgroundParticles from '../components/FancyParticles';
import FancyParticles from '../components/FancyParticles';

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gray-800 text-white pt-24 px-6">
      <Navbar />

      {/* Particle zone wrapper */}
      <div className="relative space-y-12 z-10 min-h-[100vh]">
        <FancyParticles />

        <div className="relative z-10">
          <SpeciesSummary totalAlive={200} speciesCount={5} />
        </div>

        <div className="relative z-10">
          <SpeciesTabs />
        </div>

        <div className="relative z-10">
          <EmergencySection />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
