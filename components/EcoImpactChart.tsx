
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'M', co2: 200 },
  { name: 'T', co2: 300 },
  { name: 'W', co2: 250 },
  { name: 'T', co2: 400 },
  { name: 'F', co2: 280 },
  { name: 'S', co2: 350 },
  { name: 'S', co2: 450 },
];

// Find the max value to highlight the corresponding bar
const maxCo2 = Math.max(...data.map(item => item.co2));

const EcoImpactChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -30, bottom: 5 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
        <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.co2 === maxCo2 ? '#689F38' : '#D1D5DB'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EcoImpactChart;
