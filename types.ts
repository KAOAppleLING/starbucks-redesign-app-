import React from 'react';

export type Screen = 'Home' | 'Order' | 'Rewards' | 'Stores' | 'Account';

export interface NavItem {
  name: Screen;
  icon: React.FC<{ className?: string }>;
}

export interface Achievement {
  name: string;
  icon: React.FC<{ className?: string }>;
}

export interface CoffeeOption {
    id: number;
    name: string;
    description: string;
    healthIndex: number;
    image: string;
    price: number;
}

export interface CartItem extends CoffeeOption {
    quantity: number;
}
