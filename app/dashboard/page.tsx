"use client";

import { createClient } from "@/lib/supabase/client";
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
  capital: number;
}

export default function DashboardPage() {
  const [capital, setCapital] = useState<CapitalData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalLent, setTotalLent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get user capital
      const { data: capitalData, error: capitalError } = await supabase
        .from("users_capital")
        .select("*")
        .single();

      if (capitalError) {
        console.error("Error fetching capital:", capitalError);
        setLoading(false);
        return;
      }

      // Get active loans to calculate lent capital
      const { data: loansData, error: loansError } = await supabase
        .from("loans")
        .select("principal_amount")
        .eq("status", "active");

      if (loansError) {
        console.error("Error fetching loans:", loansError);
      }

      const calculatedTotalLent =
        loansData?.reduce(
          (sum, loan) => sum + Number(loan.principal_amount),
          0
        ) || 0;
      setTotalLent(calculatedTotalLent);

      // Get monthly earnings from payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("payment_month, interest_earned, was_paid")
        .order("payment_month", { ascending: false })
        .limit(12);

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        setLoading(false);
        return;
      }

      // Group by month
      const monthMap = new Map<string, number>();
      let totalInterests = 0;

      paymentsData?.forEach((payment) => {
        if (payment.was_paid) {
          const month = new Date(payment.payment_month).toLocaleDateString(
            "es-ES",
            {
              month: "short",
              year: "numeric",
            }
          );
          const interest = Number(payment.interest_earned);
          monthMap.set(month, (monthMap.get(month) || 0) + interest);
          totalInterests += interest;
        }
      });

      // Calculate total assets (Initial + Interest)
      const totalAssets = (capitalData.initial_capital || 0) + totalInterests;

      // Update capital state with calculated value (Total Assets)
      setCapital({
        ...capitalData,
        current_capital: totalAssets,
      });

      const data = Array.from(monthMap, ([month, earnings]) => ({
        month,
        earnings: Number.parseFloat(earnings.toFixed(2)),
        capital: totalAssets,
      })).reverse();

      setMonthlyData(data.length > 0 ? data : generateMockData());
      setLoading(false);
    };

    fetchData();
  }, []);

  const generateMockData = (): MonthlyData[] => {
    return [];
  };

  const totalEarnings = monthlyData.reduce((sum, m) => sum + m.earnings, 0);

  // Calculate growth based on dynamic values
  const growthPercentage = capital?.initial_capital
    ? ((capital.current_capital - capital.initial_capital) /
        Math.max(capital.initial_capital, 1)) *
      100
    : 0;

  // Calculate available capital for display
  const availableCapital = (capital?.current_capital || 0) - totalLent;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

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
