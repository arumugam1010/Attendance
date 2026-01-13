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

export default function Dashboard() {
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

      // Mock recent activity (in real app, this would come from API)
      setRecentActivity([
        { id: "1", employeeName: "John Martinez", action: "Checked In", site: "Downtown Tower", time: "08:02 AM", status: "present" },
        { id: "2", employeeName: "Sarah Chen", action: "Checked In", site: "Harbor Bridge", time: "08:15 AM", status: "late" },
        { id: "3", employeeName: "Mike Johnson", action: "Leave Request", site: "Sunset Residences", time: "Yesterday", status: "leave" },
        { id: "4", employeeName: "Emily Davis", action: "Checked Out", site: "Metro Station", time: "05:30 PM", status: "present" },
        { id: "5", employeeName: "Robert Kim", action: "Absent", site: "Downtown Tower", time: "Today", status: "absent" },
      ]);

      // Mock weekly data
      setWeeklyData([
        { day: "Mon", present: 145, absent: 11 },
        { day: "Tue", present: 148, absent: 8 },
        { day: "Wed", present: 142, absent: 14 },
        { day: "Thu", present: 150, absent: 6 },
        { day: "Fri", present: 142, absent: 14 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  const statsCards = [
    {
      title: "Total Workforce",
      value: stats.totalWorkforce.toString(),
      change: "+12 this month",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Present Today",
      value: stats.presentToday.toString(),
      change: `${Math.round((stats.presentToday / stats.totalWorkforce) * 100)}% attendance`,
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Absent Today",
      value: stats.absentToday.toString(),
      change: `${stats.absentToday} on leave`,
      icon: UserX,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Late Arrivals",
      value: stats.lateArrivals.toString(),
      change: "-2 from yesterday",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your workforce overview for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{format(today, "EEEE, MMMM d, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold font-display">{stat.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Active Project Sites
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HardHat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {site.workers} workers assigned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{site.progress}%</p>
                    <Progress value={site.progress} className="w-24 h-2" />
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-0">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === "present"
                        ? "bg-success"
                        : activity.status === "late"
                        ? "bg-warning"
                        : activity.status === "absent"
                        ? "bg-destructive"
                        : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} • {activity.site}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weekly Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1 h-40 justify-end">
                  <div
                    className="w-full bg-success/80 rounded-t-md transition-all hover:bg-success"
                    style={{ height: `${(day.present / 160) * 100}%` }}
                    title={`Present: ${day.present}`}
                  />
                  <div
                    className="w-full bg-destructive/80 rounded-b-md transition-all hover:bg-destructive"
                    style={{ height: `${(day.absent / 160) * 100}%` }}
                    title={`Absent: ${day.absent}`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success" />
              <span className="text-sm text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span className="text-sm text-muted-foreground">Absent</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
