'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface IncomeExpenseChartProps {
  income: number;
  expense: number;
}

export default function IncomeExpenseChart({ income, expense }: IncomeExpenseChartProps) {
  const data = [
    {
      name: 'Summary',
      Income: income / 100, // convert paise to INR
      Expenses: expense / 100,
    }
  ]

  const formatCurrency = (value: number) => `₹${value.toFixed(0)}`

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" hide />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip 
            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, undefined]}
            cursor={{fill: 'transparent'}}
          />
          <Legend />
          <Bar dataKey="Income" fill="#149c77" radius={[4, 4, 0, 0]} maxBarSize={60} />
          <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
