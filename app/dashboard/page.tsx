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
import { Wallet, HandCoins, TrendingUp, Activity, LineChart as LineChartIcon } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { useIsMobile } from "@/hooks/use-mobile";

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

function formatCOP(value: number) {
  return `$${value.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
}

function formatShortCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

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
        <p className="text-secondary text-sm">Cargando...</p>
      </div>
    );
  }

  const capital = data?.capital;
  const totalLent = data?.totalLent || 0;
  const monthlyData = data?.monthlyData || [];
  const totalEarnings = monthlyData.reduce((sum, m) => sum + m.earnings, 0);

  const growthPercentage = capital?.initial_capital
    ? ((capital.current_capital - capital.initial_capital) /
        Math.max(capital.initial_capital, 1)) *
      100
    : 0;

  const availableCapital = (capital?.current_capital || 0) - totalLent;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="flex-1">
        <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
          <PageHeader title="Dashboard" />

          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Capital Disponible"
              value={formatCOP(availableCapital)}
              subtitle="Dinero en caja"
              icon={Wallet}
              tone="emerald"
            />
            <StatCard
              label="Capital Prestado"
              value={formatCOP(totalLent)}
              subtitle="En manos de clientes"
              icon={HandCoins}
              tone="red"
            />
            <StatCard
              label="Ganancias Totales"
              value={formatCOP(totalEarnings)}
              subtitle="Intereses generados"
              icon={TrendingUp}
              tone="blue"
            />
            <StatCard
              label="Crecimiento"
              value={`${growthPercentage.toFixed(1)}%`}
              subtitle="Desde capital inicial"
              icon={Activity}
              tone="amber"
            />
          </div>

          <Card className="gap-3 py-4 sm:py-6 sm:gap-6">
            <CardHeader className="pb-0 px-4 sm:px-6">
              <CardTitle
                className="text-[14px]"
                style={{ fontWeight: 500 }}
              >
                Ganancias Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-0 px-2 sm:px-6">
              {monthlyData.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center text-center px-4 py-6 sm:py-10"
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-[#F0F0F0]"
                    style={{ width: 44, height: 44 }}
                  >
                    <LineChartIcon
                      className="h-5 w-5 text-[#8A8A8A]"
                      strokeWidth={1.75}
                    />
                  </div>
                  <p className="mt-3" style={{ fontSize: 13, fontWeight: 500 }}>
                    Aún no hay datos
                  </p>
                  <p
                    className="text-secondary mt-1 max-w-xs"
                    style={{ fontSize: 12 }}
                  >
                    Cuando marques pagos como realizados verás la evolución
                    mensual aquí.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={isMobile ? 180 : 260}
                >
                  <LineChart
                    data={monthlyData}
                    margin={
                      isMobile
                        ? { top: 8, right: 8, left: -16, bottom: 0 }
                        : { top: 8, right: 16, left: 0, bottom: 0 }
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#8A8A8A", fontSize: isMobile ? 10 : 11 }}
                      axisLine={{ stroke: "#eeeeee" }}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={isMobile ? 16 : 8}
                    />
                    <YAxis
                      tick={{ fill: "#8A8A8A", fontSize: isMobile ? 10 : 11 }}
                      axisLine={{ stroke: "#eeeeee" }}
                      tickLine={false}
                      width={isMobile ? 40 : 60}
                      tickFormatter={
                        isMobile
                          ? formatShortCurrency
                          : (value) => `$${value.toLocaleString()}`
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        `$${Number(value).toLocaleString("es-CO")}`
                      }
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#1E4FC4"
                      strokeWidth={2}
                      name="Ganancias"
                      dot={{ fill: "#1E4FC4", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: "#1E4FC4" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
