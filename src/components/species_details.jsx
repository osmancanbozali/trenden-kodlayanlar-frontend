// src/components/SpeciesTabs.jsx
import React, { useState, useEffect } from 'react';
import speciesStatistics from '../models/speciesStatistics';

const SpeciesTabs = () => {
    const [speciesData, setSpeciesData] = useState({});
    const [activeTab, setActiveTab] = useState(speciesData[0]);
    const [selectedSpecies, setSelectedSpecies] = useState(Object.keys(speciesStatistics)[0]);
    const [bgClass, setBgClass] = useState("bg-gray-800");
    const [imageSrc, setImageSrc] = useState(speciesStatistics[selectedSpecies]?.image || "");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpeciesData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/statistics/all/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Raw API response:', data);

                if (!data.statisticsBySpecies || !Array.isArray(data.statisticsBySpecies)) {
                    throw new Error('Invalid data format: statisticsBySpecies is missing or not an array');
                }

                // Transform the data into a more usable format
                const transformedData = {};
                data.statisticsBySpecies.forEach(species => {
                    if (!species.speciesType) {
                        console.warn('Species missing speciesType:', species);
                        return;
                    }
                    transformedData[species.speciesType] = {
                        totalPopulation: species.totalPopulation || 0,
                        totalAlivePopulation: species.totalAlivePopulation || 0,
                        totalDeadPopulation: species.totalDeadPopulation || 0,
                        totalMalePopulation: species.totalMalePopulation || 0,
                        totalFemalePopulation: species.totalFemalePopulation || 0,
                        totalFertileFemalePopulation: species.totalFertileFemalePopulation || 0,
                        totalNewBornPopulation: species.totalNewBornPopulation || 0,
                        totalYoungPopulation: species.totalYoungPopulation || 0,
                        totalOldPopulation: species.totalOldPopulation || 0,
                        populationStatus: species.populationStatus || "Veri Yok"
                    };
                });

                console.log('Transformed data:', transformedData);
                setSpeciesData(transformedData);
                setError(null);
            } catch (error) {
                console.error('Error fetching species data:', error);
                setError(error.message);
            }
        };

        fetchSpeciesData();
    }, []);

    useEffect(() => {
        const theme = speciesStatistics[selectedSpecies]?.themeColor;
        const image = speciesStatistics[selectedSpecies]?.image;
        if (theme) {
            setBgClass(theme);
            setImageSrc(image);
        } else {
            setBgClass("bg-gray-800");
        }
    }, [selectedSpecies]);

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded">
                <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={`rounded-lg p-6 ${bgClass} transition-all duration-700 ease-in-out shadow-[0_0_20px_2px_rgba(255,255,255,0.2)]`}>
            {/* Tabs */}
            <div className={`bg-transparent rounded-full p-2 flex flex-wrap sm:flex-nowrap sm:overflow-x-auto justify-center items-center gap-2 mb-6 transition-all duration-700 ease-in-out`}>
                {Object.keys(speciesStatistics).map((speciesName) => (
                    <button
                        key={speciesName}
                        onClick={() => setSelectedSpecies(speciesName)}
                        className={`px-4 py-2 rounded-full mx-1 whitespace-nowrap transition-all duration-500 ${
                            selectedSpecies === speciesName
                            ? 'bg-white text-black shadow'
                            : 'bg-gray-500 text-white'
                        }`}
                    >
                        {speciesName}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className={`${bgClass} p-6 rounded-lg transition-all duration-700 ease-in-out`}>
                <h2 className="text-5xl font-bold mb-2">{selectedSpecies}</h2>
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6 mt-6">
                    <img
                        src={imageSrc}
                        alt={selectedSpecies}
                        className="sm:w-[500px] sm:h-[320px] object-cover w-full rounded mb-4"
                        onError={(e) => {
                            console.error('Image failed to load:', imageSrc);
                            e.target.src = 'fallback-image-url.png'; // Add a fallback image URL
                        }}
                    />
                    <p className="text-white flex-1 text-lg">{speciesStatistics[selectedSpecies].description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {speciesStatistics[selectedSpecies].fields.map((field) => (
                        <div key={field.key} className="bg-gray-600 p-4 rounded">
                            <p className="text-sm text-gray-300">{field.label}</p>
                            <p className="text-lg font-semibold">
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
