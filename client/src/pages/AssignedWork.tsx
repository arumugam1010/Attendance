import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ClipboardList, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { workAssignmentsAPI } from "@/services/api";

interface WorkAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  date: string;
  site: string;
  workDetails: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

const statusColors = {
  pending: 'bg-orange-100 text-orange-800 border-orange-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AssignedWork() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workAssignments, setWorkAssignments] = useState<WorkAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<WorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // Fetch assignments from localStorage
        const savedAssignments = localStorage.getItem('workAssignments');
        const assignmentsData = savedAssignments ? JSON.parse(savedAssignments) : [];
        setWorkAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching work assignments:', error);
        setWorkAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user]);

  useEffect(() => {
    // Filter assignments by selected date
    const dateString = selectedDate.toISOString().split('T')[0];
    const filtered = workAssignments.filter(
      assignment => assignment.date === dateString && assignment.employeeId === user?.id
    );
    setFilteredAssignments(filtered);
  }, [selectedDate, workAssignments, user]);

  const handleStatusChange = (assignmentId: string, newStatus: WorkAssignment['status']) => {
    const updatedAssignments = workAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, status: newStatus }
        : assignment
    );
    setWorkAssignments(updatedAssignments);
    // Sync with localStorage
    localStorage.setItem('workAssignments', JSON.stringify(updatedAssignments));
    console.log(`Status updated for assignment ${assignmentId} to ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Assigned Work
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your assigned tasks for specific dates.
          </p>
        </div>
      </div>

      {/* Date Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="text-sm text-muted-foreground">
              Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Tasks for {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Work Assigned for this Date
              </h3>
              <p className="text-sm text-muted-foreground">
                There are no tasks assigned to you for {format(selectedDate, "MMMM d, yyyy")}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work ID</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Work Details</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.id}</TableCell>
                      <TableCell>{assignment.site}</TableCell>
                      <TableCell className="max-w-xs truncate" title={assignment.workDetails}>
                        {assignment.workDetails}
                      </TableCell>
                      <TableCell>{assignment.startTime} - {assignment.endTime}</TableCell>
                      <TableCell>{format(new Date(assignment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[assignment.status]}>
                          {statusLabels[assignment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={assignment.status}
                          onValueChange={(value: WorkAssignment['status']) =>
                            handleStatusChange(assignment.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
