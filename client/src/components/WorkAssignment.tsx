import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

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

export default function WorkAssignment() {
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<WorkAssignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    employeeId: "",
    employeeName: "",
    department: "",
    role: "",
    date: new Date().toISOString().split('T')[0],
    site: "",
    workDetails: "",
    startTime: "",
    endTime: "",
    status: "pending" as 'pending' | 'in-progress' | 'completed' | 'cancelled',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Save assignments to localStorage whenever assignments change
  useEffect(() => {
    localStorage.setItem('workAssignments', JSON.stringify(assignments));
  }, [assignments]);

  const fetchData = async () => {
    try {
      // Fetch employees from localStorage (same as Employees page)
      const savedEmployees = localStorage.getItem('employees');
      const employeesData = savedEmployees ? JSON.parse(savedEmployees) : [];

      // Fetch assignments from localStorage
      const savedAssignments = localStorage.getItem('workAssignments');
      const assignmentsData = savedAssignments ? JSON.parse(savedAssignments) : [];

      // Transform assignments to include employee details
      const transformedAssignments = assignmentsData.map((assignment: WorkAssignment) => {
        const employee = employeesData.find((emp: any) => emp.id === assignment.employeeId);
        return {
          ...assignment,
          employeeName: employee?.name || 'Unknown Employee',
          department: employee?.department || 'Unknown Department',
          role: employee?.role || 'Unknown Role',
        };
      });

      setAssignments(transformedAssignments);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAssignments([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.workDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.site.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All Status" || assignment.status === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setNewAssignment({
        ...newAssignment,
        employeeId,
        employeeName: employee.name,
        department: employee.department,
        role: employee.role,
      });
    }
  };

  const validateTimes = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return true;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return end > start;
  };

  const handleAssignWork = () => {
    if (!validateTimes(newAssignment.startTime, newAssignment.endTime)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const newAssignmentData: WorkAssignment = {
        id: `WA${Date.now()}`,
        employeeId: newAssignment.employeeId,
        employeeName: newAssignment.employeeName,
        department: newAssignment.department,
        role: newAssignment.role,
        date: newAssignment.date,
        site: newAssignment.site,
        workDetails: newAssignment.workDetails,
        startTime: newAssignment.startTime,
        endTime: newAssignment.endTime,
        status: newAssignment.status,
      };

      setAssignments([...assignments, newAssignmentData]);
      setNewAssignment({
        employeeId: "",
        employeeName: "",
        department: "",
        role: "",
        date: new Date().toISOString().split('T')[0],
        site: "",
        workDetails: "",
        startTime: "",
        endTime: "",
        status: "pending",
      });
      setIsAssignDialogOpen(false);
      Swal.fire({
        title: 'Success!',
        text: 'Work assigned successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error assigning work:', error);
      toast.error('Failed to assign work');
    }
  };

  const handleEditAssignment = () => {
    if (!editingAssignment) return;
    if (!validateTimes(editingAssignment.startTime, editingAssignment.endTime)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const updatedAssignments = assignments.map(assignment =>
        assignment.id === editingAssignment.id ? editingAssignment : assignment
      );
      setAssignments(updatedAssignments);
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      toast.success('Work assignment updated successfully!');
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleDeleteAssignment = (id: string) => {
    try {
      const updatedAssignments = assignments.filter(assignment => assignment.id !== id);
      setAssignments(updatedAssignments);
      toast.success('Work assignment deleted successfully!');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading work assignments...</div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Work Assignment
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign and manage work tasks for construction workforce
          </p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Work
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-display">Assign Work</DialogTitle>
              <DialogDescription>
                Assign a new work task to an employee
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={newAssignment.employeeId}
                  onValueChange={handleEmployeeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newAssignment.department}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={newAssignment.role}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAssignment.date}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="site">Site Name</Label>
                <Input
                  id="site"
                  value={newAssignment.site}
                  onChange={(e) => setNewAssignment({ ...newAssignment, site: e.target.value })}
                  placeholder="e.g., Downtown Tower Site"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="workDetails">Work Details</Label>
                <Textarea
                  id="workDetails"
                  value={newAssignment.workDetails}
                  onChange={(e) => setNewAssignment({ ...newAssignment, workDetails: e.target.value })}
                  placeholder="Describe the work to be performed..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newAssignment.startTime}
                    onChange={(e) => setNewAssignment({ ...newAssignment, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newAssignment.endTime}
                    onChange={(e) => setNewAssignment({ ...newAssignment, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignWork}>
                Assign Work
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-display">Edit Work Assignment</DialogTitle>
              <DialogDescription>
                Update work assignment details
              </DialogDescription>
            </DialogHeader>
            {editingAssignment && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Employee</Label>
                  <Input value={editingAssignment.employeeName} readOnly className="bg-muted" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-site">Site Name</Label>
                  <Input
                    id="edit-site"
                    value={editingAssignment.site}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, site: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-workDetails">Work Details</Label>
                  <Textarea
                    id="edit-workDetails"
                    value={editingAssignment.workDetails}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, workDetails: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-startTime">Start Time</Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={editingAssignment.startTime}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-endTime">End Time</Label>
                    <Input
                      id="edit-endTime"
                      type="time"
                      value={editingAssignment.endTime}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingAssignment.status}
                    onValueChange={(value: 'pending' | 'in-progress' | 'completed' | 'cancelled') =>
                      setEditingAssignment({ ...editingAssignment, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAssignment}>
                Update Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, work details, or site..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{filteredAssignments.length} assignments found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Work ID</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Employee Name</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Site</th>
                  <th className="text-left p-4 font-medium">Work Details</th>
                  <th className="text-left p-4 font-medium">Start Time</th>
                  <th className="text-left p-4 font-medium">End Time</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-sm">{assignment.id.slice(-6)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(assignment.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{assignment.employeeName}</td>
                    <td className="p-4">{assignment.department}</td>
                    <td className="p-4">{assignment.role}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {assignment.site}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate" title={assignment.workDetails}>
                      {assignment.workDetails}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {assignment.startTime}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {assignment.endTime}
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(assignment.status)}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingAssignment(assignment);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
