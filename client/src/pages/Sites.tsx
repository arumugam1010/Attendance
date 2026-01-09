import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  MapPin,
  Users,
  Calendar,
  Clock,
  HardHat,
  TrendingUp,
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

interface ProjectSite {
  id: string;
  name: string;
  location: string;
  status: "active" | "on-hold" | "completed";
  progress: number;
  workers: number;
  startDate: string;
  expectedEnd: string;
  projectManager: string;
  todayAttendance: number;
}

const initialSites: ProjectSite[] = [
  {
    id: "SITE001",
    name: "Downtown Tower Project",
    location: "123 Main St, Downtown",
    status: "active",
    progress: 68,
    workers: 45,
    startDate: "2024-01-15",
    expectedEnd: "2025-06-30",
    projectManager: "Lisa Wang",
    todayAttendance: 42,
  },
  {
    id: "SITE002",
    name: "Harbor Bridge Renovation",
    location: "Harbor District, Pier 12",
    status: "active",
    progress: 45,
    workers: 32,
    startDate: "2024-03-01",
    expectedEnd: "2025-12-15",
    projectManager: "Mark Anderson",
    todayAttendance: 30,
  },
  {
    id: "SITE003",
    name: "Sunset Residences",
    location: "456 Sunset Blvd",
    status: "active",
    progress: 82,
    workers: 28,
    startDate: "2023-09-20",
    expectedEnd: "2025-03-31",
    projectManager: "Sarah Chen",
    todayAttendance: 26,
  },
  {
    id: "SITE004",
    name: "Metro Station Extension",
    location: "Central Transit Hub",
    status: "active",
    progress: 23,
    workers: 35,
    startDate: "2024-06-01",
    expectedEnd: "2026-08-30",
    projectManager: "John Martinez",
    todayAttendance: 32,
  },
  {
    id: "SITE005",
    name: "Riverside Mall",
    location: "789 River Rd",
    status: "on-hold",
    progress: 15,
    workers: 0,
    startDate: "2024-04-15",
    expectedEnd: "2026-01-15",
    projectManager: "Emily Davis",
    todayAttendance: 0,
  },
  {
    id: "SITE006",
    name: "City Library Expansion",
    location: "Downtown Cultural District",
    status: "completed",
    progress: 100,
    workers: 0,
    startDate: "2023-02-01",
    expectedEnd: "2024-08-15",
    projectManager: "Robert Kim",
    todayAttendance: 0,
  },
];

export default function Sites() {
  const [sites, setSites] = useState<ProjectSite[]>(initialSites);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [newSite, setNewSite] = useState({
    name: "",
    location: "",
    projectManager: "",
    expectedEnd: "",
  });

  const filteredSites = sites.filter((site) => {
    if (statusFilter === "all") return true;
    return site.status === statusFilter;
  });

  const handleAddSite = () => {
    const site: ProjectSite = {
      id: `SITE${String(sites.length + 1).padStart(3, '0')}`,
      name: newSite.name,
      location: newSite.location,
      status: "active",
      progress: 0,
      workers: 0,
      startDate: new Date().toISOString().split('T')[0],
      expectedEnd: newSite.expectedEnd,
      projectManager: newSite.projectManager,
      todayAttendance: 0,
    };
    setSites([...sites, site]);
    setNewSite({ name: "", location: "", projectManager: "", expectedEnd: "" });
    setIsAddDialogOpen(false);
  };

  const handleDeleteSite = (id: string) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-0">Active</Badge>;
      case "on-hold":
        return <Badge className="bg-warning/10 text-warning border-0">On Hold</Badge>;
      case "completed":
        return <Badge className="bg-primary/10 text-primary border-0">Completed</Badge>;
      default:
        return null;
    }
  };

  const stats = {
    total: sites.length,
    active: sites.filter(s => s.status === "active").length,
    onHold: sites.filter(s => s.status === "on-hold").length,
    completed: sites.filter(s => s.status === "completed").length,
    totalWorkers: sites.reduce((acc, s) => acc + s.workers, 0),
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Project Sites
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage construction sites and track progress
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-site">
              <Plus className="h-4 w-4" />
              Add New Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Project Site</DialogTitle>
              <DialogDescription>
                Enter the details for the new construction project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Project Name</Label>
                <Input
                  id="siteName"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  placeholder="New Building Project"
                  data-testid="input-site-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newSite.location}
                  onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                  placeholder="123 Construction Ave"
                  data-testid="input-site-location"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manager">Project Manager</Label>
                <Input
                  id="manager"
                  value={newSite.projectManager}
                  onChange={(e) => setNewSite({ ...newSite, projectManager: e.target.value })}
                  placeholder="John Doe"
                  data-testid="input-site-manager"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Expected Completion</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newSite.expectedEnd}
                  onChange={(e) => setNewSite({ ...newSite, expectedEnd: e.target.value })}
                  data-testid="input-site-end-date"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSite} data-testid="button-save-site">
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Sites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <HardHat className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.onHold}</p>
              <p className="text-xs text-muted-foreground">On Hold</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stats.totalWorkers}</p>
              <p className="text-xs text-muted-foreground">Total Workers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display">All Project Sites</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSites.map((site) => (
              <div
                key={site.id}
                className="p-5 rounded-xl border bg-card hover:shadow-lg transition-all"
                data-testid={`site-card-${site.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{site.name}</h3>
                        {getStatusBadge(site.status)}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {site.location}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {site.workers} workers
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(site.expectedEnd).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardHat className="h-3 w-3" />
                          PM: {site.projectManager}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-2xl font-bold font-display">{site.progress}%</span>
                      </div>
                      <Progress value={site.progress} className="w-32 h-2 mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">Project Progress</p>
                    </div>
                    {site.status === "active" && (
                      <div className="text-right border-l pl-6">
                        <p className="text-2xl font-bold font-display">{site.todayAttendance}/{site.workers}</p>
                        <p className="text-xs text-muted-foreground">Today's Attendance</p>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-site-menu-${site.id}`}>
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
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteSite(site.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
