import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface EcoImpactChartProps {
  data: { name: string; co2: number }[];
  activeIndex: number | null;
  onBarClick: (data: any, index: number) => void;
}

const EcoImpactChart: React.FC<EcoImpactChartProps> = ({ data, activeIndex, onBarClick }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -30, bottom: 5 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} />
        <Bar dataKey="co2" radius={[4, 4, 0, 0]} onClick={onBarClick} cursor="pointer">
            {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={index === activeIndex ? '#689F38' : '#D1D5DB'} 
                />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EcoImpactChart;