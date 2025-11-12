
import React from 'react';
import type { Screen, NavItem } from '../types';
import { HomeIcon, CoffeeIcon, StarIcon, StoreIcon, UserIcon } from '../constants';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const navItems: NavItem[] = [
  { name: 'Home', icon: HomeIcon },
  { name: 'Order', icon: CoffeeIcon },
  { name: 'Rewards', icon: StarIcon },
  { name: 'Stores', icon: StoreIcon },
  { name: 'Account', icon: UserIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-cafa-secondary/80 backdrop-blur-sm border-t border-gray-200">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = activeScreen === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveScreen(item.name)}
              className="flex flex-col items-center justify-center gap-1 text-cafa-text-secondary w-16"
            >
              <item.icon className={`h-6 w-6 transition-colors ${isActive ? 'text-cafa-primary' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium transition-colors ${isActive ? 'text-cafa-primary' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
