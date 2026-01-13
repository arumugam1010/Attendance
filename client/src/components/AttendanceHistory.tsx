



import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Search,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceAPI, employeesAPI, sitesAPI } from '@/services/api';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  assignedLocation: string;
  attendanceLocation: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'half-day';
  checkIn: string | null;
  checkOut: string | null;
  date: string;
  photo?: string;
  location?: { lat: number; lng: number };
}

export default function AttendanceHistory() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      const [attendanceRes, employeesRes, sitesRes] = await Promise.all([
        attendanceAPI.getAll(),
        employeesAPI.getAll(),
        sitesAPI.getAll(),
      ]);

      const attendanceData = Array.isArray(attendanceRes) ? attendanceRes : [];
      const employeesData = Array.isArray(employeesRes) ? employeesRes : [];

      // Enrich attendance data with employee names and roles
      const enrichedAttendance = attendanceData.map((record: any) => {
        const employee = employeesData.find((emp: any) => emp.id === record.employeeId);
        return {
          ...record,
          employeeName: employee ? employee.name : 'Unknown Employee',
          role: employee ? employee.role : 'Unknown Role',
          assignedLocation: employee ? employee.site : 'Unknown Site',
          attendanceLocation: 'Downtown Tower', // Dummy data for UI-level demonstration
        };
      });

      setAttendance(enrichedAttendance);
      setEmployees(employeesData);
      setSites(Array.isArray(sitesRes) ? sitesRes : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAttendance([]);
      setEmployees([]);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = (Array.isArray(attendance) ? attendance : []).filter((record) => {
    const recordDate = new Date(record.date).toDateString();
    const selectedDate = date.toDateString();
    const matchesDate = recordDate === selectedDate;

    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmployee = selectedEmployee === 'All Employees' || record.employeeId === selectedEmployee;
    const matchesSite = selectedSite === 'All Sites' || record.assignedLocation === selectedSite;
    const matchesStatus = selectedStatus === 'All Status' || record.status === selectedStatus.toLowerCase().replace(' ', '-');

    return matchesDate && matchesSearch && matchesEmployee && matchesSite && matchesStatus;
  });

  const stats = {
    present: filteredAttendance.filter(r => r.status === 'present').length,
    absent: filteredAttendance.filter(r => r.status === 'absent').length,
    late: filteredAttendance.filter(r => r.status === 'late').length,
    leave: filteredAttendance.filter(r => r.status === 'leave').length,
    halfDay: filteredAttendance.filter(r => r.status === 'half-day').length,
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="status-present border">Present</Badge>;
      case 'absent':
        return <Badge className="status-absent border">Absent</Badge>;
      case 'late':
        return <Badge className="status-late border">Late</Badge>;
      case 'leave':
        return <Badge className="status-leave border">Leave</Badge>;
      case 'half-day':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">Half Day</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading attendance history...</div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Attendance History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage attendance records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <UserX className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.leave}</p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.halfDay}</p>
              <p className="text-xs text-muted-foreground">Half Day</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Employees">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Sites">All Sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.name}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned Location</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Attendance Location</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check In</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(record.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{record.role} • {record.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {record.assignedLocation}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{record.attendanceLocation}</td>
                    <td className="py-3 px-4 text-center">
                      {record.checkIn ? (
                        <span className="text-sm font-medium">
                          {record.checkIn}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">--:--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.checkOut ? (
                        <span className="text-sm font-medium flex items-center justify-center gap-1">
                          <LogOut className="h-3 w-3 text-primary" />
                          {record.checkOut}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">--:--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for the selected date and filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
