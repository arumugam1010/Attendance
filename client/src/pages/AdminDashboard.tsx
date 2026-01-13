import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  HardHat,
  Building2,
  TrendingUp,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { employeesAPI, attendanceAPI, sitesAPI } from "@/services/api";

interface Stats {
  totalWorkforce: number;
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
}

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  workers: number;
}

interface Activity {
  id: string;
  employeeName: string;
  action: string;
  site: string;
  time: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalWorkforce: 0,
    presentToday: 0,
    absentToday: 0,
    lateArrivals: 0,
  });
  const [activeSites, setActiveSites] = useState<Site[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, attendanceRes, sitesRes] = await Promise.all([
        employeesAPI.getAll(),
        attendanceAPI.getAll(),
        sitesAPI.getAll(),
      ]);

      const employees = employeesRes;
      const attendance = attendanceRes;
      const sites = sitesRes;

      // Calculate stats
      const today = new Date().toDateString();
      const todayAttendance = attendance.filter((a: any) => new Date(a.date).toDateString() === today);

      setStats({
        totalWorkforce: employees.length,
        presentToday: todayAttendance.filter((a: any) => a.status === 'present').length,
        absentToday: todayAttendance.filter((a: any) => a.status === 'absent').length,
        lateArrivals: todayAttendance.filter((a: any) => a.status === 'late').length,
      });

      // Set active sites (first 4)
      setActiveSites(sites.filter((s: any) => s.status === 'active').slice(0, 4));

      // Mock recent activity
      setRecentActivity([
        { id: '1', employeeName: 'John Martinez', action: 'Checked In', site: 'Downtown Tower', time: '08:02 AM', status: 'present' },
        { id: '2', employeeName: 'Sarah Chen', action: 'Checked In', site: 'Harbor Bridge', time: '08:15 AM', status: 'late' },
        { id: '3', employeeName: 'Mike Johnson', action: 'Leave Request', site: 'Sunset Residences', time: 'Yesterday', status: 'leave' },
        { id: '4', employeeName: 'Emily Davis', action: 'Checked Out', site: 'Metro Station', time: '05:30 PM', status: 'present' },
        { id: '5', employeeName: 'Robert Kim', action: 'Absent', site: 'Downtown Tower', time: 'Today', status: 'absent' },
      ]);

      // Mock weekly data
      setWeeklyData([
        { day: "Mon", present: 145, absent: 11 },
        { day: "Tue", present: 148, absent: 8 },
        { day: "Wed", present: 142, absent: 14 },
        { day: "Thu", present: 150, absent: 6 },
        { day: "Fri", present: 142, absent: 14 },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Workforce",
      value: stats.totalWorkforce,
      change: "+12 this month",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
      change: `${stats.totalWorkforce > 0 ? Math.round((stats.presentToday / stats.totalWorkforce) * 100) : 0}% attendance`,
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Absent Today",
      value: stats.absentToday,
      change: `${stats.absentToday} on leave`,
      icon: UserX,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Late Arrivals",
      value: stats.lateArrivals,
      change: "-2 from yesterday",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your workforce today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
