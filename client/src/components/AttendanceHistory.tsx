



import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceAPI, employeesAPI, sitesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Reverse geocoding function using Nominatim (OpenStreetMap)
// For more accurate results, add VITE_GOOGLE_MAPS_API_KEY to .env file
// Get API key from: https://console.cloud.google.com/google/maps-apis
const reverseGeocode = async (lat: number, lng: number): Promise<{address: string, source: string}> => {
  console.log('🔍 Reverse geocoding coordinates:', { lat, lng });
  
  try {
    // Try Google Maps Geocoding first if API key is available
    const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      try {
        console.log('🌐 Trying Google Maps geocoding...');
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('🌐 Google Maps response:', data);
          if (data.results && data.results.length > 0) {
            console.log('✅ Google Maps found address:', data.results[0].formatted_address);
            return {
              address: data.results[0].formatted_address,
              source: 'google'
            };
          }
        }
      } catch (error) {
        console.warn('❌ Google Maps geocoding failed:', error);
      }
    }

    // Fallback to Nominatim with maximum detail
    console.log('🗺️ Trying OpenStreetMap geocoding...');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=21&addressdetails=1&extratags=1&namedetails=1`,
      {
        headers: {
          'User-Agent': 'BuildTrack-Attendance-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    console.log('🗺️ OpenStreetMap response:', data);
    
    // Extract detailed address from components
    if (data && data.address) {
      const addr = data.address;
      const parts = [];
      
      // Build comprehensive address from components
      if (addr.house_number) parts.push(addr.house_number);
      if (addr.road || addr.footway || addr.pedestrian || addr.path) parts.push(addr.road || addr.footway || addr.pedestrian || addr.path);
      if (addr.neighbourhood || addr.suburb || addr.subdivision) parts.push(addr.neighbourhood || addr.suburb || addr.subdivision);
      if (addr.city_district || addr.borough) parts.push(addr.city_district || addr.borough);
      if (addr.city || addr.town || addr.village || addr.hamlet) parts.push(addr.city || addr.town || addr.village || addr.hamlet);
      if (addr.state || addr.region) parts.push(addr.state || addr.region);
      if (addr.postcode) parts.push(addr.postcode);
      if (addr.country) parts.push(addr.country);
      
      // If we have detailed components, use them; otherwise use display_name
      if (parts.length > 0) {
        const detailedAddress = parts.join(', ');
        console.log('✅ OpenStreetMap found detailed address:', detailedAddress);
        return {
          address: detailedAddress,
          source: 'osm'
        };
      }
    }
    
    // Fallback to display_name if available
    const fallbackAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    console.log('⚠️ Using fallback address:', fallbackAddress);
    return {
      address: fallbackAddress,
      source: 'osm'
    };
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    return {
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      source: 'coords'
    };
  }
};

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  assignedLocation: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'half-day';
  checkIn: string | null;
  checkOut: string | null;
  date: string;
  photo?: string;
  location?: { lat: number; lng: number };
}

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('All Employees');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<{[key: string]: {address: string, source: string}}>({});
  const [addressLoading, setAddressLoading] = useState<{[key: string]: boolean}>({});
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [date]);

  // Cleanup addresses when date changes
  useEffect(() => {
    setAddresses({});
    setAddressLoading({});
  }, [date]);

  const fetchData = async () => {
    try {
      let attendanceRes;
      if (user?.role === 'employee') {
        attendanceRes = await attendanceAPI.getByEmployee(user.id);
      } else {
        attendanceRes = await attendanceAPI.getAll();
      }

      const employeesRes = await employeesAPI.getAll();
      const sitesRes = await sitesAPI.getAll();

      const attendanceData = Array.isArray(attendanceRes) ? attendanceRes : [];
      const employeesData = Array.isArray(employeesRes) ? employeesRes : [];

      // Enrich attendance data with employee names and roles
      const enrichedAttendance = attendanceData.map((record: any) => {
        const employee = employeesData.find((emp: any) => emp.id === record.employeeId);
        return {
          ...record,
          employeeName: employee ? employee.name : 'Unknown Employee',
          role: employee ? employee.role : 'Unknown Role',
          assignedLocation: employee ? employee.site : 'Unknown Site',
        };
      });

      setAttendance(enrichedAttendance);
      setEmployees(employeesData);
      setSites(Array.isArray(sitesRes) ? sitesRes : []);

      // Fetch addresses for records with location data
      fetchAddresses(enrichedAttendance);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAttendance([]);
      setEmployees([]);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch addresses for attendance records with location data
  const fetchAddresses = async (attendanceData: any[]) => {
    const recordsWithLocation = attendanceData.filter(record => record.location);
    
    for (const record of recordsWithLocation) {
      if (!addresses[record.id]) {
        setAddressLoading(prev => ({ ...prev, [record.id]: true }));
        try {
          const result = await reverseGeocode(record.location.lat, record.location.lng);
          setAddresses(prev => ({ ...prev, [record.id]: result }));
          
          // Small delay to avoid overwhelming the geocoding service
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          setAddresses(prev => ({ ...prev, [record.id]: { address: 'Address not available', source: 'error' } }));
        } finally {
          setAddressLoading(prev => ({ ...prev, [record.id]: false }));
        }
      }
    }
  };

  const handleManualAddressUpdate = (recordId: string, newAddress: string) => {
    setAddresses(prev => ({
      ...prev,
      [recordId]: {
        address: newAddress,
        source: 'manual'
      }
    }));
    setEditingLocation(null);
    setManualAddress('');
    
    // In a real app, this would update the backend
    console.log('📝 Manual address updated for record:', recordId, newAddress);
  };

  const testGeocoding = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('🧪 Testing geocoding with current location:', { latitude, longitude });
        
        try {
          const result = await reverseGeocode(latitude, longitude);
          console.log('🧪 Test result:', result);
          alert(`Test Geocoding Result:\nCoordinates: ${latitude.toFixed(8)}, ${longitude.toFixed(8)}\nAddress: ${result.address}\nSource: ${result.source}`);
        } catch (error) {
          console.error('🧪 Test failed:', error);
          alert('Geocoding test failed: ' + error);
        }
      });
    } else {
      alert('Geolocation not supported');
    }
  };
  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      // Compare dates properly - record.date is in YYYY-MM-DD format
      const recordDate = record.date;
      const selectedDateStr = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
      const matchesDate = recordDate === selectedDateStr;

      const matchesSearch = user?.role === 'employee' 
        ? true // Employees see all their records, no search needed
        : (record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEmployee = user?.role === 'employee' 
        ? record.employeeId === user.id 
        : (selectedEmployee === 'All Employees' || record.employeeId === selectedEmployee);
      const matchesSite = user?.role === 'employee' 
        ? true // Employees see their records regardless of site filter
        : (selectedSite === 'All Sites' || record.assignedLocation === selectedSite);
      const matchesStatus = user?.role === 'employee' 
        ? (selectedStatus === 'All Status' || record.status === selectedStatus.toLowerCase().replace(' ', '-'))
        : (selectedStatus === 'All Status' || record.status === selectedStatus.toLowerCase().replace(' ', '-'));

      return matchesDate && matchesSearch && matchesEmployee && matchesSite && matchesStatus;
    });
  }, [attendance, date, searchQuery, selectedEmployee, selectedSite, selectedStatus, user]);

  const stats = useMemo(() => ({
    present: filteredAttendance.filter(r => r.status === 'present').length,
    absent: filteredAttendance.filter(r => r.status === 'absent').length,
    late: filteredAttendance.filter(r => r.status === 'late').length,
    leave: filteredAttendance.filter(r => r.status === 'leave').length,
    halfDay: filteredAttendance.filter(r => r.status === 'half-day').length,
  }), [filteredAttendance]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="status-present border">Present</Badge>;
      case 'absent':
        return <Badge className="status-absent border">Absent</Badge>;
      case 'late':
        return <Badge className="status-late border">Late</Badge>;
      case 'leave':
        return <Badge className="status-leave border">Leave</Badge>;
      case 'half-day':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">Half Day</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading attendance history...</div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Attendance History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage attendance records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
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
          {user?.role === 'admin' && (
            <Button onClick={testGeocoding} variant="outline" size="sm">
              🧪 Test Geocoding
            </Button>
          )}
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
            {user?.role === 'admin' && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Employees">All Employees</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Sites">All Sites</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.name}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Leave">Leave</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {user?.role === 'employee' && (
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Leave">Leave</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assigned Location</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Location & Address
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      GPS coordinates + reverse geocoded address
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check In</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b hover:bg-muted/50 transition-colors"
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
                    <td className="py-3 px-4 text-sm">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {record.assignedLocation}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.location ? (
                        <div className="space-y-2">
                          <div className="font-mono text-xs bg-muted/50 p-2 rounded border">
                            <div className="flex items-center gap-1">
                              📍 <strong>Coordinates:</strong>
                            </div>
                            <div className="ml-4">Lat: {record.location.lat?.toFixed(8)}</div>
                            <div className="ml-4">Lng: {record.location.lng?.toFixed(8)}</div>
                          </div>
                          <div className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                            {addressLoading[record.id] ? (
                              <span className="flex items-center gap-1">
                                <div className="w-3 h-3 border border-primary/30 border-t-primary/60 rounded-full animate-spin"></div>
                                Getting location details...
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  🏠 <strong>Address:</strong> {addresses[record.id]?.address || 'Fetching location...'}
                                </div>
                                {addresses[record.id]?.source === 'google' && (
                                  <div className="text-green-600 text-xs flex items-center gap-1">
                                    ✓ Verified by Google Maps
                                  </div>
                                )}
                                {addresses[record.id]?.source === 'osm' && (
                                  <div className="text-blue-600 text-xs flex items-center gap-1">
                                    ○ From OpenStreetMap
                                  </div>
                                )}
                                {addresses[record.id]?.source === 'coords' && (
                                  <div className="text-orange-600 text-xs flex items-center gap-1">
                                    ⚠️ Coordinates only (geocoding failed)
                                  </div>
                                )}
                                {user?.role === 'admin' && !addressLoading[record.id] && (
                                  <div className="mt-1">
                                    {editingLocation === record.id ? (
                                      <div className="flex gap-1">
                                        <input
                                          type="text"
                                          value={manualAddress}
                                          onChange={(e) => setManualAddress(e.target.value)}
                                          placeholder="Enter correct address"
                                          className="text-xs px-2 py-1 border rounded flex-1"
                                        />
                                        <button
                                          onClick={() => handleManualAddressUpdate(record.id, manualAddress)}
                                          className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingLocation(null);
                                            setManualAddress('');
                                          }}
                                          className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingLocation(record.id);
                                          setManualAddress(addresses[record.id]?.address || '');
                                        }}
                                        className="text-xs text-primary hover:underline"
                                      >
                                        ✏️ Edit address
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">📍 Location not recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.checkIn ? (
                        <span className="text-sm font-medium">
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
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for the selected date and filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
