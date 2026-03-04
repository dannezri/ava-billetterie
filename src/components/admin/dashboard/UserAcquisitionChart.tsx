'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AcquisitionData {
  date: string;
  users: number;
}

interface UserAcquisitionChartProps {
  data: AcquisitionData[];
}

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: fr });
  } catch {
    return dateStr;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">
        {label ? format(parseISO(label), 'd MMMM', { locale: fr }) : ''}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <span className="text-gray-600">Nouveaux utilisateurs:</span>
        <span className="font-medium">{payload[0]?.value || 0}</span>
      </div>
    </div>
  );
};

export function UserAcquisitionChart({ data }: UserAcquisitionChartProps) {
  const total = data.reduce((acc, d) => acc + d.users, 0);
  const displayData = data.slice(-14); // 2 dernières semaines

  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-base">Acquisitions Utilisateurs</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-semibold text-gray-700">{total}</span> nouveaux sur 30j
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" fill="#6366f1" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
