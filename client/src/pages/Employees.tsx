





import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Filter,
  Users,
  Phone,
  Mail,
  MapPin,
  HardHat,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { rolesAPI, departmentsAPI } from "@/services/api";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  site: string;
  phone: string;
  email: string;
  status: "active" | "on-leave" | "inactive";
  joinDate: string;
  photo?: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  username: string;
  password: string;
}

const initialEmployees: Employee[] = [
  { id: "EMP001", name: "John Martinez", role: "Site Supervisor", department: "Construction", site: "Downtown Tower", phone: "+1 555-0101", email: "john.m@buildtrack.com", status: "active", joinDate: "2022-03-15", dateOfBirth: "1985-05-15", address: "123 Main St, City, State 12345", emergencyContact: "Jane Martinez", emergencyPhone: "+1 555-0201", username: "john.martinez", password: "pass123" },
  { id: "EMP002", name: "Sarah Chen", role: "Civil Engineer", department: "Engineering", site: "Harbor Bridge", phone: "+1 555-0102", email: "sarah.c@buildtrack.com", status: "active", joinDate: "2021-08-22", dateOfBirth: "1988-11-20", address: "456 Oak Ave, City, State 12346", emergencyContact: "Mike Chen", emergencyPhone: "+1 555-0202", username: "sarah.chen", password: "pass123" },
  { id: "EMP003", name: "Mike Johnson", role: "Mason", department: "Construction", site: "Sunset Residences", phone: "+1 555-0103", email: "mike.j@buildtrack.com", status: "on-leave", joinDate: "2023-01-10", dateOfBirth: "1990-03-10", address: "789 Pine Rd, City, State 12347", emergencyContact: "Lisa Johnson", emergencyPhone: "+1 555-0203", username: "mike.johnson", password: "pass123" },
  { id: "EMP004", name: "Emily Davis", role: "Electrician", department: "Electrical", site: "Metro Station", phone: "+1 555-0104", email: "emily.d@buildtrack.com", status: "active", joinDate: "2022-06-05", dateOfBirth: "1987-07-25", address: "321 Elm St, City, State 12348", emergencyContact: "Robert Davis", emergencyPhone: "+1 555-0204", username: "emily.davis", password: "pass123" },
  { id: "EMP005", name: "Robert Kim", role: "Plumber", department: "Plumbing", site: "Downtown Tower", phone: "+1 555-0105", email: "robert.k@buildtrack.com", status: "active", joinDate: "2021-11-30", dateOfBirth: "1989-12-05", address: "654 Maple Ln, City, State 12349", emergencyContact: "Anna Kim", emergencyPhone: "+1 555-0205", username: "robert.kim", password: "pass123" },
  { id: "EMP006", name: "Lisa Wang", role: "Project Manager", department: "Management", site: "Harbor Bridge", phone: "+1 555-0106", email: "lisa.w@buildtrack.com", status: "active", joinDate: "2020-04-18", dateOfBirth: "1984-09-30", address: "987 Cedar Blvd, City, State 12350", emergencyContact: "David Wang", emergencyPhone: "+1 555-0206", username: "lisa.wang", password: "pass123" },
  { id: "EMP007", name: "David Brown", role: "Crane Operator", department: "Operations", site: "Sunset Residences", phone: "+1 555-0107", email: "david.b@buildtrack.com", status: "active", joinDate: "2022-09-12", dateOfBirth: "1991-01-15", address: "147 Birch St, City, State 12351", emergencyContact: "Maria Brown", emergencyPhone: "+1 555-0207", username: "david.brown", password: "pass123" },
  { id: "EMP008", name: "Anna Wilson", role: "Safety Officer", department: "Safety", site: "Metro Station", phone: "+1 555-0108", email: "anna.w@buildtrack.com", status: "inactive", joinDate: "2023-02-28", dateOfBirth: "1986-04-08", address: "258 Spruce Ave, City, State 12352", emergencyContact: "James Wilson", emergencyPhone: "+1 555-0208", username: "anna.wilson", password: "pass123" },
  { id: "EMP009", name: "James Taylor", role: "Welder", department: "Construction", site: "Downtown Tower", phone: "+1 555-0109", email: "james.t@buildtrack.com", status: "active", joinDate: "2021-07-14", dateOfBirth: "1992-06-22", address: "369 Willow Rd, City, State 12353", emergencyContact: "Emily Taylor", emergencyPhone: "+1 555-0209", username: "james.taylor", password: "pass123" },
  { id: "EMP010", name: "Maria Garcia", role: "Architect", department: "Design", site: "Harbor Bridge", phone: "+1 555-0110", email: "maria.g@buildtrack.com", status: "active", joinDate: "2020-12-01", dateOfBirth: "1983-10-12", address: "741 Poplar Ln, City, State 12354", emergencyContact: "Carlos Garcia", emergencyPhone: "+1 555-0210", username: "maria.garcia", password: "pass123" },
];

const sites = ["All Sites", "Downtown Tower", "Harbor Bridge", "Sunset Residences", "Metro Station"];
const statuses = ["All Status", "Active", "On Leave", "Inactive"];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    department: "",
    site: "",
    phone: "",
    email: "",
    photo: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Save employees to localStorage whenever employees state changes
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  // Fetch roles and departments on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesAPI.getAll();
        setRoles(Array.isArray(response) ? response.filter(role => role.status === 'active') : []);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await departmentsAPI.getAll();
        setDepartments(Array.isArray(response) ? response.filter(dept => dept.status === 'active') : []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    fetchRoles();
    fetchDepartments();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "All Departments" || emp.department === selectedDepartment;
    const matchesSite = selectedSite === "All Sites" || emp.site === selectedSite;
    const matchesStatus = selectedStatus === "All Status" ||
      (selectedStatus === "Active" && emp.status === "active") ||
      (selectedStatus === "On Leave" && emp.status === "on-leave") ||
      (selectedStatus === "Inactive" && emp.status === "inactive");
    return matchesSearch && matchesDepartment && matchesSite && matchesStatus;
  });

  const generateCredentials = (name: string) => {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const username = lastName ? `${firstName}.${lastName}` : `${firstName}${Math.floor(Math.random() * 1000)}`;
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    return { username, password };
  };

  const handleAddEmployee = () => {
    const { username, password } = generateCredentials(newEmployee.name);
    const emp: Employee = {
      id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      ...newEmployee,
      username,
      password,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    };
    setEmployees([...employees, emp]);
    setGeneratedCredentials({ username, password });
    setNewEmployee({ name: "", role: "", department: "", site: "", phone: "", email: "", photo: "", dateOfBirth: "", address: "", emergencyContact: "", emergencyPhone: "" });
    setIsAddDialogOpen(false);
    setIsCredentialsDialogOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewEmployee({ ...newEmployee, photo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-0">Active</Badge>;
      case "on-leave":
        return <Badge className="bg-warning/10 text-warning border-0">On Leave</Badge>;
      case "inactive":
        return <Badge className="bg-muted text-muted-foreground border-0">Inactive</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Employees
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your construction workforce
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-employee">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details of the new construction worker.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="John Doe"
                  data-testid="input-employee-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    placeholder="Site Supervisor"
                    data-testid="input-employee-role"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newEmployee.department}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                  >
                    <SelectTrigger data-testid="select-employee-department">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site">Assigned Site</Label>
                <Select
                  value={newEmployee.site}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, site: value })}
                >
                  <SelectTrigger data-testid="select-employee-site">
                    <SelectValue placeholder="Select project site..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.slice(1).map((site) => (
                      <SelectItem key={site} value={site}>{site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+1 555-0100"
                    data-testid="input-employee-phone"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="john@company.com"
                    data-testid="input-employee-email"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photo">Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  data-testid="input-employee-photo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newEmployee.dateOfBirth}
                  onChange={(e) => setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })}
                  data-testid="input-employee-dob"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newEmployee.address}
                  onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  data-testid="textarea-employee-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={newEmployee.emergencyContact}
                    onChange={(e) => setNewEmployee({ ...newEmployee, emergencyContact: e.target.value })}
                    placeholder="Jane Doe"
                    data-testid="input-employee-emergency-contact"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={newEmployee.emergencyPhone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, emergencyPhone: e.target.value })}
                    placeholder="+1 555-0200"
                    data-testid="input-employee-emergency-phone"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} data-testid="button-save-employee">
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credentials Dialog */}
        <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-display">Employee Credentials Generated</DialogTitle>
              <DialogDescription>
                The following credentials have been automatically generated for the new employee. Please save them securely.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="generated-username">Username</Label>
                <Input
                  id="generated-username"
                  value={generatedCredentials.username}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="generated-password">Password</Label>
                <Input
                  id="generated-password"
                  value={generatedCredentials.password}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCredentialsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Employee Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-display">Employee Details</DialogTitle>
              <DialogDescription>
                Detailed information for {viewingEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {viewingEmployee && (
              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {getInitials(viewingEmployee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{viewingEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground">{viewingEmployee.role} • {viewingEmployee.department}</p>
                    <p className="text-sm text-muted-foreground">ID: {viewingEmployee.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{viewingEmployee.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{viewingEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Site</Label>
                    <p className="text-sm">{viewingEmployee.site}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(viewingEmployee.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Join Date</Label>
                    <p className="text-sm">{viewingEmployee.joinDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm">{viewingEmployee.dateOfBirth}</p>
                  </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label className="text-sm font-medium">Username</Label>
      <p className="text-sm">{viewingEmployee.username}</p>
    </div>
    <div>
      <Label className="text-sm font-medium">Password</Label>
      <p className="text-sm">{viewingEmployee.password}</p>
    </div>
  </div>

  <div>
    <Label className="text-sm font-medium">Address</Label>
    <p className="text-sm">{viewingEmployee.address}</p>
  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Emergency Contact</Label>
                    <p className="text-sm">{viewingEmployee.emergencyContact}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Emergency Phone</Label>
                    <p className="text-sm">{viewingEmployee.emergencyPhone}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Edit Employee</DialogTitle>
              <DialogDescription>
                Update the details for {editingEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {editingEmployee && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={editingEmployee.role}
                      onValueChange={(value) => setEditingEmployee({ ...editingEmployee, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-department">Department</Label>
                    <Select
                      value={editingEmployee.department}
                      onValueChange={(value) => setEditingEmployee({ ...editingEmployee, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-site">Assigned Site</Label>
                  <Select
                    value={editingEmployee.site}
                    onValueChange={(value) => setEditingEmployee({ ...editingEmployee, site: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.slice(1).map((site) => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editingEmployee.phone}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingEmployee.email}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
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
                placeholder="Search by name, ID, or role..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-employees"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Departments">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-site">
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
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{filteredEmployees.length} employees found</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">#{employee.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.site}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-employee-menu-${employee.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
