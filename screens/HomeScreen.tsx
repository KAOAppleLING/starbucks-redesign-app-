import React, { useState, useRef, useEffect } from 'react';
import type { Screen } from '../types';
import { SunIcon, UserIcon, DevicePhoneMobileIcon, QrCodeIcon, MicrophoneIcon, XMarkIcon, CloudIcon, CoffeeIcon, MapPinIcon, ChevronDownIcon, RainIcon } from '../constants';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

interface HomeScreenProps {
  setActiveScreen: (screen: Screen) => void;
  isWeatherOpen: boolean;
  setIsWeatherOpen: (isOpen: boolean) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen, isWeatherOpen, setIsWeatherOpen }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'scan' | 'my_code'>('scan');
  const [location, setLocation] = useState('New York, USA');
  const [aiTip, setAiTip] = useState<{ text: string; drink: string } | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);
  
  // Voice Assistant State
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  
  // Refs for Audio Handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  const openScanner = () => {
    setScannerMode('scan');
    setIsScannerOpen(true);
  };

  // Mock weather data for demonstration
  const weatherData: Record<string, {
    current: { temp: number; condition: string; icon: any };
    forecast: { day: string; temp: number; icon: any; condition: string }[];
    tip: { text: string; drink: string };
  }> = {
    'New York, USA': {
      current: { temp: 24, condition: 'Sunny', icon: SunIcon },
      forecast: [
        { day: 'Mon', temp: 24, icon: SunIcon, condition: 'Sunny' },
        { day: 'Tue', temp: 22, icon: CloudIcon, condition: 'Partly Cloudy' },
        { day: 'Wed', temp: 19, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Thu', temp: 21, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Fri', temp: 25, icon: SunIcon, condition: 'Sunny' },
        { day: 'Sat', temp: 27, icon: SunIcon, condition: 'Sunny' },
        { day: 'Sun', temp: 23, icon: CloudIcon, condition: 'Partly Cloudy' },
      ],
      tip: { text: "It's warm! Try our Iced Caramel Latte to cool down.", drink: "Iced Caramel Latte" }
    },
    'London, UK': {
      current: { temp: 14, condition: 'Rainy', icon: RainIcon },
      forecast: [
        { day: 'Mon', temp: 14, icon: RainIcon, condition: 'Rainy' },
        { day: 'Tue', temp: 15, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Wed', temp: 13, icon: RainIcon, condition: 'Heavy Rain' },
        { day: 'Thu', temp: 14, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Fri', temp: 16, icon: CloudIcon, condition: 'Partly Cloudy' },
        { day: 'Sat', temp: 18, icon: SunIcon, condition: 'Sunny' },
        { day: 'Sun', temp: 16, icon: CloudIcon, condition: 'Cloudy' },
      ],
      tip: { text: "It's rainy! A warm Flat White is perfect for today.", drink: "Flat White" }
    },
    'Taipei, Taiwan': {
      current: { temp: 30, condition: 'Humid', icon: CloudIcon },
      forecast: [
        { day: 'Mon', temp: 30, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Tue', temp: 32, icon: SunIcon, condition: 'Sunny' },
        { day: 'Wed', temp: 29, icon: RainIcon, condition: 'T-Storms' },
        { day: 'Thu', temp: 28, icon: RainIcon, condition: 'Rain' },
        { day: 'Fri', temp: 31, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Sat', temp: 33, icon: SunIcon, condition: 'Hot' },
        { day: 'Sun', temp: 31, icon: SunIcon, condition: 'Sunny' },
      ],
      tip: { text: "It's hot! Grab a Cold Brew to stay refreshed.", drink: "Cold Brew" }
    },
    'Tokyo, Japan': {
      current: { temp: 22, condition: 'Clear', icon: SunIcon },
      forecast: [
        { day: 'Mon', temp: 22, icon: SunIcon, condition: 'Clear' },
        { day: 'Tue', temp: 23, icon: SunIcon, condition: 'Sunny' },
        { day: 'Wed', temp: 21, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Thu', temp: 20, icon: RainIcon, condition: 'Rain' },
        { day: 'Fri', temp: 22, icon: CloudIcon, condition: 'Cloudy' },
        { day: 'Sat', temp: 24, icon: SunIcon, condition: 'Sunny' },
        { day: 'Sun', temp: 25, icon: SunIcon, condition: 'Sunny' },
      ],
      tip: { text: "Perfect weather! Enjoy a Caffè Latte outside.", drink: "Caffè Latte" }
    }
  };

  const currentWeatherData = weatherData[location] || weatherData['New York, USA'];
  const CurrentIcon = currentWeatherData.current.icon;

  // --- AI Tip Generation ---
  const fetchCoffeeTip = async () => {
    setIsTipLoading(true);
    try {
        const current = weatherData[location].current;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The current weather in ${location} is ${current.temp}°C and ${current.condition}. Suggest a coffee drink from a standard menu (e.g., Latte, Cold Brew, Cappuccino, Flat White, etc.) that fits this weather. Return a JSON object with "drink" (the name of the drink) and "text" (a friendly 1-sentence recommendation including the drink name verbatim).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        drink: { type: Type.STRING },
                        text: { type: Type.STRING },
                    }
                }
            }
        });
        const data = JSON.parse(response.text || '{}');
        if (data.drink && data.text) {
            setAiTip(data);
        } else {
            setAiTip(weatherData[location].tip);
        }
    } catch (e) {
        console.error("AI Tip Error", e);
        setAiTip(weatherData[location].tip);
    } finally {
        setIsTipLoading(false);
    }
  };

  useEffect(() => {
    if (isWeatherOpen) {
        fetchCoffeeTip();
    }
  }, [location, isWeatherOpen]);


  // --- Audio Helper Functions ---
  function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const stopVoiceSession = () => {
    // Close session if exists
    // Note: session object doesn't have a close method in all versions, but we stop sending data
    sessionRef.current = null;

    // Stop input
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    // Stop output
    audioQueueRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    audioQueueRef.current = [];
    
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    setIsVoiceAssistantOpen(false);
    setVoiceStatus('connecting');
  };

  const startVoiceSession = async () => {
    try {
        setIsVoiceAssistantOpen(true);
        setVoiceStatus('connecting');

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        // Setup Audio Contexts
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        audioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;
        nextStartTimeRef.current = outputCtx.currentTime;

        // Get Mic Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const connectPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                },
                systemInstruction: "You are Cafa, a friendly and knowledgeable coffee assistant. You help users navigate the app, recommend drinks based on weather or mood, and explain our sustainability efforts. Keep responses concise and conversational."
            },
            callbacks: {
                onopen: () => {
                    setVoiceStatus('listening');
                    
                    // Setup Input Processing
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    sourceRef.current = source;
                    processorRef.current = processor;

                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        // Send to Gemini
                        connectPromise.then(session => {
                            sessionRef.current = session;
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    
                    if (base64Audio && outputCtx) {
                        setVoiceStatus('speaking');
                        
                        // Ensure nextStartTime is at least current time to avoid playback issues
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            outputCtx,
                            24000,
                            1
                        );

                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        
                        audioQueueRef.current.push(source);
                        
                        source.onended = () => {
                            audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
                            if (audioQueueRef.current.length === 0) {
                                setVoiceStatus('listening');
                            }
                        };
                    }
                    
                    if (msg.serverContent?.interrupted) {
                        audioQueueRef.current.forEach(s => {
                            try { s.stop(); } catch(e) {}
                        });
                        audioQueueRef.current = [];
                        nextStartTimeRef.current = outputCtx.currentTime;
                        setVoiceStatus('listening');
                    }
                },
                onclose: () => {
                    console.log("Voice session closed");
                    stopVoiceSession();
                },
                onerror: (err) => {
                    console.error("Voice session error:", err);
                    setVoiceStatus('error');
                    setTimeout(stopVoiceSession, 2000);
                }
            }
        });

    } catch (error) {
        console.error("Failed to start voice session:", error);
        setVoiceStatus('error');
        setTimeout(stopVoiceSession, 2000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (isVoiceAssistantOpen) {
            stopVoiceSession();
        }
    };
  }, []);


  return (
    <div className="p-4 space-y-8">
      {/* Scanner Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
            <button 
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors z-50"
                aria-label="Close scanner"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
            
            {scannerMode === 'scan' ? (
                <>
                    <div className="relative mb-8 animate-in zoom-in duration-300">
                        <div className="w-64 h-64 border-2 border-white/30 rounded-3xl overflow-hidden relative bg-black">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cafa-accent/5 to-transparent animate-pulse"></div>
                            <div className="absolute left-0 w-full h-1 bg-cafa-accent/90 shadow-[0_0_20px_rgba(201,168,124,0.8)] animate-scan z-10"></div>
                        </div>
                        
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-cafa-accent rounded-tl-xl"></div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-cafa-accent rounded-tr-xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-cafa-accent rounded-bl-xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-cafa-accent rounded-br-xl"></div>
                    </div>
                    
                    <div className="text-center space-y-3 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-white font-bold text-xl tracking-tight">Scan QR Code</p>
                        <p className="text-white/60 text-sm leading-relaxed">Align the QR code within the frame to scan and pay instantly.</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="relative mb-8 bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] animate-in zoom-in duration-300">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=CafaUserAlexChen" alt="My QR Code" className="w-60 h-60 mix-blend-multiply opacity-90" />
                        <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-black/10"></div>
                    </div>
                    
                    <div className="text-center space-y-3 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-white font-bold text-xl tracking-tight">My Member Code</p>
                        <p className="text-white/60 text-sm leading-relaxed">Show this code to earn rewards and pay.</p>
                    </div>
                </>
            )}

            <div className="absolute bottom-12 flex gap-4">
                <button 
                    onClick={() => setScannerMode('my_code')}
                    className={`${scannerMode === 'my_code' ? 'bg-cafa-accent text-white shadow-[0_0_20px_rgba(201,168,124,0.4)]' : 'bg-white/10 text-white/80 hover:bg-white/20'} px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md`}
                >
                    My Code
                </button>
                <button 
                    onClick={() => setScannerMode('scan')}
                    className={`${scannerMode === 'scan' ? 'bg-cafa-accent text-white shadow-[0_0_20px_rgba(201,168,124,0.4)]' : 'bg-white/10 text-white/80 hover:bg-white/20'} px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md`}
                >
                    Scan
                </button>
            </div>
        </div>
      )}

      {/* Voice Assistant Overlay */}
      {isVoiceAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-cafa-primary flex flex-col items-center justify-center animate-in fade-in duration-300">
            <button 
                onClick={stopVoiceSession}
                className="absolute top-6 right-6 text-white/80 p-3 rounded-full hover:bg-white/10 transition-colors"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-8 space-y-12">
                <div className="text-center space-y-2 animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-bold text-white">Cafa Assistant</h2>
                    <p className="text-cafa-secondary/80">
                        {voiceStatus === 'connecting' && 'Connecting...'}
                        {voiceStatus === 'listening' && 'Listening...'}
                        {voiceStatus === 'speaking' && 'Speaking...'}
                        {voiceStatus === 'error' && 'Connection Failed'}
                    </p>
                </div>

                <div className="relative flex items-center justify-center">
                     {/* Visualizer Rings */}
                     {voiceStatus === 'listening' && (
                        <>
                            <div className="absolute w-64 h-64 bg-white/5 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute w-48 h-48 bg-white/10 rounded-full animate-pulse"></div>
                        </>
                     )}
                     {voiceStatus === 'speaking' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-40 h-40 border-4 border-cafa-accent/30 rounded-full animate-spin [animation-duration:3s]"></div>
                             <div className="absolute w-56 h-56 border-2 border-cafa-accent/10 rounded-full animate-spin [animation-duration:5s] direction-reverse"></div>
                        </div>
                     )}
                     
                     <button 
                        onClick={stopVoiceSession}
                        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 ${voiceStatus === 'speaking' ? 'scale-110 bg-cafa-accent' : 'bg-white text-cafa-primary'}`}
                     >
                        <MicrophoneIcon className={`w-10 h-10 ${voiceStatus === 'speaking' ? 'text-white' : 'text-cafa-primary'}`} />
                     </button>
                </div>
                
                <p className="text-white/60 text-sm text-center max-w-xs animate-in fade-in duration-700 delay-300">
                    Try saying "Suggest a coffee for a rainy day" or "What is the health index of a Latte?"
                </p>
            </div>
        </div>
      )}
      
      {/* Weather Overlay */}
      {isWeatherOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="bg-cafa-primary p-6 text-white relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-10 -left-10 w-24 h-24 bg-cafa-accent/20 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold">{currentWeatherData.current.temp}°C</h2>
                            <p className="font-medium opacity-90">{currentWeatherData.current.condition}</p>
                            <p className="text-sm opacity-75 mt-1 mb-3">Mon, 12 Aug</p>
                            
                            {/* Location Selector */}
                            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 w-fit transition-colors hover:bg-white/30 cursor-pointer group">
                                <MapPinIcon className="w-3.5 h-3.5 text-cafa-accent" />
                                <select 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-transparent text-xs text-white font-medium focus:outline-none appearance-none cursor-pointer pr-1"
                                >
                                    <option value="New York, USA" className="text-cafa-text-primary">New York, USA</option>
                                    <option value="London, UK" className="text-cafa-text-primary">London, UK</option>
                                    <option value="Taipei, Taiwan" className="text-cafa-text-primary">Taipei, Taiwan</option>
                                    <option value="Tokyo, Japan" className="text-cafa-text-primary">Tokyo, Japan</option>
                                </select>
                                <ChevronDownIcon className="w-3 h-3 text-white/70 group-hover:text-white" />
                            </div>
                        </div>
                        <CurrentIcon className="w-16 h-16 text-cafa-accent" />
                    </div>
                    <button 
                        onClick={() => setIsWeatherOpen(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors z-20 bg-transparent"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <h3 className="font-bold text-cafa-text-primary mb-4">7-Day Forecast</h3>
                    <div className="space-y-4">
                        {currentWeatherData.forecast.map((day, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="w-10 font-medium text-cafa-text-secondary">{day.day}</span>
                                <div className="flex-1 flex items-center justify-center gap-2">
                                    <day.icon className={`w-5 h-5 ${day.condition.includes('Sunny') || day.condition.includes('Hot') || day.condition.includes('Clear') ? 'text-cafa-accent' : 'text-gray-400'}`} />
                                    <span className="text-sm text-cafa-text-secondary w-24">{day.condition}</span>
                                </div>
                                <span className="font-bold text-cafa-text-primary w-10 text-right">{day.temp}°</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 bg-orange-50 p-4 rounded-xl flex items-start gap-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                            <CoffeeIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-orange-800 uppercase tracking-wide">Coffee Tip</p>
                            {isTipLoading ? (
                                <div className="animate-pulse mt-1 space-y-1">
                                    <div className="h-3 bg-orange-200/50 rounded w-3/4"></div>
                                    <div className="h-3 bg-orange-200/50 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <p className="text-sm text-orange-900 mt-0.5">
                                    {aiTip ? (
                                        (() => {
                                            const parts = aiTip.text.split(aiTip.drink);
                                            return parts.map((part, i) => (
                                                <React.Fragment key={i}>
                                                    {part}
                                                    {i < parts.length - 1 && <strong>{aiTip.drink}</strong>}
                                                </React.Fragment>
                                            ));
                                        })()
                                    ) : (
                                        // Fallback if AI hasn't loaded or failed but we have static data
                                        <>
                                            {currentWeatherData.tip.text.replace(currentWeatherData.tip.drink, '')}
                                            <strong>{currentWeatherData.tip.drink}</strong>
                                            {currentWeatherData.tip.text.split(currentWeatherData.tip.drink)[1] || ''}
                                        </>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-lg text-cafa-text-primary">Good morning, Alex!</p>
            <p className="text-sm text-cafa-text-secondary">Stay tuned to the weather! Based on today's temperature, we recommend the perfect drink.</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-cafa-accent">
            <button onClick={() => setIsWeatherOpen(true)} className="hover:bg-cafa-accent/10 p-2 rounded-full transition-colors">
                <SunIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Main Card */}
      <div className="bg-starbucks-green rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-4">
            <img src="https://picsum.photos/id/225/200/200" alt="Latte Art" className="w-24 h-24 rounded-xl object-cover" />
            <div>
                <h2 className="text-xl font-bold text-white">Start your order</h2>
                <p className="text-white/90 mt-1">Get your coffee faster</p>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
            <ActionButton icon={DevicePhoneMobileIcon} label="Mobile Order" onDark />
            <ActionButton 
                icon={QrCodeIcon} 
                label="Scan & Pay" 
                onDark 
                onClick={openScanner}
            />
            <ActionButton 
                icon={MicrophoneIcon} 
                label="AI Voice" 
                isAccent 
                onDark
                onClick={startVoiceSession}
            />
        </div>
      </div>
      
      {/* Just for You */}
      <section>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow mr-4">
            <h3 className="text-xl font-bold text-cafa-text-primary">Just for You</h3>
            <p className="text-sm text-cafa-text-secondary mt-1">Customize your drink! Tap to chat with our AI and get a beverage recommendation tailored.</p>
          </div>
          <button 
            onClick={startVoiceSession}
            className="text-xs font-semibold bg-starbucks-green text-white px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
            AI Assistant
          </button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <RecommendationCard
            image="https://picsum.photos/id/234/200/200"
            title="Iced Caramel Latte"
            description="Cool, sweet & refreshing"
            onAddToOrder={() => setActiveScreen('Order')}
          />
          <RecommendationCard
            image="https://picsum.photos/id/312/200/200"
            title="Butter Croissant"
            description="Freshly baked"
            onAddToOrder={() => setActiveScreen('Order')}
          />
           <RecommendationCard
            image="https://picsum.photos/id/367/200/200"
            title="Cold Brew"
            description="Smooth & strong"
            onAddToOrder={() => setActiveScreen('Order')}
          />
        </div>
      </section>

      {/* Sustainability */}
      <section>
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
            <img src="https://picsum.photos/id/1060/400/300" alt="Person holding eco-friendly cup" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-cafa-primary/60"></div>
            <div className="absolute bottom-0 left-0 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-wider text-cafa-eco bg-white/90 px-2 py-1 rounded w-fit mb-2">Sustainability</p>
                <h3 className="text-xl font-bold">Meet Our Eco-Friendly Cups</h3>
                <p className="text-sm mt-1 mb-3">Sip responsibly with our new compostable cups. Good for you, better for the planet.</p>
                <button 
                  onClick={() => setActiveScreen('Stores')}
                  className="bg-cafa-eco text-white font-bold py-2 px-4 rounded-full text-sm">Learn More</button>
            </div>
        </div>
      </section>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.FC<{className?: string}>, label: string, isAccent?: boolean, onDark?: boolean, onClick?: () => void }> = ({ icon: Icon, label, isAccent, onDark, onClick }) => {
    const baseClasses = "flex flex-col items-center justify-center p-3 rounded-xl space-y-1.5 h-24 text-center transition-colors w-full";
    
    let colorClasses: string;
    if (onDark) {
        colorClasses = isAccent 
            ? "bg-white/25 hover:bg-white/35 text-white" 
            : "bg-white/10 hover:bg-white/20 text-white";
    } else {
        colorClasses = isAccent 
            ? "bg-cafa-accent/20 text-cafa-accent" 
            : "bg-gray-100 text-cafa-text-primary";
    }
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${colorClasses}`}>
            <Icon className="w-7 h-7" />
            <span className="text-xs font-semibold">{label}</span>
        </button>
    );
};

const RecommendationCard: React.FC<{ image: string; title: string; description: string; onAddToOrder: () => void; }> = ({ image, title, description, onAddToOrder }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0 w-40 flex flex-col">
    <img src={image} alt={title} className="w-full h-24 object-cover" />
    <div className="p-3 flex flex-col flex-grow">
      <div className="flex-grow">
        <h4 className="font-bold text-sm truncate">{title}</h4>
        <p className="text-cafa-text-secondary text-xs mt-0.5">{description}</p>
      </div>
      <button
        onClick={onAddToOrder}
        className="w-full bg-cafa-primary text-white font-bold py-2 px-3 rounded-lg text-xs mt-3">
        Add to Order
      </button>
    </div>
  </div>
);


export default HomeScreen;