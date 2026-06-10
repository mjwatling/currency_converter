import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ApiResponse {
  rates: Record<string, number>;
  base: string;
  history?: Array<{
    timestamp: number;
    rates: Record<string, number>;
  }>;
}

interface HistoricalChartProps {
  base: string;
  target: string;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ base, target }) => {
  const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rates?base=${base}`);
        if (!res.ok) throw new Error('Failed to fetch exchange rates');
        
        const data: ApiResponse = await res.json();
        
        if (data.history && data.history.length > 0) {
          const formatted = data.history
            .map(point => ({
              date: new Date(point.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              rate: point.rates[target] || 0,
              timestamp: point.timestamp 
            }))
            .sort((a: { timestamp: number }, b: { timestamp: number }) => a.timestamp - b.timestamp)
            .map(({ date, rate }) => ({ date, rate }));

          setChartData(formatted);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error("Chart error:", err);
        setError(err instanceof Error ? err.message : 'Error loading chart');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [base, target]);

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm opacity-50 animate-pulse">
        Loading trends...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm text-red-500 px-4 text-center">
        {error}
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-sm italic opacity-50">
        Insufficient history to show trends.
      </div>
    );
  }

  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
          <XAxis 
            dataKey="date" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            stroke="var(--secondary)" 
          />
          <YAxis 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            stroke="var(--secondary)" 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--card-border)',
              color: 'var(--text)',
              borderRadius: '8px'
            }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Area 
            type="monotone" 
            dataKey="rate" 
            stroke="var(--primary)" 
            fillOpacity={1} 
            fill="url(#colorRate)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalChart;
