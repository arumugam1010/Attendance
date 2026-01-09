import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
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
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  site: string;
  status: "present" | "absent" | "late" | "leave" | "half-day";
  checkIn: string | null;
  checkOut: string | null;
}

const initialAttendance: AttendanceRecord[] = [
  { id: "1", employeeId: "EMP001", employeeName: "John Martinez", role: "Site Supervisor", site: "Downtown Tower", status: "present", checkIn: "08:02", checkOut: null },
  { id: "2", employeeId: "EMP002", employeeName: "Sarah Chen", role: "Civil Engineer", site: "Harbor Bridge", status: "late", checkIn: "08:32", checkOut: null },
  { id: "3", employeeId: "EMP003", employeeName: "Mike Johnson", role: "Mason", site: "Sunset Residences", status: "leave", checkIn: null, checkOut: null },
  { id: "4", employeeId: "EMP004", employeeName: "Emily Davis", role: "Electrician", site: "Metro Station", status: "present", checkIn: "07:55", checkOut: null },
  { id: "5", employeeId: "EMP005", employeeName: "Robert Kim", role: "Plumber", site: "Downtown Tower", status: "absent", checkIn: null, checkOut: null },
  { id: "6", employeeId: "EMP006", employeeName: "Lisa Wang", role: "Project Manager", site: "Harbor Bridge", status: "present", checkIn: "07:45", checkOut: null },
  { id: "7", employeeId: "EMP007", employeeName: "David Brown", role: "Crane Operator", site: "Sunset Residences", status: "present", checkIn: "08:00", checkOut: null },
  { id: "8", employeeId: "EMP008", employeeName: "Anna Wilson", role: "Safety Officer", site: "Metro Station", status: "half-day", checkIn: "08:05", checkOut: "12:30" },
  { id: "9", employeeId: "EMP009", employeeName: "James Taylor", role: "Welder", site: "Downtown Tower", status: "present", checkIn: "07:50", checkOut: null },
  { id: "10", employeeId: "EMP010", employeeName: "Maria Garcia", role: "Architect", site: "Harbor Bridge", status: "present", checkIn: "08:10", checkOut: null },
];

const sites = ["All Sites", "Downtown Tower", "Harbor Bridge", "Sunset Residences", "Metro Station"];
const statusOptions = ["All Status", "Present", "Absent", "Late", "Leave", "Half Day"];

export default function Attendance() {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = selectedSite === "All Sites" || record.site === selectedSite;
    const matchesStatus = selectedStatus === "All Status" || 
      record.status.toLowerCase().replace("-", " ") === selectedStatus.toLowerCase();
    return matchesSearch && matchesSite && matchesStatus;
  });

  const stats = {
    present: attendance.filter(r => r.status === "present").length,
    absent: attendance.filter(r => r.status === "absent").length,
    late: attendance.filter(r => r.status === "late").length,
    leave: attendance.filter(r => r.status === "leave").length,
    halfDay: attendance.filter(r => r.status === "half-day").length,
  };

  const updateStatus = (id: string, newStatus: "present" | "absent" | "late" | "leave" | "half-day") => {
    setAttendance(attendance.map(record => {
      if (record.id === id) {
        const now = format(new Date(), "HH:mm");
        let checkIn = record.checkIn;
        let checkOut = record.checkOut;
        
        if (newStatus === "present" || newStatus === "late") {
          checkIn = checkIn || now;
        } else if (newStatus === "absent" || newStatus === "leave") {
          checkIn = null;
          checkOut = null;
        }
        
        return { ...record, status: newStatus, checkIn, checkOut };
      }
      return record;
    }));
  };

  const markCheckOut = (id: string) => {
    const now = format(new Date(), "HH:mm");
    setAttendance(attendance.map(record => 
      record.id === id ? { ...record, checkOut: now } : record
    ));
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
          <Button className="gap-2" data-testid="button-save-attendance">
            <Save className="h-4 w-4" />
            Save All
          </Button>
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
                data-testid="input-search-attendance"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[180px]" data-testid="select-filter-site">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Site</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check In</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
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
                    <td className="py-3 px-4 text-sm">{record.site}</td>
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
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant={record.status === "present" ? "default" : "outline"}
                          className="h-8 w-8"
                          onClick={() => updateStatus(record.id, "present")}
                          title="Mark Present"
                          data-testid={`button-present-${record.employeeId}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant={record.status === "absent" ? "destructive" : "outline"}
                          className="h-8 w-8"
                          onClick={() => updateStatus(record.id, "absent")}
                          title="Mark Absent"
                          data-testid={`button-absent-${record.employeeId}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant={record.status === "late" ? "secondary" : "outline"}
                          className={cn("h-8 w-8", record.status === "late" && "bg-warning text-warning-foreground hover:bg-warning/90")}
                          onClick={() => updateStatus(record.id, "late")}
                          title="Mark Late"
                          data-testid={`button-late-${record.employeeId}`}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        {record.checkIn && !record.checkOut && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => markCheckOut(record.id)}
                            data-testid={`button-checkout-${record.employeeId}`}
                          >
                            <LogOut className="h-3 w-3" />
                            Out
                          </Button>
                        )}
                      </div>
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
