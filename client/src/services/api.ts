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
    const response = await api.get('/employees');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (employee: any) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },
  update: async (id: string, employee: any) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async () => {
    const response = await api.get('/attendance');
    return response.data;
  },
  markAttendance: async (data: any) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },
  getByEmployee: async (employeeId: string) => {
    const response = await api.get(`/attendance/employee/${employeeId}`);
    return response.data;
  },
  getByDate: async (date: string) => {
    const response = await api.get(`/attendance/date/${date}`);
    return response.data;
  },
};

// Sites API
export const sitesAPI = {
  getAll: async () => {
    const response = await api.get('/sites');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  },
  create: async (site: any) => {
    const response = await api.post('/sites', site);
    return response.data;
  },
  update: async (id: string, site: any) => {
    const response = await api.put(`/sites/${id}`, site);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/sites/${id}`);
    return response.data;
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
