import React, { useState, useRef, useCallback } from 'react';
import { TranslationSet } from '../types';
import { MicrophoneIcon, CameraIcon, StopIcon, TrashIcon, ChevronLeftIcon, PhoneIcon } from './icons';

export const EmergencyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSet;
}> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Select reason, 2: Add details
  const [message, setMessage] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const emergencyReasons = [
    'panicAttack', 'chestPain', 'breathingTrouble', 'fall', 'accident',
    'allergicReaction', 'medicationIssue', 'elderlyHelp', 'heartAttack',
    'seizure', 'unconscious', 'bleeding', 'overdose', 'injury'
  ];

  const resetState = useCallback(() => {
    setMessage('');
    setAudioBlob(null);
    setPhotoDataUrl(null);
    setIsRecording(false);
    setAlertSent(false);
    setStep(1);
  }, []);

  const handleClose = () => {
    if (isRecording) {
      handleStopRecording();
    }
    resetState();
    onClose();
  };
  
  const handleReasonSelect = (reasonKey: string) => {
    const reasonText = t[reasonKey];
    setMessage(reasonText + '. '); // Pre-fill message
    setStep(2);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const newAudioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(newAudioBlob);
        stream.getTracks().forEach(track => track.stop()); // Release microphone
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      // Stop recording after 15 seconds
      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
            handleStopRecording();
        }
      }, 15000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access was denied. Please allow it in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCallEmergency = () => {
    if (window.confirm(t.callConfirmation)) {
        window.location.href = 'tel:112';
    }
  };
  
  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("--- EMERGENCY ALERT SENT ---");
    console.log("Reason/Message:", message);
    console.log("Audio attached:", !!audioBlob);
    console.log("Photo attached:", !!photoDataUrl);
    console.log("--------------------------");

    setAlertSent(true);
    setTimeout(() => {
      handleClose();
    }, 2500);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
        {!alertSent ? (
          step === 1 ? (
             <>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 text-center mb-4">{t.emergencyReasonTitle}</h2>
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
                    {emergencyReasons.map(reasonKey => (
                        <button
                            key={reasonKey}
                            onClick={() => handleReasonSelect(reasonKey)}
                            className="p-3 text-center text-sm font-semibold rounded-lg transition bg-red-500/10 text-red-700 hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                        >
                            {t[reasonKey]}
                        </button>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                    <button onClick={handleClose} className="w-full text-slate-600 dark:text-slate-300 font-semibold py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition">
                        {t.close}
                    </button>
                </div>
            </>
          ) : ( // Step 2
            <>
                <div className="flex items-center justify-center mb-4 relative">
                    <button onClick={() => setStep(1)} className="absolute left-0 text-slate-500 dark:text-slate-400 p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 text-center">{t.emergencyAlert}</h2>
                </div>
                <form onSubmit={handleSendAlert} className="flex-grow overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div>
                            <p className="text-slate-700 dark:text-slate-200 text-center text-sm">{t.patientStatusUpdate}</p>
                        </div>
                        
                        <div className="animate-fade-in">
                            <textarea
                              className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-lg h-20 focus:ring-2 focus:ring-red-400 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
                              placeholder={t.describeSituation}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{t.addContext}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {!audioBlob && (
                                    <button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording} className={`flex flex-col items-center justify-center p-3 rounded-lg transition text-white ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}`}>
                                        {isRecording ? <StopIcon className="w-6 h-6 mb-1" /> : <MicrophoneIcon className="w-6 h-6 mb-1" />}
                                        <span className="text-sm font-semibold">{isRecording ? t.stopRecording : t.recordAudio}</span>
                                        {isRecording && <div className="text-xs opacity-80 animate-pulse">{t.recording}</div>}
                                    </button>
                                )}
                                {audioBlob && (
                                    <div className="bg-slate-100 dark:bg-gray-700 p-2 rounded-lg flex items-center justify-between">
                                        <audio src={URL.createObjectURL(audioBlob)} controls className="w-3/4 h-8"></audio>
                                        <button type="button" onClick={() => setAudioBlob(null)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                                {!photoDataUrl && (
                                    <button type="button" onClick={() => photoInputRef.current?.click()} className="flex flex-col items-center justify-center p-3 rounded-lg transition bg-teal-500 hover:bg-teal-600 text-white">
                                        <CameraIcon className="w-6 h-6 mb-1" />
                                        <span className="text-sm font-semibold">{t.takePhoto}</span>
                                        <input type="file" accept="image/*" capture hidden ref={photoInputRef} onChange={handlePhotoCapture} />
                                    </button>
                                )}
                                {photoDataUrl && (
                                    <div className="bg-slate-100 dark:bg-gray-700 p-2 rounded-lg flex items-center justify-between">
                                        <img src={photoDataUrl} alt="Captured" className="w-12 h-12 rounded-md object-cover"/>
                                        <button type="button" onClick={() => setPhotoDataUrl(null)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={handleCallEmergency}
                      className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 dark:bg-transparent dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/50 transition"
                    >
                        <PhoneIcon className="w-5 h-5"/>
                        <span>{t.callEmergencyServices}</span>
                    </button>
                    <button type="submit" onClick={handleSendAlert} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">
                        {t.sendStatus}
                    </button>
                </div>
            </>
          )
        ) : (
             <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{t.emergencyAlert}</h2>
                <p className="text-slate-600 dark:text-slate-300 mt-2">{t.alertSent}</p>
            </div>
        )}
      </div>
    </div>
  );
};