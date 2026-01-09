import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart3,
  Calendar as CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Building2,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const monthlyData = [
  { month: "Jan", attendance: 92, target: 95 },
  { month: "Feb", attendance: 88, target: 95 },
  { month: "Mar", attendance: 94, target: 95 },
  { month: "Apr", attendance: 91, target: 95 },
  { month: "May", attendance: 96, target: 95 },
  { month: "Jun", attendance: 93, target: 95 },
];

const sitePerformance = [
  { name: "Downtown Tower", attendance: 94, workers: 45, trend: "up" },
  { name: "Harbor Bridge", attendance: 91, workers: 32, trend: "down" },
  { name: "Sunset Residences", attendance: 96, workers: 28, trend: "up" },
  { name: "Metro Station", attendance: 89, workers: 35, trend: "down" },
];

const topPerformers = [
  { name: "Lisa Wang", role: "Project Manager", attendance: 100, daysPresent: 22 },
  { name: "James Taylor", role: "Welder", attendance: 100, daysPresent: 22 },
  { name: "Maria Garcia", role: "Architect", attendance: 100, daysPresent: 22 },
  { name: "Emily Davis", role: "Electrician", attendance: 95, daysPresent: 21 },
  { name: "David Brown", role: "Crane Operator", attendance: 95, daysPresent: 21 },
];

const departmentStats = [
  { name: "Construction", attendance: 93, employees: 48 },
  { name: "Engineering", attendance: 96, employees: 22 },
  { name: "Electrical", attendance: 91, employees: 18 },
  { name: "Plumbing", attendance: 89, employees: 15 },
  { name: "Management", attendance: 98, employees: 12 },
  { name: "Operations", attendance: 94, employees: 25 },
  { name: "Safety", attendance: 97, employees: 8 },
  { name: "Design", attendance: 95, employees: 8 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedSite, setSelectedSite] = useState("all");

  const overallStats = {
    avgAttendance: 92.5,
    totalWorkDays: 22,
    totalAbsences: 186,
    lateArrivals: 45,
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze attendance patterns and workforce performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]" data-testid="select-report-site">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              <SelectItem value="downtown">Downtown Tower</SelectItem>
              <SelectItem value="harbor">Harbor Bridge</SelectItem>
              <SelectItem value="sunset">Sunset Residences</SelectItem>
              <SelectItem value="metro">Metro Station</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-date-range">
                <CalendarIcon className="h-4 w-4" />
                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => range?.from && range?.to && setDateRange({ from: range.from, to: range.to })}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="gap-2" data-testid="button-export">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold font-display mt-1">{overallStats.avgAttendance}%</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3% from last month
                </p>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Work Days</p>
                <p className="text-3xl font-bold font-display mt-1">{overallStats.totalWorkDays}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Absences</p>
                <p className="text-3xl font-bold font-display mt-1">{overallStats.totalAbsences}</p>
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12 from last month
                </p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-3xl font-bold font-display mt-1">{overallStats.lateArrivals}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -8 from last month
                </p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="sites" data-testid="tab-sites">By Site</TabsTrigger>
          <TabsTrigger value="departments" data-testid="tab-departments">By Department</TabsTrigger>
          <TabsTrigger value="employees" data-testid="tab-employees">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-48 relative">
                      <div
                        className="w-full max-w-12 bg-primary rounded-t-md transition-all hover:bg-primary/80"
                        style={{ height: `${(data.attendance / 100) * 100}%` }}
                      />
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-muted-foreground/30"
                        style={{ bottom: `${(data.target / 100) * 100}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{data.attendance}%</p>
                      <p className="text-xs text-muted-foreground">{data.month}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0 border-t-2 border-dashed border-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground">Target (95%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <div className="grid gap-4">
            {sitePerformance.map((site) => (
              <Card key={site.name} data-testid={`site-report-${site.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{site.name}</p>
                        <p className="text-sm text-muted-foreground">{site.workers} workers assigned</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold font-display">{site.attendance}%</p>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                      </div>
                      <div className={`flex items-center gap-1 ${site.trend === "up" ? "text-success" : "text-destructive"}`}>
                        {site.trend === "up" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="w-32">
                        <Progress value={site.attendance} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Department Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-4" data-testid={`dept-stat-${dept.name.toLowerCase()}`}>
                    <div className="w-28 text-sm font-medium">{dept.name}</div>
                    <div className="flex-1">
                      <Progress value={dept.attendance} className="h-3" />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-semibold">{dept.attendance}%</span>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-xs text-muted-foreground">{dept.employees} workers</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Top Performers This Month</CardTitle>
              <Badge variant="secondary" className="bg-success/10 text-success border-0">
                100% Attendance
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, idx) => (
                  <div
                    key={performer.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    data-testid={`performer-${idx}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{performer.attendance}%</p>
                        <p className="text-xs text-muted-foreground">{performer.daysPresent} days present</p>
                      </div>
                      {performer.attendance === 100 && (
                        <Badge className="bg-success text-success-foreground">Perfect</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2" data-testid="button-download-pdf">
              <FileSpreadsheet className="h-4 w-4" />
              Download PDF Report
            </Button>
            <Button variant="outline" className="gap-2" data-testid="button-export-excel">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button variant="outline" className="gap-2" data-testid="button-print">
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
