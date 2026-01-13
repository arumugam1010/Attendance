import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FileBarChart,
  Download,
  Calendar as CalendarIcon,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { reportsAPI, employeesAPI, sitesAPI } from '@/services/api';

interface ReportData {
  totalEmployees: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendanceRate: number;
  employeeReports: any[];
  siteReports: any[];
  dailyStats: any[];
}

export default function AttendanceReport() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedSite, setSelectedSite] = useState('all');
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, selectedEmployee, selectedSite]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        employeeId: selectedEmployee !== 'all' ? selectedEmployee : undefined,
        siteId: selectedSite !== 'all' ? selectedSite : undefined,
      };

      const [reportRes, employeesRes, sitesRes] = await Promise.all([
        reportsAPI.getAttendanceReport(params),
        employeesAPI.getAll(),
        sitesAPI.getAll(),
      ]);

      setReportData(reportRes);
      setEmployees(Array.isArray(employeesRes) ? employeesRes : []);
      setSites(Array.isArray(sitesRes) ? sitesRes : []);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    alert('Report export functionality would be implemented here');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading report...</div>;
  }

  if (!reportData) {
    return <div className="text-center py-8 text-muted-foreground">No report data available</div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Attendance Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive attendance analytics and insights
          </p>
        </div>
        <Button onClick={exportReport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => d && setStartDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(d) => d && setEndDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee</label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site</label>
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.name}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{reportData.totalEmployees}</p>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{reportData.attendanceRate}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{reportData.totalPresent}</p>
                  <p className="text-sm text-muted-foreground">Total Present</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{reportData.totalAbsent}</p>
                  <p className="text-sm text-muted-foreground">Total Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Daily Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(reportData.dailyStats || []).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{format(new Date(day.date), 'MMM dd')}</span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <Progress value={(day.present / (day.present + day.absent)) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {day.present}/{day.present + day.absent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-sm">Present</span>
                </div>
                <span className="font-medium">{reportData.totalPresent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive" />
                  <span className="text-sm">Absent</span>
                </div>
                <span className="font-medium">{reportData.totalAbsent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning" />
                  <span className="text-sm">Late</span>
                </div>
                <span className="font-medium">{reportData.totalLate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Employee Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(reportData.employeeReports || []).map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.role}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{emp.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Attendance Rate</p>
                  </div>
                  <Badge variant={emp.attendanceRate >= 90 ? "default" : emp.attendanceRate >= 75 ? "secondary" : "destructive"}>
                    {emp.attendanceRate >= 90 ? "Excellent" : emp.attendanceRate >= 75 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
