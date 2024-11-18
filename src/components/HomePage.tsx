import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Skull, MessageSquare, Volume2, VolumeX } from 'lucide-react';

const genAI = new GoogleGenerativeAI('AIzaSyAPWCaVZSBP2qb2zECwZzWiRMfAYixrzCc');

const HomePage = () => {
  const [gameText, setGameText] = useState<string>('');
  const [userChoice, setUserChoice] = useState<string>('');
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState({
    health: 100,
    sanity: 100,
    inventory: [] as string[],
  });

  const generateResponse = async (userInput: string = '') => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = userInput ? 
        `Continue the horror story based on the player's choice: "${userInput}". Provide a scary scenario and 3 possible choices for the next action. Format: SCENARIO|||CHOICE1|||CHOICE2|||CHOICE3` :
        'Create a horror game scenario where the player wakes up in an abandoned asylum. Provide a scary opening and 3 possible choices. Format: SCENARIO|||CHOICE1|||CHOICE2|||CHOICE3';

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const [scenario, ...newChoices] = response.split('|||');
      
      setGameText(scenario);
      setChoices(newChoices || []);
      
      // Random health/sanity impact
      if (userInput) {
        const healthImpact = Math.floor(Math.random() * 20);
        const sanityImpact = Math.floor(Math.random() * 15);
        setGameState(prev => ({
          ...prev,
          health: Math.max(0, prev.health - healthImpact),
          sanity: Math.max(0, prev.sanity - sanityImpact),
        }));
      }
    } catch (error) {
      console.error('AI Error:', error);
      setGameText('ERROR: The darkness is too strong... Try again.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Start the game
    generateResponse();
    
    // Add ambient sound
    const audio = new Audio('https://freesound.org/data/previews/463/463583_4056007-lq.mp3');
    audio.loop = true;
    if (!isMuted) audio.play();
    
    return () => audio.pause();
  }, []);

  const handleChoice = (choice: string) => {
    setUserChoice(choice);
    generateResponse(choice);
  };

  if (gameState.health <= 0 || gameState.sanity <= 0) {
    return (
      <div className="min-h-screen bg-black text-red-600 flex items-center justify-center">
        <div className="text-center space-y-8">
          <Skull size={120} className="mx-auto animate-pulse" />
          <h1 className="text-6xl font-horror">YOU DIED</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-red-900/50 hover:bg-red-900 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-8 p-4 bg-gray-900/50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Health:</span>
              <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{ width: `${gameState.health}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Sanity:</span>
              <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${gameState.sanity}%` }}
                />
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>

        {/* Game Content */}
        <div className="space-y-8">
          <div className="bg-gray-900/50 p-6 rounded-lg min-h-[200px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <MessageSquare className="text-red-600 mb-4" />
                <p className="text-lg leading-relaxed">{gameText}</p>
              </div>
            )}
          </div>

          {/* Choices */}
          <div className="grid gap-4">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                disabled={isLoading}
                className="p-4 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg text-left transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;