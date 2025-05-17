// src/components/SpeciesTabs.jsx
import React, { useState ,useEffect} from 'react';
import useCountUp from '../hooks/useCountUp';
import speciesModel from '../models/species';


  

const SpeciesTabs = () => {
    const [speciesData, setSpeciesData] = useState({});
    const [activeTab, setActiveTab] = useState(speciesData[0]);
    const [selectedSpecies, setSelectedSpecies] = useState(Object.keys(speciesModel)[0]);
    const [bgClass, setBgClass] = useState("bg-gray-800");
    const [imageSrc, setImageSrc] = useState(speciesModel[selectedSpecies]?.image || "");

    

    useEffect(() => {
        const fetchSpeciesData = async () => {
        try {
            const response = await fetch('https://trenden-kodlayanlar-backend.onrender.com/api/statistics/all/');
            const data = await response.json();
            setSpeciesData(data);
        } catch (error) {
            console.error('Error fetching species data:', error);
        }
        };
    
        fetchSpeciesData();
    }, []);

    useEffect(() => {
        const theme = speciesModel[selectedSpecies]?.themeColor;
        const image = speciesModel[selectedSpecies]?.image;
        if (theme) {
            console.log(image);
          setBgClass(theme);
          setImageSrc(image);
        } else {
          setBgClass("bg-gray-800");
        }
      }, [selectedSpecies]);

      
      

  return (
    <div className={`rounded-lg p-6 ${bgClass} shadow-[0_0_20px_2px_rgba(255,255,255,0.2)]`}>
      {/* Tabs */}
      <div className={`flex space-x-4 mb-4`}>
        {Object.keys(speciesModel).map((speciesName) => (
            <button
            key={speciesName}
            onClick={() => setSelectedSpecies(speciesName)}
            className={`px-4 py-2 rounded ${
                selectedSpecies === speciesName ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
            }`}
            >
            {speciesName}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className={`${bgClass} p-6 rounded-lg`}>
      <h2 className="text-2xl font-bold mb-2">{selectedSpecies}</h2>
      <p className="mb-4">{speciesModel[selectedSpecies].description}</p>
      <img
        src={imageSrc}
        alt={selectedSpecies}
        className="w-full h-full object-cover rounded mb-4"
      />
      <div className="grid grid-cols-2 gap-4">
        {speciesModel[selectedSpecies].fields.map((field) => (
            
          <div key={field.key} className="bg-gray-600 p-4 rounded">
            <p className="text-sm text-gray-300">{field.label}</p>
            <p className="text-lg font-semibold">
              {console.log(speciesData)}  
              {speciesData[selectedSpecies]?.[field.key] ?? 'Veri yok'}
              
            </p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default SpeciesTabs;
