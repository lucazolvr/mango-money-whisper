
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', saldo: 2000 },
  { name: 'Fev', saldo: 2300 },
  { name: 'Mar', saldo: 2100 },
  { name: 'Abr', saldo: 2800 },
  { name: 'Mai', saldo: 2500 },
  { name: 'Jun', saldo: 2900 },
  { name: 'Jul', saldo: 2500 },
];

export const BalanceChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f97316" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#c2410c"
            fontSize={12}
          />
          <YAxis 
            stroke="#c2410c"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            formatter={(value) => [`R$ ${value}`, 'Saldo']}
            contentStyle={{
              backgroundColor: '#fff7ed',
              border: '1px solid #f97316',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="saldo" 
            stroke="#f97316" 
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#ea580c' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
