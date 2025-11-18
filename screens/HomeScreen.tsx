
import React from 'react';
import type { Screen } from '../types';
import { SunIcon, UserIcon, DevicePhoneMobileIcon, QrCodeIcon, MicrophoneIcon } from '../constants';

interface HomeScreenProps {
  setActiveScreen: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen }) => {
  return (
    <div className="p-4 space-y-8">
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
            <SunIcon className="w-5 h-5" />
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
            <ActionButton icon={QrCodeIcon} label="Scan & Pay" onDark />
            <ActionButton icon={MicrophoneIcon} label="AI Voice" isAccent onDark/>
        </div>
      </div>
      
      {/* Just for You */}
      <section>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow mr-4">
            <h3 className="text-xl font-bold text-cafa-text-primary">Just for You</h3>
            <p className="text-sm text-cafa-text-secondary mt-1">Customize your drink! Tap to chat with our AI and get a beverage recommendation tailored.</p>
          </div>
          <button className="text-xs font-semibold bg-starbucks-green text-white px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">AI Assistant</button>
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

const ActionButton: React.FC<{ icon: React.FC<{className?: string}>, label: string, isAccent?: boolean, onDark?: boolean }> = ({ icon: Icon, label, isAccent, onDark }) => {
    const baseClasses = "flex flex-col items-center justify-center p-3 rounded-xl space-y-1.5 h-24 text-center transition-colors";
    
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
        <button className={`${baseClasses} ${colorClasses}`}>
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