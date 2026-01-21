import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { attendanceAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';

interface Employee {
  id: string;
  name: string;
  role: string;
  site: string;
  siteLat?: number;
  siteLng?: number;
}

interface Site {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
}

interface AttendanceMarkProps {
  onAttendanceMarked?: () => void;
  onClose?: () => void;
}

export default function AttendanceMark({ onAttendanceMarked, onClose }: AttendanceMarkProps) {
  const { user } = useAuth();
  const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out'>('check-in');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<{ date: string; time: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employeeSite, setEmployeeSite] = useState<Site | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    // Fetch employee site information
    const fetchEmployeeSite = async () => {
      if (user?.id) {
        try {
          const employees = JSON.parse(localStorage.getItem('employees') || '[]');
          const employee = employees.find((emp: Employee) => emp.id === user.id);
          if (employee?.site) {
            const sites = JSON.parse(localStorage.getItem('sites') || '[]');
            const site = sites.find((s: Site) => s.id === employee.site);
            setEmployeeSite(site || null);
          }
        } catch (error) {
          console.error('Error fetching employee site:', error);
        }
      }
    };

    fetchEmployeeSite();
  }, [user?.id]);

  // Auto-fetch location when component mounts (modal opens)
  useEffect(() => {
    const autoFetchLocation = async () => {
      setIsLoadingLocation(true);
      try {
        await getLocation();
      } catch (error) {
        // Error is already set in getLocation
      } finally {
        setIsLoadingLocation(false);
      }
    };

    autoFetchLocation();
  }, []);

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const now = new Date();
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          console.log('📍 GPS Location captured:', locationData);
          console.log('🎯 GPS Accuracy:', position.coords.accuracy, 'meters');
          
          setLocation(locationData);
          setCurrentDateTime({
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
          });
          setError('');
          resolve(locationData);
        },
        (err) => {
          let errorMessage = 'Unable to retrieve location: ' + err.message;

          // Provide more user-friendly error messages
          if (err.code === 1) {
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings and try again.';
          } else if (err.code === 2) {
            errorMessage = 'Location information is unavailable. Please check your device settings.';
          } else if (err.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          } else if (err.message.includes('Only secure origins are allowed')) {
            errorMessage = 'Location services require a secure connection (HTTPS). Please ensure you are accessing the application over HTTPS.';
          }

          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const verifyLocation = (currentLocation: { lat: number; lng: number }) => {
    if (!employeeSite?.lat || !employeeSite?.lng) {
      // If no site coordinates, allow attendance
      return true;
    }

    // Calculate distance between current location and site location
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      employeeSite.lat,
      employeeSite.lng
    );

    // Allow attendance if within 500 meters (adjustable)
    return distance <= 0.5; // 0.5 km = 500 meters
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // First, get the current location
      const currentLocation = await getLocation();

      // Verify location is at assigned site
      if (!verifyLocation(currentLocation)) {
        setError('You must be at your assigned site to mark attendance');
        setLocation(null);
        setCurrentDateTime(null);
        return;
      }

      const currentTime = currentDateTime?.time || new Date().toLocaleTimeString();
      const currentDate = new Date().toISOString().split('T')[0];

      if (attendanceType === 'check-in') {
        // Check if user already has a check-in for today
        const existingAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const todayRecord = existingAttendance.find((record: any) =>
          record.employeeId === user.id && record.date === currentDate && record.checkIn && !record.checkOut
        );

        if (todayRecord) {
          setError('You have already checked in today. Please check out instead.');
          return;
        }

        // Create new check-in record
        const attendanceData = {
          employeeId: user.id,
          employeeName: user.name || 'Unknown Employee',
          role: user.role || 'Unknown Role',
          assignedLocation: employeeSite?.name || 'Unknown Site',
          attendanceLocation: employeeSite?.name || 'Unknown Site',
          status: 'present',
          checkIn: currentTime,
          checkOut: null,
          date: currentDate,
          location: currentLocation,
          timestamp: new Date().toISOString(),
        };

        // Use API to mark attendance
        await attendanceAPI.markAttendance(attendanceData);
        setSuccess('Checked in successfully!');
      } else {
        // Check-out: Find today's check-in record and update it
        const existingAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const todayRecord = existingAttendance.find((record: any) =>
          record.employeeId === user.id && record.date === currentDate && record.checkIn && !record.checkOut
        );

        if (!todayRecord) {
          setError('No check-in record found for today. Please check in first.');
          return;
        }

        // Update the record with check-out time
        const updatedRecord = {
          ...todayRecord,
          checkOut: currentTime,
          location: currentLocation, // Update location for check-out as well
          timestamp: new Date().toISOString(),
        };

        // Update in localStorage
        const updatedAttendance = existingAttendance.map((record: any) =>
          record.id === todayRecord.id ? updatedRecord : record
        );
        localStorage.setItem('attendance', JSON.stringify(updatedAttendance));

        setSuccess('Checked out successfully!');
      }

      // Call the callback to refresh parent components
      if (onAttendanceMarked) {
        onAttendanceMarked();
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000);

      // Reset form
      setAttendanceType('check-in');
      setLocation(null);
      setCurrentDateTime(null);
    } catch (err: any) {
      setError(err.message || 'Failed to mark attendance');
      setLocation(null);
      setCurrentDateTime(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">
          {attendanceType === 'check-in' ? 'Check In' : 'Check Out'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {attendanceType === 'check-in'
            ? 'Record your check-in time with location verification'
            : 'Record your check-out time with location verification'
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-success text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {success}
            <div className="mt-2">
              <Link href="/employee/history" className="text-success underline hover:no-underline">
                View your attendance history
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Attendance Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <div className="p-3 border rounded-md bg-muted">
              <p className="font-medium">{user?.name || 'Unknown Employee'}</p>
              <p className="text-sm text-muted-foreground">{user?.role || 'Unknown Role'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Attendance Type</Label>
            <Select value={attendanceType} onValueChange={(value: 'check-in' | 'check-out') => setAttendanceType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check-in">Check In</SelectItem>
                <SelectItem value="check-out">Check Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-time">Current Time</Label>
            <div className="p-3 border rounded-md bg-muted">
              <p className="font-medium">
                {isLoadingLocation ? 'Fetching...' : (currentDateTime?.time || 'Not available')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-location">Current Location</Label>
            <div className="p-3 border rounded-md bg-muted">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {isLoadingLocation ? 'Fetching location...' :
                   location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Location not available'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!user || !location || isSubmitting || isLoadingLocation}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Marking Attendance...
            </>
          ) : (
            'Check In'
          )}
        </Button>
      </div>
    </div>
  );
}
