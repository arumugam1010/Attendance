import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}

const initialEmployees: Employee[] = [
  { id: "EMP001", name: "John Martinez", role: "Site Supervisor", department: "Construction", site: "Downtown Tower", phone: "+1 555-0101", email: "john.m@buildtrack.com", status: "active", joinDate: "2022-03-15" },
  { id: "EMP002", name: "Sarah Chen", role: "Civil Engineer", department: "Engineering", site: "Harbor Bridge", phone: "+1 555-0102", email: "sarah.c@buildtrack.com", status: "active", joinDate: "2021-08-22" },
  { id: "EMP003", name: "Mike Johnson", role: "Mason", department: "Construction", site: "Sunset Residences", phone: "+1 555-0103", email: "mike.j@buildtrack.com", status: "on-leave", joinDate: "2023-01-10" },
  { id: "EMP004", name: "Emily Davis", role: "Electrician", department: "Electrical", site: "Metro Station", phone: "+1 555-0104", email: "emily.d@buildtrack.com", status: "active", joinDate: "2022-06-05" },
  { id: "EMP005", name: "Robert Kim", role: "Plumber", department: "Plumbing", site: "Downtown Tower", phone: "+1 555-0105", email: "robert.k@buildtrack.com", status: "active", joinDate: "2021-11-30" },
  { id: "EMP006", name: "Lisa Wang", role: "Project Manager", department: "Management", site: "Harbor Bridge", phone: "+1 555-0106", email: "lisa.w@buildtrack.com", status: "active", joinDate: "2020-04-18" },
  { id: "EMP007", name: "David Brown", role: "Crane Operator", department: "Operations", site: "Sunset Residences", phone: "+1 555-0107", email: "david.b@buildtrack.com", status: "active", joinDate: "2022-09-12" },
  { id: "EMP008", name: "Anna Wilson", role: "Safety Officer", department: "Safety", site: "Metro Station", phone: "+1 555-0108", email: "anna.w@buildtrack.com", status: "inactive", joinDate: "2023-02-28" },
  { id: "EMP009", name: "James Taylor", role: "Welder", department: "Construction", site: "Downtown Tower", phone: "+1 555-0109", email: "james.t@buildtrack.com", status: "active", joinDate: "2021-07-14" },
  { id: "EMP010", name: "Maria Garcia", role: "Architect", department: "Design", site: "Harbor Bridge", phone: "+1 555-0110", email: "maria.g@buildtrack.com", status: "active", joinDate: "2020-12-01" },
];

const departments = ["All Departments", "Construction", "Engineering", "Electrical", "Plumbing", "Management", "Operations", "Safety", "Design"];
const sites = ["All Sites", "Downtown Tower", "Harbor Bridge", "Sunset Residences", "Metro Station"];
const statuses = ["All Status", "Active", "On Leave", "Inactive"];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    department: "",
    site: "",
    phone: "",
    email: "",
  });

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

  const handleAddEmployee = () => {
    const emp: Employee = {
      id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      ...newEmployee,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    };
    setEmployees([...employees, emp]);
    setNewEmployee({ name: "", role: "", department: "", site: "", phone: "", email: "" });
    setIsAddDialogOpen(false);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
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
                      {departments.slice(1).map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                data-testid={`employee-card-${employee.id}`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{employee.name}</p>
                      <span className="text-xs text-muted-foreground">#{employee.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <HardHat className="h-3 w-3" />
                      {employee.role} • {employee.department}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {employee.site}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {employee.phone}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {employee.email}
                    </p>
                  </div>
                  {getStatusBadge(employee.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-employee-menu-${employee.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
