import React from 'react';
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

const AccountScreen: React.FC = () => {
  const color = getHealthIndexColor(healthIndex);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <img src="https://picsum.photos/id/1005/200/200" alt="Alex Chen" className="w-20 h-20 rounded-full" />
        <div>
            <h1 className="text-2xl font-bold text-cafa-text-primary">Alex Chen</h1>
            <p className="text-cafa-text-secondary">Your Personal Coffee Summary</p>
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
                    <Bar dataKey="cups" fill="#A1887F" radius={[4, 4, 0, 0]} />
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