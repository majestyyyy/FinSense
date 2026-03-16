'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';

const COLORS = ['#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export function CategoryBreakdownChart() {
  const { financialSummary, categories } = useFinance();

  const data = useMemo(() => {
    return Object.entries(financialSummary.categoryBreakdown).map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        name: category?.name || categoryId,
        value: amount,
      };
    });
  }, [financialSummary.categoryBreakdown, categories]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No expense data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Your spending by category this month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ₱${value.toFixed(0)}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SpendingTrendsChart() {
  const { transactions, user } = useFinance();

  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'MMM dd');
      const dayTransactions = transactions.filter(
        (t) =>
          t.userId === user?.id &&
          format(new Date(t.date), 'MMM dd') === dateStr &&
          t.type === 'expense'
      );
      const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { date: dateStr, amount: total };
    });
    return last7Days;
  }, [transactions, user?.id]);

  if (data.every((d) => d.amount === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>7-Day Spending Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No spending data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Spending Trend</CardTitle>
        <CardDescription>Your daily spending over the last week</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function IncomeVsExpensesChart() {
  const { transactions, user } = useFinance();

  const data = useMemo(() => {
    const last30Days = Array.from({ length: 4 }, (_, i) => {
      const weeks = Array.from({ length: 7 }, (_, j) => subDays(new Date(), 7 * (3 - i) + j));
      const weekStart = weeks[0];
      const weekStr = `Week ${i + 1}`;

      const income = transactions
        .filter(
          (t) =>
            t.userId === user?.id &&
            new Date(t.date) >= weekStart &&
            new Date(t.date) < subDays(weekStart, -7) &&
            t.type === 'income'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(
          (t) =>
            t.userId === user?.id &&
            new Date(t.date) >= weekStart &&
            new Date(t.date) < subDays(weekStart, -7) &&
            t.type === 'expense'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      return { name: weekStr, income, expenses };
    });
    return last30Days;
  }, [transactions, user?.id]);

  if (data.every((d) => d.income === 0 && d.expenses === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Weekly comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" />
            <Bar dataKey="expenses" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
