import React, { useState } from 'react';
// Fix: Import `StarIcon` to resolve 'cannot find name' error on line 50.
import { BellIcon, CheckBadgeIcon, SunIcon, TrophyIcon, SparklesIcon, UserGroupIcon, StarIcon, XMarkIcon } from '../constants';
import type { Achievement } from '../types';
import EcoImpactChart from '../components/EcoImpactChart';

// Fix: Define `CoffeeIcon` before it is used in the `achievements` array to prevent a 'used before declaration' error on line 8.
const CoffeeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1 1 0 0 1 1 1v1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4v2a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1Zm-1 10a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2H9Z" />
      <path fillRule="evenodd" d="M3 5a3 3 0 0 1 3-3h1.5a.5.5 0 0 1 0 1H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1.5a.5.5 0 0 1 1 0V15a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5Z" clipRule="evenodd" />
    </svg>
  );

const achievements: Achievement[] = [
    { name: 'Tried 5 Blends', icon: CoffeeIcon },
    { name: 'Eco-Warrior', icon: CheckBadgeIcon },
    { name: 'Morning Regular', icon: SunIcon },
    { name: 'Explorer', icon: TrophyIcon },
    { name: 'Sweet Tooth', icon: SparklesIcon },
    { name: 'Friend Group', icon: UserGroupIcon },
];

const notifications = [
    {
        icon: CheckBadgeIcon,
        title: 'Your Weekly Eco Impact',
        message: 'You saved 2.7 kg of CO₂ this week by making sustainable choices. Keep it up!',
        time: '2h ago',
        color: 'text-cafa-eco'
    },
    {
        icon: StarIcon,
        title: 'New Reward Unlocked!',
        message: 'You\'ve earned enough points for a free pastry. Redeem it on your next order.',
        time: '1d ago',
        color: 'text-cafa-accent'
    },
    {
        icon: UserGroupIcon,
        title: 'Community Challenge Update',
        message: 'Your team is in the top 10% for the "Cup Saver" challenge. Only 3 days left!',
        time: '3d ago',
        color: 'text-cafa-community'
    }
];

const ecoImpactData = [
    { name: 'M', co2: 300, day: 'Monday' },
    { name: 'T', co2: 400, day: 'Tuesday' },
    { name: 'W', co2: 300, day: 'Wednesday' },
    { name: 'T', co2: 450, day: 'Thursday' },
    { name: 'F', co2: 350, day: 'Friday' },
    { name: 'S', co2: 400, day: 'Saturday' },
    { name: 'S', co2: 500, day: 'Sunday' },
];

const RewardsScreen: React.FC = () => {
    const userPoints = 350;
    const pointsForNextCoffee = 500;
    const progress = (userPoints / pointsForNextCoffee) * 100;
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
    const [activeEcoImpactIndex, setActiveEcoImpactIndex] = useState<number | null>(ecoImpactData.length - 1);

    const totalCo2SavedKg = ecoImpactData.reduce((acc, curr) => acc + curr.co2, 0) / 1000;

    const handleBarClick = (_data: any, index: number) => {
        setActiveEcoImpactIndex(prevIndex => prevIndex === index ? null : index);
    };

    const activeData = activeEcoImpactIndex !== null ? ecoImpactData[activeEcoImpactIndex] : null;

    const ecoImpactSubtitle = activeData 
        ? `On ${activeData.day}, you saved ${(activeData.co2 / 1000).toFixed(1)} kg of CO₂.`
        : 'Your sustainable choices are making a difference!';


  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cafa-text-primary">My Rewards</h1>
        <button 
          onClick={() => setIsNotificationsVisible(true)}
          className="relative text-cafa-text-secondary"
          aria-label="Open notifications"
        >
          <BellIcon className="w-7 h-7" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-cafa-secondary" />
        </button>
      </header>
      
      {/* Profile & Points */}
      <section className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <img src="https://picsum.photos/id/1005/200/200" alt="Alex Chen" className="w-16 h-16 rounded-full" />
          <div>
            <h2 className="text-xl font-bold">Alex Chen</h2>
            <p className="text-cafa-accent font-semibold">Gold Member</p>
          </div>
        </div>
        <div>
            <div className="flex justify-between items-end mb-1">
                <p className="font-bold text-cafa-text-primary">Your Points: <span className="text-2xl">{userPoints}</span></p>
                <StarIcon className="w-8 h-8 text-cafa-accent" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-cafa-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-cafa-text-secondary mt-2 text-center">{500 - userPoints} points to your next free coffee</p>
        </div>
      </section>

      {/* Eco Impact */}
      <section className="bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg">Your Eco Impact</h3>
                <p className="text-xs text-cafa-text-secondary">{ecoImpactSubtitle}</p>
                <p className="text-4xl font-bold text-cafa-eco mt-2">{totalCo2SavedKg.toFixed(1)} <span className="text-lg font-semibold">kg CO₂ saved</span></p>
            </div>
            <CheckBadgeIcon className="w-8 h-8 text-cafa-eco" />
        </div>
        <div className="h-32 mt-4">
            <EcoImpactChart 
                data={ecoImpactData}
                activeIndex={activeEcoImpactIndex}
                onBarClick={handleBarClick}
            />
        </div>
      </section>

      {/* Eco Missions */}
      <section>
        <h3 className="text-xl font-bold mb-3">Eco Missions</h3>
        <div className="space-y-3">
            <MissionCard title="Daily Eco Check-in" subtitle="Check in for 5 days in a row" progress={3} total={5} />
            <MissionCard title="Eco Influencer: Level 2" subtitle="Bring your own cup 3 more times" progress={2} total={5} />
        </div>
      </section>

      {/* Available Rewards */}
      <section>
        <h3 className="text-xl font-bold mb-3">Available Rewards</h3>
        <div className="flex space-x-4 overflow-x-auto pb-2">
            <RewardCard image="https://picsum.photos/id/30/200/200" title="Free Pastry" expiry="Expires in 14 days" />
            <RewardCard image="https://picsum.photos/id/431/200/200" title="Free Espresso" expiry="Expires in 30 days" />
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h3 className="text-xl font-bold mb-3">Achievements</h3>
        <div className="grid grid-cols-3 gap-4">
            {achievements.map((ach, index) => (
                <AchievementBadge key={index} achievement={ach} />
            ))}
        </div>
      </section>
      
      {/* Notifications Panel */}
      {isNotificationsVisible && (
        <>
            <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={() => setIsNotificationsVisible(false)}></div>
            <div 
              className="fixed top-0 right-0 bottom-0 bg-cafa-secondary w-full max-w-sm shadow-2xl transform transition-transform duration-300 ease-in-out z-50 translate-x-0"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-cafa-text-primary">Notifications</h2>
                        <button 
                          onClick={() => setIsNotificationsVisible(false)}
                          className="p-1 -mr-1 text-cafa-text-secondary hover:text-cafa-primary"
                          aria-label="Close notifications"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div>
                        {notifications.map((notification, index) => (
                            <NotificationItem key={index} {...notification} />
                        ))}
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

const NotificationItem: React.FC<{icon: React.FC<{className?:string}>, title: string, message: string, time: string, color: string}> = ({ icon: Icon, title, message, time, color }) => (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0">
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
          <p className="font-bold text-cafa-text-primary">{title}</p>
          <p className="text-sm text-cafa-text-secondary mt-0.5">{message}</p>
          <p className="text-xs text-gray-400 mt-2">{time}</p>
      </div>
    </div>
);


const MissionCard: React.FC<{title: string, subtitle: string, progress: number, total: number}> = ({title, subtitle, progress, total}) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-cafa-eco/10 rounded-full flex items-center justify-center">
            <CheckBadgeIcon className="w-7 h-7 text-cafa-eco" />
        </div>
        <div className="flex-1">
            <p className="font-bold">{title}</p>
            <p className="text-xs text-cafa-text-secondary">{subtitle}</p>
        </div>
        <p className="font-bold text-cafa-eco">{progress}/{total}</p>
    </div>
);

const RewardCard: React.FC<{image: string, title: string, expiry: string}> = ({image, title, expiry}) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0 w-36 text-center">
        <div className="bg-gray-200 h-24 flex items-center justify-center">
            <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="p-2">
            <p className="font-bold text-sm">{title}</p>
            <p className="text-xs text-cafa-text-secondary">{expiry}</p>
        </div>
    </div>
);

const AchievementBadge: React.FC<{achievement: Achievement}> = ({achievement}) => {
    const isEco = achievement.name === 'Eco-Warrior';
    return (
        <div className="flex flex-col items-center text-center gap-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isEco ? 'bg-cafa-eco text-white' : 'bg-gray-200 text-cafa-text-secondary'}`}>
                <achievement.icon className="w-8 h-8" />
            </div>
            <p className="text-xs font-semibold">{achievement.name}</p>
        </div>
    );
};


export default RewardsScreen;