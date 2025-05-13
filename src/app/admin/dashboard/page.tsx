"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

interface DashboardData {
  totalUsers: number;
  adminCount: number;
  regularUserCount: number;
  totalResumes: number;
  userGrowth: number;
  resumeGrowth: number;
}

interface MonthlyData {
  name: string;
  users: number;
  resumes: number;
}

interface TemplateUsage {
  name: string;
  value: number;
}

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    adminCount: 0,
    regularUserCount: 0,
    totalResumes: 0,
    userGrowth: 0,
    resumeGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [templateUsage, setTemplateUsage] = useState<TemplateUsage[]>([]);
  const [error, setError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Lấy dữ liệu tổng quan
        const dashboardData = await api.get<DashboardData>(
          "/api/admin/dashboard",
        );

        // Lấy dữ liệu theo tháng và template
        const monthlyData = await api.get<{
          monthlyData: MonthlyData[];
          templateUsage: TemplateUsage[];
        }>("/api/admin/dashboard/monthly");

        setData(dashboardData);
        setMonthlyData(monthlyData.monthlyData);
        setTemplateUsage(monthlyData.templateUsage);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="mb-2 text-red-600 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-sm"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const conversionRate =
    data.totalUsers > 0
      ? Math.round((data.totalResumes / data.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan về hệ thống Quick CV
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            <Calendar className="mr-1 inline h-4 w-4" />
            {new Date().toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card tổng số người dùng */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/40 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <div className="flex items-center pt-1">
              <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">
                +{data.userGrowth}%
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                so với tháng trước
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {data.adminCount} admin, {data.regularUserCount} người dùng
            </p>
          </CardContent>
        </Card>

        {/* Card tổng số resume */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/40 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng CV đã tạo
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{data.totalResumes}</div>
            <div className="flex items-center pt-1">
              <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">
                +{data.resumeGrowth}%
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                so với tháng trước
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Trung bình{" "}
              {data.totalUsers > 0
                ? (data.totalResumes / data.totalUsers).toFixed(1)
                : 0}{" "}
              CV/người dùng
            </p>
          </CardContent>
        </Card>

        {/* Card tỉ lệ chuyển đổi */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/40 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỉ lệ chuyển đổi
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <div className="flex items-center pt-1">
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">
                +3.2%
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                so với tháng trước
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tỉ lệ người dùng tạo CV
            </p>
          </CardContent>
        </Card>

        {/* Card mới */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/40 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỉ lệ hoàn thành
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">75%</div>
            <div className="flex items-center pt-1">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-500">-1.5%</span>
              <span className="ml-1 text-xs text-muted-foreground">
                so với tháng trước
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tỉ lệ hoàn thành CV
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="templates">Mẫu CV</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Người dùng & CV</CardTitle>
                <CardDescription>
                  Biểu đồ tăng trưởng theo tháng
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="resumes"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Thông kê theo quý</CardTitle>
                <CardDescription>
                  Thống kê người dùng và CV theo quý
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    width={500}
                    height={300}
                    data={[
                      { name: "Q1", users: 56, resumes: 87 },
                      { name: "Q2", users: 116, resumes: 193 },
                      { name: "Q3", users: 0, resumes: 0 },
                      { name: "Q4", users: 0, resumes: 0 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="users"
                      name="Người dùng"
                      stackId="a"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="resumes"
                      name="CV"
                      stackId="b"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sử dụng mẫu CV</CardTitle>
                <CardDescription>Phân bố sử dụng các mẫu CV</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart width={400} height={300}>
                    <Pie
                      data={templateUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {templateUsage.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Chi tiết mẫu CV</CardTitle>
                <CardDescription>Phân tích theo loại mẫu CV</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    width={500}
                    height={300}
                    layout="vertical"
                    data={[
                      { name: "Blank", value: 35 },
                      { name: "Professional", value: 40 },
                      { name: "Creative", value: 15 },
                      { name: "Minimal", value: 10 },
                    ]}
                    margin={{ top: 20, right: 20, bottom: 5, left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Số lượng sử dụng"
                      fill="#82ca9d"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
