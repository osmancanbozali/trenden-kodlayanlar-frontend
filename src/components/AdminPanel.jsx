import React, { useEffect, useRef, useState } from 'react';
import FancyParticles from '../components/FancyParticles';
import speciesModel from '../models/species';
import AdminNavbar from './AdminNavbar';


const AdminPanel = () => {
  const canvasRef = useRef(null);
  const [speciesData, setSpeciesData] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const canvasWidth = 600;
  const canvasHeight = 600;
  

  useEffect(() => {
    const fetchSpeciesData = async () => {
      try {
        const response = await fetch('https://trenden-kodlayanlar-backend.onrender.com/api/bio-species/');
        const data = await response.json();
        setSpeciesData(data);
      } catch (error) {
        console.error('Error fetching species data:', error);
      }
    };

    fetchSpeciesData();

    const interval = setInterval(() => {
        fetchSpeciesData();
      }, 8000); // every 15 seconds
    
      return () => clearInterval(interval); // cleanup
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mapImage = new Image();
    mapImage.src = '/src/images/map.jpg'; // Replace with your actual map path

    mapImage.onload = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(mapImage, 0, 0, canvasWidth, canvasHeight);

      speciesData.forEach((species) => {
        const { coordinateX, coordinateY, healthStatus } = species;
        if (healthStatus === 'ölü') return;

        ctx.beginPath();
        ctx.arc(coordinateX * (canvasWidth / 1024), coordinateY * (canvasHeight / 1024), 1.8, 0, 2 * Math.PI);
        ctx.fillStyle = healthStatus === 'kritik' ? 'red' : 'green';
        ctx.fill();
      });
    };
  }, [speciesData]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const clicked = speciesData.find((species) => {
      const dx = species.coordinateX * (canvasWidth / 1024) - clickX;
      const dy = species.coordinateY * (canvasHeight / 1024) - clickY;
      return Math.sqrt(dx * dx + dy * dy) < 6;
    });

    if (clicked) setSelectedSpecies(clicked);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden px-10 pt-24 py-8">
      <FancyParticles />
        <AdminNavbar/>
      <div className="relative z-10 flex gap-6 justify-center items-start">
        {/* Map */}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          className="border rounded-lg shadow-lg"
        />

        {/* Info Card */}
        {selectedSpecies && (
          <div className="bg-black p-6 rounded-lg  w-[400px] max-h-[600px] overflow-y-auto shadow-[0_0_20px_2px_rgba(255,255,255,0.2)]">
            <h2 className="text-2xl font-bold mb-2">{selectedSpecies.speciesType}</h2>
            <p className="mb-1"><strong>Sınıf:</strong> {selectedSpecies.class}</p>
            <p className="mb-1"><strong>Habitat:</strong> {selectedSpecies.habitat}</p>
            <p className="mb-1"><strong>Cinsiyet:</strong> {selectedSpecies.sex}</p>
            <p className="mb-1"><strong>Sağlık:</strong> {selectedSpecies.healthStatus}</p>
            <p className="mb-1"><strong>Yaş:</strong> {selectedSpecies.age}</p>
            <p className="mb-4"><strong>Doğurgan Dişi:</strong> {selectedSpecies.fertileFemale ? 'Evet' : 'Hayır'}</p>

            {speciesModel[selectedSpecies.speciesType]?.fields.map((field) => {
                
                const key = field.key;
                 console.log(key)
                 console.log(selectedSpecies.health)
              //const value = field.key.split('.').reduce((obj, key) => obj?.[key], selectedSpecies);
                let value = selectedSpecies.health[key];
                if(key == "fecalParasites_present")value = (value === true)?("var"):("yok")
                //console.log(value === undefined ? value.map(elm => console.log(elm)) : value)
                

              return (
                <div key={field.key} className="mb-1">
                  <p><strong>{field.label}:</strong> {value !== undefined ? value : 'N/A'}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
