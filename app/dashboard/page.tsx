"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Wallet, HandCoins, TrendingUp, Activity } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

interface CapitalData {
  current_capital: number;
  initial_capital: number;
}

interface MonthlyData {
  month: string;
  earnings: number;
}

interface DashboardData {
  capital: CapitalData;
  totalLent: number;
  monthlyData: MonthlyData[];
  totalInterests: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Error fetching data");
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const capital = data?.capital;
  const totalLent = data?.totalLent || 0;
  const monthlyData = data?.monthlyData || [];
  const totalEarnings = monthlyData.reduce((sum, m) => sum + m.earnings, 0);

  // Calculate growth based on dynamic values
  const growthPercentage = capital?.initial_capital
    ? ((capital.current_capital - capital.initial_capital) /
        Math.max(capital.initial_capital, 1)) *
      100
    : 0;

  // Calculate available capital for display
  const availableCapital = (capital?.current_capital || 0) - totalLent;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1">
        <div className="space-y-4 p-4 max-w-7xl mx-auto">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col items-center space-y-0 pb-2 pt-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <Wallet className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xs font-medium text-gray-600">
                    Capital Disponible
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <div className="text-2xl font-bold text-emerald-600 tabular-nums">
                    $
                    {availableCapital.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Dinero en caja</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col items-center space-y-0 pb-2 pt-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                    <HandCoins className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xs font-medium text-gray-600">
                    Capital Prestado
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <div className="text-2xl font-bold text-red-600 tabular-nums">
                    $
                    {totalLent.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    En manos de clientes
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col items-center space-y-0 pb-2 pt-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xs font-medium text-gray-600">
                    Ganancias Totales
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <div className="text-2xl font-bold text-blue-600 tabular-nums">
                    $
                    {totalEarnings.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Intereses generados
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col items-center space-y-0 pb-2 pt-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Activity className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-xs font-medium text-gray-600">
                    Crecimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-4">
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {growthPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Desde capital inicial
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart - Gráfico de Líneas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ganancias Mensuales</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value) =>
                        `$${Number(value).toLocaleString("es-CO")}`
                      }
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Ganancias"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
