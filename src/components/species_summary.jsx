// src/components/SpeciesSummary.jsx
import React from 'react';
import useCountUp from '../hooks/useCountUp';

const SpeciesSummary = ({ totalAlive, speciesCount }) => {
  const animatedAlive = useCountUp(totalAlive);
  const animatedSpecies = useCountUp(speciesCount);

  return (
    <div className="bg-black rounded-lg p-6 flex justify-around items-center shadow-[0_0_20px_2px_rgba(255,255,255,0.2)]">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Total Alive</h3>
        <p className="text-3xl font-bold">{animatedAlive}</p>
      </div>
      <div className="h-16 w-px bg-gray-400 mx-4"></div>
      <div className="text-center">
        <h3 className="text-xl font-semibold">Species Count</h3>
        <p className="text-3xl font-bold">{animatedSpecies}</p>
      </div>
    </div>
  );
};

export default SpeciesSummary;
