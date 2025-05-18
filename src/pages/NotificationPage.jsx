// src/pages/NotificationPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import FancyParticles from '../components/FancyParticles';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationPage = () => {
  const navigate = useNavigate();
  // --- State Variables ---
  const [sessionId, setSessionId] = useState(null);
  const [apiAudioToPlayURL, setApiAudioToPlayURL] = useState(null);
  const [userRecordedAudioURL, setUserRecordedAudioURL] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialApiCallLoading, setIsInitialApiCallLoading] = useState(true);
  const [isApiAudioPlaying, setIsApiAudioPlaying] = useState(false);
  const [isSendingUserAudio, setIsSendingUserAudio] = useState(false);
  const [shouldProceedToConfirmation, setShouldProceedToConfirmation] = useState(false);
  const [isFinalConfirmAudioPlaying, setIsFinalConfirmAudioPlaying] = useState(false);
  
  const [statusMessage, setStatusMessage] = useState('Acil durum oturumu başlatılıyor...');

  // --- Refs ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const apiAudioElementRef = useRef(null);
  const userAudioElementRef = useRef(null);

  // --- Helper: Base64 to Blob URL ---
  const base64ToBlobURL = (base64, type = 'audio/mpeg') => {
    if (!base64) return null;
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error converting base64 to Blob URL:", error);
      return null;
    }
  };

  // --- Helper: PCM Int16 to WAV Blob ---
  const pcmToWavBlob = (pcmData, sampleRate, numChannels = 1, bitsPerSample = 16) => {
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length * (bitsPerSample / 8); // pcmData is Int16Array, so each sample is 2 bytes
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // DATA sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data (Int16)
    let offset = 44;
    for (let i = 0; i < pcmData.length; i++, offset += 2) {
      view.setInt16(offset, pcmData[i], true);
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  // --- Initial API Call (useEffect on mount) ---
  useEffect(() => {
    const startEmergencySession = async () => {
      setIsInitialApiCallLoading(true);
      setStatusMessage('Acil durum oturumu başlatılıyor...');
      try {
        const userX = Math.floor(Math.random() * (1014 - 10 + 1) + 10);
        const userY = Math.floor(Math.random() * (1014 - 10 + 1) + 10);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userX, userY }),
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }
        const data = await response.json();
        setSessionId(data.sessionId);

        if (data.audioResponse) {
          const newApiUrl = base64ToBlobURL(data.audioResponse, 'audio/mpeg');
          if (newApiUrl) {
            setApiAudioToPlayURL(newApiUrl);
          } else {
             setStatusMessage('Konuşmak için mikrofona basın.');
          }
        } else {
          setStatusMessage('Konuşmak için mikrofona basın.');
        }
        setShouldProceedToConfirmation(data.proceedToConfirmation === true);

      } catch (error) {
        console.error("Failed to start emergency session:", error);
        setStatusMessage('Oturum başlatılamadı. Lütfen sayfayı yenileyin.');
      } finally {
        setIsInitialApiCallLoading(false);
      }
    };
    startEmergencySession();

    return () => {
      if (apiAudioElementRef.current && apiAudioElementRef.current.src) {
         URL.revokeObjectURL(apiAudioElementRef.current.src);
      }
      if (userAudioElementRef.current && userAudioElementRef.current.src) {
        URL.revokeObjectURL(userAudioElementRef.current.src);
      }
    };
  }, []);

  // --- API Audio Element Event Handlers ---
  const handleApiAudioPlay = useCallback(() => {
    setIsApiAudioPlaying(true);
    setStatusMessage('AI yanıt veriyor...');
  }, []);

  const handleApiAudioEnded = useCallback(() => {
    if (isFinalConfirmAudioPlaying) {
      navigate('/');
      return;
    }

    setIsApiAudioPlaying(false);
    if (apiAudioElementRef.current && apiAudioElementRef.current.src) {
        URL.revokeObjectURL(apiAudioElementRef.current.src);
    }
    setApiAudioToPlayURL(null);
    setStatusMessage('Konuşmak için mikrofona basın.');
  }, [isFinalConfirmAudioPlaying, navigate]);
  
  const handleApiAudioError = useCallback(() => {
    console.error("Error playing API audio.");
    setIsApiAudioPlaying(false);
    if (isFinalConfirmAudioPlaying) {
        setIsFinalConfirmAudioPlaying(false); 
    }
    if (apiAudioElementRef.current && apiAudioElementRef.current.src) {
        URL.revokeObjectURL(apiAudioElementRef.current.src);
    }
    setApiAudioToPlayURL(null);
    setStatusMessage('AI sesi oynatılamadı. Konuşmak için mikrofona basın.');
  }, [isFinalConfirmAudioPlaying]);

  const handleUserAudioPlay = useCallback(() => {
    /* Optional: UI updates */
  }, []);

  const handleUserAudioEnded = useCallback(() => {
    if (!isSendingUserAudio && !isApiAudioPlaying) {
        setStatusMessage("Konuşmak için mikrofona basın.");
    }
  }, [isSendingUserAudio, isApiAudioPlaying]);

  const handleRecordingStop = useCallback(async () => {
    if (!audioChunksRef.current.length) {
      console.warn("No audio chunks recorded.");
      setIsSendingUserAudio(false);
      setStatusMessage('Kayıt boş, lütfen tekrar deneyin.');
      return;
    }

    const audioBlobWebM = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    const localUserAudioUrl = URL.createObjectURL(audioBlobWebM);
    if (userAudioElementRef.current && userAudioElementRef.current.src) {
        URL.revokeObjectURL(userAudioElementRef.current.src);
    }
    setUserRecordedAudioURL(localUserAudioUrl);
    setStatusMessage('Kaydınız işleniyor...');

    try {
      const webmArrayBuffer = await audioBlobWebM.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const decodedAudioBuffer = await new Promise((resolve, reject) => {
        audioContext.decodeAudioData(webmArrayBuffer, resolve, reject);
      });

      const pcmFloat32Data = decodedAudioBuffer.getChannelData(0);
      const pcmInt16Data = new Int16Array(pcmFloat32Data.length);
      for (let i = 0; i < pcmFloat32Data.length; i++) {
        let s = Math.max(-1, Math.min(1, pcmFloat32Data[i]));
        pcmInt16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // --- Encode PCM to WAV ---
      const wavBlob = pcmToWavBlob(pcmInt16Data, decodedAudioBuffer.sampleRate);
      // --- END LAMEJS REPLACEMENT ---

      if (!sessionId) {
        console.error("Session ID is missing, cannot send audio.");
        setStatusMessage('Oturum kimliği yok, mesaj gönderilemiyor.');
        setIsSendingUserAudio(false);
        return;
      }

      setStatusMessage('Kaydınız gönderiliyor...');
      let targetEndpoint = `${import.meta.env.VITE_API_URL}/api/emergency/${sessionId}/message`;
      let wasConfirmCall = false;
      if (shouldProceedToConfirmation) {
        targetEndpoint = `${import.meta.env.VITE_API_URL}/api/emergency/${sessionId}/confirm`;
        wasConfirmCall = true;
      }

      const reader = new FileReader();
      reader.readAsDataURL(wavBlob); // Read WAV blob as base64
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        try {
          const response = await fetch(targetEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioInputBase64: base64Audio }),
          });

          if (!response.ok) throw new Error(`API call to ${targetEndpoint} failed: ${response.status}`);
          
          const responseData = await response.json();
          console.log('Audio sent successfully, response:', responseData);

          // Update confirmation state and navigate if applicable
          if (wasConfirmCall) {
            const nextProceedToConfirmation = responseData.proceedToConfirmation === true;
            setShouldProceedToConfirmation(nextProceedToConfirmation);

            if (!nextProceedToConfirmation) { // Confirmation flow ends
              if (responseData.audioResponse) {
                const newApiUrl = base64ToBlobURL(responseData.audioResponse, 'audio/mpeg');
                if (newApiUrl) {
                  if (apiAudioElementRef.current && apiAudioElementRef.current.src) {
                    URL.revokeObjectURL(apiAudioElementRef.current.src);
                  }
                  setIsFinalConfirmAudioPlaying(true); // Set flag: an audio will play, then navigate
                  setApiAudioToPlayURL(newApiUrl);
                } else {
                  // Audio processing failed for the final audio.
                  setStatusMessage('Son AI yanıtı işlenemedi, yönlendiriliyor...');
                  navigate('/'); // Navigate directly
                  return; 
                }
              } else {
                // No final audio response, confirmation ends.
                setStatusMessage('Onay tamamlandı, yönlendiriliyor...');
                navigate('/'); // Navigate directly
                return;
              }
            }
            // If nextProceedToConfirmation is true, the confirmation loop continues, no navigation yet.
          } else {
            // This was a /message call
            setShouldProceedToConfirmation(responseData.proceedToConfirmation === true);
          }

          // Play general audio response if any, and it wasn't handled by final confirmation logic above
          // This part is for /message responses or /confirm responses that continue the loop
          if (responseData.audioResponse && !isFinalConfirmAudioPlaying) {
            const newApiUrl = base64ToBlobURL(responseData.audioResponse, 'audio/mpeg');
            if (newApiUrl) {
              if (apiAudioElementRef.current && apiAudioElementRef.current.src) URL.revokeObjectURL(apiAudioElementRef.current.src);
              setApiAudioToPlayURL(newApiUrl);
            } else {
                // If it was a /message call and audio processing failed, ensure user can speak again
                if (!wasConfirmCall) setStatusMessage('AI yanıtı işlenemedi. Konuşmak için hazır.');
            }
          } else if (!responseData.audioResponse && !isFinalConfirmAudioPlaying) {
            // If no audio response from a /message call, or a /confirm that continues
            if (!wasConfirmCall || (wasConfirmCall && responseData.proceedToConfirmation === true)){
                 setStatusMessage('Yanıt alındı. Konuşmak için hazır.');
            }
          }

        } catch (err) {
          console.error(`Failed to send audio or process response from ${targetEndpoint}:`, err);
          setStatusMessage('Mesaj gönderilemedi veya yanıt işlenemedi.');
        } finally {
          setIsSendingUserAudio(false);
        }
      };
      reader.onerror = () => {
        console.error("FileReader failed to read WAV blob.");
        setStatusMessage('Kayıt gönderim için hazırlanamadı.');
        setIsSendingUserAudio(false);
      };

    } catch (decodeOrWavEncodeError) {
      console.error("Error during audio decoding or WAV encoding:", decodeOrWavEncodeError);
      setStatusMessage('Ses işlenirken hata oluştu.');
      setIsSendingUserAudio(false);
    }
  }, [sessionId, shouldProceedToConfirmation, userRecordedAudioURL, navigate, isFinalConfirmAudioPlaying]);

  const toggleRecording = useCallback(async () => {
    if (isInitialApiCallLoading || (isApiAudioPlaying && !isRecording) || (isSendingUserAudio && !isRecording) ) {
       return;
    }

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = handleRecordingStop;

        mediaRecorderRef.current.start();
        setIsRecording(true);
        if (userAudioElementRef.current && userAudioElementRef.current.src) {
            URL.revokeObjectURL(userAudioElementRef.current.src);
        }
        setUserRecordedAudioURL(null);
        setStatusMessage('Dinleniyor...');
      } catch (err) {
        console.error("Failed to start recording:", err);
        setStatusMessage('Mikrofon başlatılamadı. İzinleri kontrol edin.');
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setStatusMessage("Durduruluyor, ses işleniyor...");
      setIsSendingUserAudio(true);
    }
  }, [isRecording, isInitialApiCallLoading, isApiAudioPlaying, isSendingUserAudio, handleRecordingStop, userRecordedAudioURL]);

  const buttonShouldBeDisabled = (isInitialApiCallLoading || isApiAudioPlaying || isSendingUserAudio) && !isRecording;
  const pulseAnimation = isRecording || isInitialApiCallLoading || isApiAudioPlaying || isSendingUserAudio;

  return (
    <div className="relative min-h-screen bg-gray-800 text-white overflow-hidden flex flex-col items-center justify-center p-6">
      <FancyParticles />
      <div className="z-10 w-full max-w-lg flex flex-col items-center gap-6">
        <div className="bg-black/40 rounded-xl w-full min-h-[6rem] h-auto flex flex-col items-center justify-center shadow-inner p-4 text-center">
          <p className={`font-semibold ${pulseAnimation ? 'animate-pulse' : ''}`}>
            {statusMessage}
          </p>
        </div>
        <button
          onClick={toggleRecording}
          disabled={buttonShouldBeDisabled}
          className={`p-6 rounded-full shadow-lg focus:outline-none transition-all ${
            pulseAnimation ? 'animate-pulse' : ''
          } ${isRecording ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700'} ${
            buttonShouldBeDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isRecording ? <FaStop size={28} /> : <FaMicrophone size={28} />}
        </button>
        {apiAudioToPlayURL && (
          <audio
            ref={apiAudioElementRef}
            src={apiAudioToPlayURL}
            autoPlay
            onPlay={handleApiAudioPlay}
            onEnded={handleApiAudioEnded}
            onError={handleApiAudioError}
            hidden
          />
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
