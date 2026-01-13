import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, HardHat } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check for demo admin credentials
      if (username === 'admin' && password === 'admin123') {
        // Simulate successful login for demo
        const mockUser = { id: '1', username: 'admin', name: 'Admin', role: 'admin' as 'admin' | 'employee' };
        const mockToken = 'demo-token';
        login(mockUser, mockToken);

        // Redirect to admin dashboard
        setLocation('/admin/dashboard');
      } else {
        // Try API login first
        try {
          const response = await authAPI.login({ username, password });
          login({ ...response.user, role: response.user.role as 'admin' | 'employee' }, response.token);

          // Redirect based on role
          const redirectPath = response.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
          setLocation(redirectPath);
        } catch (apiError) {
          // If API fails, check against local employee data (for demo purposes)
          // In a real app, this would be handled by the backend
          const employees = JSON.parse(localStorage.getItem('employees') || '[]');
          const employee = employees.find((emp: any) => emp.username === username && emp.password === password);

          if (employee) {
            const mockUser = {
              id: employee.id,
              username: employee.username,
              name: employee.name,
              role: 'employee' as 'admin' | 'employee'
            };
            const mockToken = 'employee-token-' + employee.id;
            login(mockUser, mockToken);

            // Redirect to employee dashboard
            setLocation('/employee/dashboard');
          } else {
            throw new Error('Invalid credentials');
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary">
              <HardHat className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">BuildTrack</CardTitle>
          <CardDescription>
            Construction Attendance Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Demo credentials: admin / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
