// src/pages/NotificationPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import FancyParticles from '../components/FancyParticles';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import lamejs from 'lamejs';

const NotificationPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = new Int16Array(arrayBuffer);

        const mp3encoder = new lamejs.Mp3Encoder(1, 44100, 128);
        const mp3Data = [];
        const chunkSize = 1152;

        for (let i = 0; i < audioBuffer.length; i += chunkSize) {
          const chunk = audioBuffer.subarray(i, i + chunkSize);
          const mp3buf = mp3encoder.encodeBuffer(chunk);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }

        const finalBuffer = mp3encoder.flush();
        if (finalBuffer.length > 0) mp3Data.push(finalBuffer);

        const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
        const url = URL.createObjectURL(mp3Blob);

        setAudioBlob(mp3Blob);
        setAudioURL(url);
        // TODO: Send mp3Blob to backend/AI
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-800 text-white overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background particles */}
      <FancyParticles />

      <div className="z-10 w-full max-w-lg flex flex-col items-center gap-6">
        {/* Simulated Chat Bubble */}
        <div className="bg-black/40 rounded-xl w-full h-24 flex items-center justify-center shadow-inner">
          {isRecording ? (
            <p className="text-red-400 font-semibold animate-pulse">🎙️ Dinleniyor...</p>
          ) : audioURL ? (
            <audio src={audioURL} controls className="w-full" />
          ) : (
            <p className="text-gray-400">Henüz ses kaydı yapılmadı</p>
          )}
        </div>

        {/* Record Button */}
        <button
          onClick={toggleRecording}
          className={`bg-red-600 hover:bg-red-700 text-white p-6 rounded-full shadow-lg focus:outline-none transition-all ${
            isRecording ? 'animate-pulse' : ''
          }`}
        >
          {isRecording ? <FaStop size={28} /> : <FaMicrophone size={28} />}
        </button>
      </div>
    </div>
  );
};

export default NotificationPage;
