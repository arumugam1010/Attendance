import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  HardHat,
  Target,
  TrendingUp,
  Upload,
  Phone,
  Mail,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { workAssignmentsAPI, attendanceAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [workAssignments, setWorkAssignments] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'location' | 'confirm'>('location');
  const [avatar, setAvatar] = useState<string>('');

  // Dummy employee data for profile display
  const employeeData = {
    id: user?.id || "EMP001",
    fullName: user?.username || "John Doe",
    designation: "Construction Worker",
    phoneNumber: "+1 (555) 123-4567",
    email: "john.doe@buildtrack.com",
    assignedSite: "Downtown Construction Site",
    status: "Active",
    joiningDate: "2023-01-15",
    dateOfBirth: "1990-05-20",
    username: user?.username || "johndoe",
    address: "123 Main Street, Springfield, IL 62701",
    emergencyContactName: "Jane Doe",
    emergencyContactPhone: "+1 (555) 987-6543",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsData, attendanceData] = await Promise.all([
          workAssignmentsAPI.getByEmployee(user?.id || 'emp-001'),
          attendanceAPI.getAll(),
        ]);

        setWorkAssignments(assignmentsData);

        // Check today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayAtt = attendanceData.find((att: any) =>
          att.employeeId === user?.id && att.date === today
        );
        setTodayAttendance(todayAtt);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAttendanceStep = () => {
    if (currentStep === 'location') {
      setCurrentStep('confirm');
    }
  };

  const markAttendance = async () => {
    try {
      const attendanceData = {
        employeeId: user?.id,
        siteId: '1', // Default site for demo
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString(),
        status: 'present',
        type: 'check-in'
      };

      await attendanceAPI.markAttendance(attendanceData);
      setTodayAttendance(attendanceData);
      setCurrentStep('location');
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const today = new Date();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your work overview for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{format(today, "EEEE, MMMM d, yyyy")}</span>
          </div>
        </div>
      </div>




      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">
                  {workAssignments.filter((a: any) => a.status === 'completed').length}
                </p>
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
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Hours</p>
                <p className="text-2xl font-bold">8.2h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
