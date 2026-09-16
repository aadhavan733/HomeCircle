'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface CategorySpendingChartProps {
  data: { name: string; value: number }[]; // value should be in paise, we'll convert inside
}

const COLORS = ['#149c77', '#f49a2b', '#2394d7', '#f6b426', '#0f5a6b', '#8b5cf6', '#ec4899', '#ef4444']

export default function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
        No expense data available for this month.
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.name,
    value: item.value / 100 // convert to INR
  }))

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Spent']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
