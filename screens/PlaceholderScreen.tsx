
import React from 'react';
import { CoffeeIcon } from '../constants';

interface PlaceholderScreenProps {
  title: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] text-center p-8">
      <div className="w-24 h-24 bg-cafa-primary/10 rounded-full flex items-center justify-center mb-6">
        <CoffeeIcon className="w-12 h-12 text-cafa-primary" />
      </div>
      <h1 className="text-3xl font-bold text-cafa-primary mb-2">{title}</h1>
      <p className="text-cafa-text-secondary max-w-xs">
        This screen is currently under construction. Check back soon for exciting new features!
      </p>
    </div>
  );
};

export default PlaceholderScreen;
