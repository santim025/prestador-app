"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Wallet, HandCoins, TrendingUp, Activity } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="flex">
        <main className="flex-1">
          <DashboardHeader />

          <div className="space-y-6 p-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Capital Disponible
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    $
                    {availableCapital.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dinero en caja
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Capital Prestado
                  </CardTitle>
                  <HandCoins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    $
                    {totalLent.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    En manos de clientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ganancias Totales
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    $
                    {totalEarnings.toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Intereses generados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Crecimiento
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {growthPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Desde capital inicial
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ganancias Mensuales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          `$${Number(value).toLocaleString("es-CO")}`
                        }
                      />
                      <Bar dataKey="earnings" fill="#3b82f6" name="Ganancias" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capital en Tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          `$${Number(value).toLocaleString("es-CO")}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="capital"
                        stroke="#10b981"
                        name="Capital"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
