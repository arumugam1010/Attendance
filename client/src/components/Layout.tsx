import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileBarChart,
  Building2,
  Settings,
  Bell,
  Menu,
  LogOut,
  User,
  HardHat,
  ChevronRight,

  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const getNavigation = (role: 'admin' | 'employee') => {
  const baseNavigation = [
    { name: 'Dashboard', href: `/${role}/dashboard`, icon: LayoutDashboard },
  ];

  if (role === 'admin') {
    return [
      ...baseNavigation,
      { name: 'Employees', href: `/${role}/employees`, icon: Users },
      { name: 'Work Assignment', href: `/${role}/work-assignments`, icon: ClipboardList },
      { name: 'Departments', href: `/${role}/departments`, icon: Building2 },
      { name: 'Attendance History', href: `/${role}/attendance`, icon: CalendarCheck },
      // { name: 'Reports', href: `/${role}/reports`, icon: FileBarChart },
      // { name: 'Sites', href: `/${role}/sites`, icon: Building2 },
    ];
  } else {
    return [
      ...baseNavigation,
      { name: 'Profile', href: `/${role}/profile`, icon: User },
      { name: 'Mark Attendance', href: `/${role}/attendance`, icon: CalendarCheck },
      { name: 'Assigned Work', href: `/${role}/assigned-work`, icon: ClipboardList },
      { name: 'Attendance History', href: `/${role}/history`, icon: CalendarCheck },
    ];
  }
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navigation = getNavigation(user?.role || 'admin');

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.name} to={item.href}>
            <a
              onClick={onClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </a>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/">
            <a className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary">
                <HardHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display text-gradient bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                  BuildTrack
                </h1>
                <p className="text-xs text-sidebar-foreground/60">Attendance System</p>
              </div>
            </a>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        {/* <div className="p-4 border-t border-sidebar-border">
          <Link to="/settings">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all">
              <Settings className="h-5 w-5" />
              Settings
            </a>
          </Link>
        </div> */}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
                  <div className="p-6 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary">
                        <HardHat className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold font-display">BuildTrack</h1>
                        <p className="text-xs text-sidebar-foreground/60">Attendance System</p>
                      </div>
                    </div>
                  </div>
                  <nav className="p-4 space-y-1">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold font-display">
                  {navigation.find(n => n.href === location)?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-[10px]">
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
