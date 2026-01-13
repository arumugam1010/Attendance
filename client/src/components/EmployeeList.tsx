import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Search,
  Plus,
  Users,
  Phone,
  Mail,
  MapPin,
  HardHat,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { employeesAPI, departmentsAPI } from '@/services/api';

interface Employee {
  id: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  address: {
    doorNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  aadharNumber: string;
  designation: string;
  department: string;
  site: string;
  dateOfJoining: string;
  employmentType: 'Permanent' | 'Contract' | 'Daily Wage';
  status: 'Active' | 'Inactive';
  photo?: string;
  username: string;
  password: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const sites = ["All Sites", "Downtown Tower", "Harbor Bridge", "Sunset Residences", "Metro Station"];
const statuses = ["All Status", "Active", "On Leave", "Inactive"];

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' });
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    fatherName: "",
    dateOfBirth: "",
    gender: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    address: {
      doorNo: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    aadharNumber: "",
    designation: "",
    department: "",
    site: "",
    dateOfJoining: "",
    employmentType: "Permanent" as 'Permanent' | 'Contract' | 'Daily Wage',
    status: "Active" as 'Active' | 'Inactive',
    photo: "",
  });
  const [loading, setLoading] = useState(true);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "All Departments" || emp.department === selectedDepartment;
    const matchesSite = selectedSite === "All Sites" || emp.site === selectedSite;
    const matchesStatus = selectedStatus === "All Status" ||
      (selectedStatus === "Active" && emp.status === "Active") ||
      (selectedStatus === "On Leave" && emp.status === "Inactive") ||
      (selectedStatus === "Inactive" && emp.status === "Inactive");
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

  const handleAddEmployee = async () => {
    try {
      const { username, password } = generateCredentials(newEmployee.name);
      const employeeData = {
        ...newEmployee,
        username,
        password,
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
      };
      const createdEmployee = await employeesAPI.create(employeeData);
      setGeneratedCredentials({
        username,
        password
      });
      setNewEmployee({
        name: "",
        fatherName: "",
        dateOfBirth: "",
        gender: "",
        mobile: "",
        alternateMobile: "",
        email: "",
        address: {
          doorNo: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
        aadharNumber: "",
        designation: "",
        department: "",
        site: "",
        dateOfJoining: "",
        employmentType: "Permanent" as 'Permanent' | 'Contract' | 'Daily Wage',
        status: "Active" as 'Active' | 'Inactive',
        photo: "",
      });
      setIsAddDialogOpen(false);
      setIsCredentialsDialogOpen(true);
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await employeesAPI.delete(id);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details of the new construction worker.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Photo Upload */}
              <div className="grid gap-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) { // 2MB limit
                        alert('File size must be less than 2MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setNewEmployee({ ...newEmployee, photo: e.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {newEmployee.photo && (
                  <div className="mt-2">
                    <img src={newEmployee.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border" />
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fatherName">Father / Guardian Name</Label>
                  <Input
                    id="fatherName"
                    value={newEmployee.fatherName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, fatherName: e.target.value })}
                    placeholder="John Doe Sr."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newEmployee.dateOfBirth}
                    onChange={(e) => setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newEmployee.gender}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={newEmployee.mobile}
                    onChange={(e) => setNewEmployee({ ...newEmployee, mobile: e.target.value })}
                    placeholder="+1 555-0100"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="alternateMobile">Alternate Mobile Number</Label>
                  <Input
                    id="alternateMobile"
                    value={newEmployee.alternateMobile}
                    onChange={(e) => setNewEmployee({ ...newEmployee, alternateMobile: e.target.value })}
                    placeholder="+1 555-0101"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="john@company.com"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="doorNo">Door No</Label>
                    <Input
                      id="doorNo"
                      value={newEmployee.address.doorNo}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, doorNo: e.target.value }
                      })}
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={newEmployee.address.street}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, street: e.target.value }
                      })}
                      placeholder="Main Street"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newEmployee.address.city}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, city: e.target.value }
                      })}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newEmployee.address.state}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, state: e.target.value }
                      })}
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={newEmployee.address.pincode}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, pincode: e.target.value }
                      })}
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Government ID */}
              <div className="grid gap-2">
                <Label htmlFor="aadharNumber">Aadhar / Govt ID Number</Label>
                <Input
                  id="aadharNumber"
                  value={newEmployee.aadharNumber}
                  onChange={(e) => setNewEmployee({ ...newEmployee, aadharNumber: e.target.value })}
                  placeholder="XXXX-XXXX-XXXX"
                  required
                />
              </div>

              {/* Employment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    placeholder="Site Supervisor"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newEmployee.department}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                  >
                    <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="site">Site / Project Name</Label>
                  <Select
                    value={newEmployee.site}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, site: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project site..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.slice(1).map((site) => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={newEmployee.dateOfJoining}
                    onChange={(e) => setNewEmployee({ ...newEmployee, dateOfJoining: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    value={newEmployee.employmentType}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, employmentType: value as 'Permanent' | 'Contract' | 'Daily Wage' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Daily Wage">Daily Wage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newEmployee.status}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value as 'Active' | 'Inactive' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>
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

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-display">Employee Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedEmployee?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={selectedEmployee.photo} alt={selectedEmployee.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {getInitials(selectedEmployee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground">Employee ID: #{selectedEmployee.id}</p>
                    {getStatusBadge(selectedEmployee.status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Designation</Label>
                    <Input value={selectedEmployee.designation} readOnly className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Input value={selectedEmployee.department} readOnly className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Site</Label>
                    <Input value={selectedEmployee.site} readOnly className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Join Date</Label>
                    <Input value={selectedEmployee.dateOfJoining} readOnly className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mobile</Label>
                    <Input value={selectedEmployee.mobile} readOnly className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={selectedEmployee.email} readOnly className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Username</Label>
                    <Input value={selectedEmployee.username} readOnly className="bg-muted" />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDetailsDialogOpen(false)}>
                Close
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
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
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
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={employee.photo} alt={employee.name} />
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
                      {employee.designation} • {employee.department}
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
                      {employee.mobile}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {employee.email}
                    </p>
                  </div>
                  {getStatusBadge(employee.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsViewDetailsDialogOpen(true);
                        }}
                      >
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
