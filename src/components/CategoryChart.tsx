
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Alimentação', value: 35, color: '#f97316' },
  { name: 'Transporte', value: 25, color: '#fb923c' },
  { name: 'Casa', value: 20, color: '#fdba74' },
  { name: 'Lazer', value: 12, color: '#fed7aa' },
  { name: 'Outros', value: 8, color: '#ffedd5' },
];

export const CategoryChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Percentual']}
            contentStyle={{
              backgroundColor: '#fff7ed',
              border: '1px solid #f97316',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
