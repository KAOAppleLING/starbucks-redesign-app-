import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { HeartIcon, CoffeeIcon } from '../constants';

const healthIndex = 7.8;
const cupsThisWeek = 12;

const coffeeConsumptionData = [
  { name: 'M', cups: 2 },
  { name: 'T', cups: 1 },
  { name: 'W', cups: 3 },
  { name: 'T', cups: 2 },
  { name: 'F', cups: 1 },
  { name: 'S', cups: 3 },
  { name: 'S', cups: 0 },
];

const recentOrders = [
    { id: 1, name: 'Caffè Latte', date: 'Today, 9:05 AM', image: 'https://picsum.photos/id/431/200/200' },
    { id: 2, name: 'Iced Caramel Latte', date: 'Yesterday, 2:30 PM', image: 'https://picsum.photos/id/234/200/200' },
    { id: 3, name: 'Brewed Coffee', date: 'Yesterday, 8:15 AM', image: 'https://picsum.photos/id/225/200/200' },
];

const getHealthIndexColor = (index: number) => {
    if (index >= 8) return 'cafa-eco';
    if (index >= 5) return 'cafa-accent';
    return 'red-500';
};

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);


const AccountScreen: React.FC = () => {
  const color = getHealthIndexColor(healthIndex);
  const [name, setName] = useState('Alex Chen');
  const [summary, setSummary] = useState('Your Personal Coffee Summary');
  const [profilePic, setProfilePic] = useState('https://picsum.photos/id/1005/200/200');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePic(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };


  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="relative group flex-shrink-0">
            <img 
                src={profilePic} 
                alt={name}
                className="w-20 h-20 rounded-full object-cover" 
            />
            <button 
                onClick={handleProfilePicClick} 
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-offset-2 focus:ring-cafa-accent"
                aria-label="Change profile picture"
            >
                <CameraIcon className="w-8 h-8 text-white" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
        </div>
        <div className="flex-1 min-w-0">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl font-bold text-cafa-text-primary bg-transparent focus:outline-none focus:ring-1 focus:ring-cafa-accent rounded-md px-1 -mx-1 w-full"
                aria-label="Edit user name"
            />
            <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="text-cafa-text-secondary bg-transparent focus:outline-none focus:ring-1 focus:ring-cafa-accent rounded-md px-1 -mx-1 w-full"
                aria-label="Edit user summary"
            />
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard title="Health Index" icon={HeartIcon} color={color}>
            <p className={`text-4xl font-bold text-${color}`}>{healthIndex.toFixed(1)}</p>
            <p className="text-xs text-cafa-text-secondary">Based on recent orders</p>
        </StatCard>
        <StatCard title="Cups This Week" icon={CoffeeIcon} color="cafa-primary">
            <p className="text-4xl font-bold text-cafa-primary">{cupsThisWeek}</p>
            <p className="text-xs text-cafa-text-secondary">Keep track of your intake</p>
        </StatCard>
      </section>

      {/* Coffee Consumption Chart */}
      <section className="bg-white p-5 rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg mb-4">Weekly Consumption</h3>
        <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coffeeConsumptionData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
                    <Bar dataKey="cups" fill="#00704A" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-xl font-bold mb-3">Recent Activity</h3>
        <div className="space-y-3">
            {recentOrders.map(order => (
                <div key={order.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-4">
                    <img src={order.image} alt={order.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                        <p className="font-bold">{order.name}</p>
                        <p className="text-xs text-cafa-text-secondary">{order.date}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ title: string; icon: React.FC<{className?: string}>; color: string; children: React.ReactNode }> = ({ title, icon: Icon, color, children }) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between h-40">
            <div>
                <div className={`w-8 h-8 rounded-full bg-${color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}`} />
                </div>
                <h3 className="font-bold text-cafa-text-primary mt-2">{title}</h3>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

export default AccountScreen;