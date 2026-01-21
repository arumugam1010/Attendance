import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Search,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  LogIn,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AttendanceMark from "@/components/AttendanceMark";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceAPI, employeesAPI } from "@/services/api";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  assignedLocation: string;
  attendanceLocation: string;
  status: "present" | "absent" | "late" | "leave" | "half-day";
  checkIn: string | null;
  checkOut: string | null;
}

const initialAttendance: AttendanceRecord[] = [
  { id: "1", employeeId: "EMP001", employeeName: "John Martinez", role: "Site Supervisor", assignedLocation: "Downtown Tower", attendanceLocation: "Downtown Tower", status: "present", checkIn: "08:02", checkOut: null },
  { id: "2", employeeId: "EMP002", employeeName: "Sarah Chen", role: "Civil Engineer", assignedLocation: "Harbor Bridge", attendanceLocation: "Harbor Bridge", status: "late", checkIn: "08:32", checkOut: null },
  { id: "3", employeeId: "EMP003", employeeName: "Mike Johnson", role: "Mason", assignedLocation: "Sunset Residences", attendanceLocation: "Sunset Residences", status: "leave", checkIn: null, checkOut: null },
  { id: "4", employeeId: "EMP004", employeeName: "Emily Davis", role: "Electrician", assignedLocation: "Metro Station", attendanceLocation: "Metro Station", status: "present", checkIn: "07:55", checkOut: null },
  { id: "5", employeeId: "EMP005", employeeName: "Robert Kim", role: "Plumber", assignedLocation: "Downtown Tower", attendanceLocation: "Downtown Tower", status: "absent", checkIn: null, checkOut: null },
  { id: "6", employeeId: "EMP006", employeeName: "Lisa Wang", role: "Project Manager", assignedLocation: "Harbor Bridge", attendanceLocation: "Harbor Bridge", status: "present", checkIn: "07:45", checkOut: null },
  { id: "7", employeeId: "EMP007", employeeName: "David Brown", role: "Crane Operator", assignedLocation: "Sunset Residences", attendanceLocation: "Sunset Residences", status: "present", checkIn: "08:00", checkOut: null },
  { id: "8", employeeId: "EMP008", employeeName: "Anna Wilson", role: "Safety Officer", assignedLocation: "Metro Station", attendanceLocation: "Metro Station", status: "half-day", checkIn: "08:05", checkOut: "12:30" },
  { id: "9", employeeId: "EMP009", employeeName: "James Taylor", role: "Welder", assignedLocation: "Downtown Tower", attendanceLocation: "Downtown Tower", status: "present", checkIn: "07:50", checkOut: null },
  { id: "10", employeeId: "EMP010", employeeName: "Maria Garcia", role: "Architect", assignedLocation: "Harbor Bridge", attendanceLocation: "Harbor Bridge", status: "present", checkIn: "08:10", checkOut: null },
];

const sites = ["All Sites", "Downtown Tower", "Harbor Bridge", "Sunset Residences", "Metro Station"];
const statusOptions = ["All Status", "Present", "Absent", "Late", "Leave", "Half Day"];

export default function Attendance() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [userAssignedLocation, setUserAssignedLocation] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAttendanceMarked = () => {
    // Refresh the attendance data
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    // Get the logged-in user's assigned location
    if (user?.id) {
      try {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const currentUser = employees.find((emp: any) => emp.id === user.id);
        if (currentUser?.site) {
          setUserAssignedLocation(currentUser.site);
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    // Fetch attendance data
    const fetchAttendance = async () => {
      try {
        let data;
        if (user?.role === 'employee') {
          data = await attendanceAPI.getByEmployee(user.id);
        } else {
          data = await attendanceAPI.getAll();
        }
        // For demo, map to the expected format
        const mappedData = data.map((record: any) => ({
          id: record.id,
          employeeId: record.employeeId,
          employeeName: record.employeeName || 'Unknown',
          role: record.role || 'Employee',
          assignedLocation: record.site || 'Unknown',
          attendanceLocation: record.site || 'Unknown',
          status: record.status || 'present',
          checkIn: record.checkIn || null,
          checkOut: record.checkOut || null,
        }));
        setAttendance(mappedData);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        // Fallback to initial data
        setAttendance(initialAttendance);
      }
    };
    fetchAttendance();
  }, [user?.id, user?.role, refreshKey]);

  const filteredAttendance = attendance.filter((record) => {
    // If user is employee, only show their own record
    if (user?.role === 'employee') {
      return record.employeeId === user.id;
    }

    // First filter by user's assigned location
    const isSameLocation = record.assignedLocation === userAssignedLocation;

    // Then apply other filters
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = selectedSite === "All Sites" || record.assignedLocation === selectedSite;
    const matchesStatus = selectedStatus === "All Status" ||
      record.status.toLowerCase().replace("-", " ") === selectedStatus.toLowerCase();

    return isSameLocation && matchesSearch && matchesSite && matchesStatus;
  });

  const stats = {
    present: filteredAttendance.filter(r => r.status === "present").length,
    absent: filteredAttendance.filter(r => r.status === "absent").length,
    late: filteredAttendance.filter(r => r.status === "late").length,
    leave: filteredAttendance.filter(r => r.status === "leave").length,
    halfDay: filteredAttendance.filter(r => r.status === "half-day").length,
  };





  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="status-present border">Present</Badge>;
      case "absent":
        return <Badge className="status-absent border">Absent</Badge>;
      case "late":
        return <Badge className="status-late border">Late</Badge>;
      case "leave":
        return <Badge className="status-leave border">Leave</Badge>;
      case "half-day":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">Half Day</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Attendance
          </h1>
          <p className="text-muted-foreground mt-1">
            Mark and manage daily attendance for your workforce
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'employee' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Clock className="h-5 w-5" />
                  Mark Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Mark Attendance</DialogTitle>
                </DialogHeader>
                <AttendanceMark onAttendanceMarked={handleAttendanceMarked} onClose={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-select-date">
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

      {user?.role !== 'employee' && (
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
      )}

      <Card>
        {user?.role !== 'employee' && (
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-attendance"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned Location</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Attendance Location</th> */}
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check In</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b hover:bg-muted/50 transition-colors"
                    data-testid={`attendance-row-${record.employeeId}`}
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
                    {/* <td className="py-3 px-4 text-sm">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {record.assignedLocation}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{record.attendanceLocation}</td> */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.checkIn ? (
                        <span className="text-sm font-medium flex items-center justify-center gap-1">
                          <LogIn className="h-3 w-3 text-success" />
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
        </CardContent>
      </Card>
    </div>
  );
}
