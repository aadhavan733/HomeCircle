'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface SpendingTrendChartProps {
  data: { month: string; spent: number }[]; // spent in paise
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
        No historical data available.
      </div>
    )
  }

  const chartData = data.map(item => ({
    month: item.month,
    Spent: item.spent / 100 // convert to INR
  }))

  const formatCurrency = (value: number) => `₹${value.toFixed(0)}`

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Total Spent']}
          />
          <Line 
            type="monotone" 
            dataKey="Spent" 
            stroke="#f49a2b" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#f49a2b' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
