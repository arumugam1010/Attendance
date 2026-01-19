import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust as needed

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Employees API
export const employeesAPI = {
  getAll: async () => {
    // For demo purposes, use localStorage instead of API
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    if (employees.length === 0) {
      // Initialize with sample employees
      const sampleEmployees = [
        { id: '1', name: 'Admin', username: 'admin', role: 'admin', site: 'Downtown Tower' },
        { id: 'EMP001', name: 'John Martinez', username: 'john', role: 'employee', site: 'Downtown Tower' },
        { id: 'EMP002', name: 'Sarah Chen', username: 'sarah', role: 'employee', site: 'Harbor Bridge' },
        { id: 'EMP003', name: 'Mike Johnson', username: 'mike', role: 'employee', site: 'Sunset Residences' },
      ];
      localStorage.setItem('employees', JSON.stringify(sampleEmployees));
      return sampleEmployees;
    }
    return employees;
  },
  getById: async (id: string) => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    return employees.find((emp: any) => emp.id === id);
  },
  create: async (employee: any) => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
    };
    employees.push(newEmployee);
    localStorage.setItem('employees', JSON.stringify(employees));
    return newEmployee;
  },
  update: async (id: string, employee: any) => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const index = employees.findIndex((emp: any) => emp.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...employee };
      localStorage.setItem('employees', JSON.stringify(employees));
      return employees[index];
    }
    throw new Error('Employee not found');
  },
  delete: async (id: string) => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const filteredEmployees = employees.filter((emp: any) => emp.id !== id);
    localStorage.setItem('employees', JSON.stringify(filteredEmployees));
    return { success: true };
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async () => {
    // For demo purposes, use localStorage instead of API
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    return attendance;
  },
  markAttendance: async (data: any) => {
    // For demo purposes, use localStorage instead of API
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const newRecord = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    attendance.push(newRecord);
    localStorage.setItem('attendance', JSON.stringify(attendance));
    return newRecord;
  },
  getByEmployee: async (employeeId: string) => {
    // For demo purposes, use localStorage instead of API
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    return attendance.filter((record: any) => record.employeeId === employeeId);
  },
  getByDate: async (date: string) => {
    // For demo purposes, use localStorage instead of API
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    return attendance.filter((record: any) => record.date === date);
  },
};

// Sites API
export const sitesAPI = {
  getAll: async () => {
    // For demo purposes, use localStorage instead of API
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    if (sites.length === 0) {
      // Initialize with sample sites
      const sampleSites = [
        { id: '1', name: 'Downtown Tower' },
        { id: '2', name: 'Harbor Bridge' },
        { id: '3', name: 'Sunset Residences' },
        { id: '4', name: 'Metro Station' },
      ];
      localStorage.setItem('sites', JSON.stringify(sampleSites));
      return sampleSites;
    }
    return sites;
  },
  getById: async (id: string) => {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    return sites.find((site: any) => site.id === id);
  },
  create: async (site: any) => {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const newSite = {
      ...site,
      id: Date.now().toString(),
    };
    sites.push(newSite);
    localStorage.setItem('sites', JSON.stringify(sites));
    return newSite;
  },
  update: async (id: string, site: any) => {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const index = sites.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      sites[index] = { ...sites[index], ...site };
      localStorage.setItem('sites', JSON.stringify(sites));
      return sites[index];
    }
    throw new Error('Site not found');
  },
  delete: async (id: string) => {
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const filteredSites = sites.filter((s: any) => s.id !== id);
    localStorage.setItem('sites', JSON.stringify(filteredSites));
    return { success: true };
  },
};

// Reports API
export const reportsAPI = {
  getAttendanceReport: async (params: any) => {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
  },
  getEmployeeReport: async (employeeId: string) => {
    const response = await api.get(`/reports/employee/${employeeId}`);
    return response.data;
  },
};

// Roles API
export const rolesAPI = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
  create: async (role: any) => {
    const response = await api.post('/roles', role);
    return response.data;
  },
  update: async (id: string, role: any) => {
    const response = await api.put(`/roles/${id}`, role);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
  assignRole: async (employeeId: string, role: string) => {
    const response = await api.post('/roles/assign', { employeeId, role });
    return response.data;
  },
};

// Work Assignments API
export const workAssignmentsAPI = {
  getAll: async () => {
    const response = await api.get('/work-assignments');
    return response.data;
  },
  getByEmployee: async (employeeId: string) => {
    const response = await api.get(`/work-assignments/employee/${employeeId}`);
    return response.data;
  },
  create: async (assignment: any) => {
    const response = await api.post('/work-assignments', assignment);
    return response.data;
  },
  update: async (id: string, assignment: any) => {
    const response = await api.put(`/work-assignments/${id}`, assignment);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/work-assignments/${id}`);
    return response.data;
  },
};

// Departments API
export const departmentsAPI = {
  getAll: async () => {
    // For demo purposes, use localStorage instead of API
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    return departments;
  },
  getById: async (id: string) => {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    return departments.find((dept: any) => dept.id === id);
  },
  create: async (department: any) => {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const newDepartment = {
      ...department,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    departments.push(newDepartment);
    localStorage.setItem('departments', JSON.stringify(departments));
    return newDepartment;
  },
  update: async (id: string, department: any) => {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const index = departments.findIndex((dept: any) => dept.id === id);
    if (index !== -1) {
      departments[index] = { ...departments[index], ...department };
      localStorage.setItem('departments', JSON.stringify(departments));
      return departments[index];
    }
    throw new Error('Department not found');
  },
  delete: async (id: string) => {
    const departments = JSON.parse(localStorage.getItem('departments') || '[]');
    const filteredDepartments = departments.filter((dept: any) => dept.id !== id);
    localStorage.setItem('departments', JSON.stringify(filteredDepartments));
    return { success: true };
  },
};
