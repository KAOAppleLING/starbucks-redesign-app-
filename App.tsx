
import React, { useState } from 'react';
import type { Screen, CoffeeOption, CartItem } from './types';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import RewardsScreen from './screens/RewardsScreen';
import OrderScreen from './screens/OrderScreen';
import StoresScreen from './screens/StoresScreen';
import AccountScreen from './screens/AccountScreen';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('Home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(['Eco-Warrior']);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  const addToCart = (coffee: CoffeeOption) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === coffee.id);
        if (existingItem) {
            return prevCart.map(item => 
                item.id === coffee.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            return [...prevCart, { ...coffee, quantity: 1 }];
        }
    });
    setActiveScreen('Order');
  };

  const updateCartItemQuantity = (coffeeId: number, quantity: number) => {
    setCart(prevCart => {
        if (quantity <= 0) {
            return prevCart.filter(item => item.id !== coffeeId);
        }
        return prevCart.map(item => 
            item.id === coffeeId ? { ...item, quantity } : item
        );
    });
  };

  const toggleAchievement = (name: string) => {
    if (unlockedAchievements.includes(name)) {
        setUnlockedAchievements(prev => prev.filter(n => n !== name));
    } else {
        setUnlockedAchievements(prev => [...prev, name]);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen 
            setActiveScreen={setActiveScreen} 
            isWeatherOpen={isWeatherOpen}
            setIsWeatherOpen={setIsWeatherOpen}
        />;
      case 'Rewards':
        return <RewardsScreen 
            setActiveScreen={setActiveScreen} 
            unlockedAchievements={unlockedAchievements}
            toggleAchievement={toggleAchievement}
            openWeather={() => setIsWeatherOpen(true)}
        />;
      case 'Order':
        return <OrderScreen cart={cart} updateCartItemQuantity={updateCartItemQuantity} setActiveScreen={setActiveScreen} />;
      case 'Stores':
        return <StoresScreen addToCart={addToCart} />;
      case 'Account':
        return <AccountScreen setActiveScreen={setActiveScreen} />;
      default:
        return <HomeScreen 
            setActiveScreen={setActiveScreen}
            isWeatherOpen={isWeatherOpen}
            setIsWeatherOpen={setIsWeatherOpen}
        />;
    }
  };

  return (
    <div className="bg-cafa-secondary min-h-screen font-sans text-cafa-text-primary">
      <div className="max-w-md mx-auto">
        <main className="pb-24">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
};

export default App;
