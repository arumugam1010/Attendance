import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { attendanceAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Employee {
  id: string;
  name: string;
  role: string;
  site: string;
}

interface Site {
  id: string;
  name: string;
}

export default function AttendanceMark() {
  const { user } = useAuth();
  const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out'>('check-in');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<{ date: string; time: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');





  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const now = new Date();
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCurrentDateTime({
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
        });
        setError('');
      },
      (err) => {
        setError('Unable to retrieve location: ' + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleSubmit = async () => {
    if (!user || !location) {
      setError('Please select attendance type and capture location');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const attendanceData = {
        employeeId: user.id,
        type: attendanceType,
        location: location,
        date: currentDateTime?.date || new Date().toLocaleDateString(),
        time: currentDateTime?.time || new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
      };

      await attendanceAPI.markAttendance(attendanceData);
      setSuccess('Attendance marked successfully!');

      // Reset form
      setAttendanceType('check-in');
      setLocation(null);
      setCurrentDateTime(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">
          Mark Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Record your attendance with location verification
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
          <AlertDescription>{success}</AlertDescription>
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

          <div className="flex gap-2">
            <Button
              variant={location ? "secondary" : "outline"}
              onClick={getLocation}
              className="flex-1"
              disabled={!!location}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {location ? 'Location Captured' : 'Get Location'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Ready to Submit</h3>
              <p className="text-sm text-muted-foreground">
                Employee: {user?.name || 'Not logged in'} •
                Type: {attendanceType === 'check-in' ? 'Check In' : 'Check Out'} •
                Location: {location ? 'Captured' : 'Not captured'}
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!user || !location || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Mark Attendance'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
