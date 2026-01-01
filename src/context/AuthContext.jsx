import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Demo users for demonstration
const DEMO_USERS = [
  {
    id: 'emp-001',
    name: 'Ravi Kumar',
    email: 'ravi@grofast.com',
    phone: '+91 98765 43210',
    role: 'employee',
    team: 'Digital Marketing',
    teamId: 'team-001',
    avatar: null,
    department: 'Marketing'
  },
  {
    id: 'tl-001',
    name: 'Priya Sharma',
    email: 'priya@grofast.com',
    phone: '+91 98765 43211',
    role: 'team_lead',
    team: 'Digital Marketing',
    teamId: 'team-001',
    avatar: null,
    department: 'Marketing'
  },
  {
    id: 'senior-001',
    name: 'Arun Patel',
    email: 'arun@grofast.com',
    phone: '+91 98765 43212',
    role: 'senior',
    team: 'Operations',
    teamId: 'team-002',
    avatar: null,
    department: 'Operations'
  },
  {
    id: 'md-001',
    name: 'Vikram Raghunathan',
    email: 'vikram@grofast.com',
    phone: '+91 98765 43213',
    role: 'md',
    team: 'Management',
    teamId: 'team-000',
    avatar: null,
    department: 'Management'
  },
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@grofast.com',
    phone: '+91 98765 43214',
    role: 'admin',
    team: 'Administration',
    teamId: 'team-000',
    avatar: null,
    department: 'Administration'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('grofast_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('grofast_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (demo auth)
      const foundUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // In production, verify password here
      if (password.length < 4) {
        throw new Error('Invalid email or password');
      }
      
      setUser(foundUser);
      localStorage.setItem('grofast_user', JSON.stringify(foundUser));
      return foundUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grofast_user');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('grofast_user', JSON.stringify(updatedUser));
  };

  const hasPermission = (permission) => {
    const permissions = {
      employee: ['view_own_data', 'mark_attendance', 'submit_leave', 'submit_update', 'submit_learning'],
      team_lead: ['view_own_data', 'mark_attendance', 'submit_leave', 'submit_update', 'submit_learning', 
                  'view_team_data', 'approve_team_leave', 'manage_team'],
      senior: ['view_own_data', 'mark_attendance', 'submit_leave', 'submit_update', 'submit_learning',
               'view_team_data', 'approve_team_leave', 'manage_team', 'view_all_teams', 'approve_tl_leave'],
      md: ['view_own_data', 'mark_attendance', 'submit_leave', 'submit_update', 'submit_learning',
           'view_team_data', 'approve_team_leave', 'manage_team', 'view_all_teams', 'approve_tl_leave',
           'view_company_data', 'approve_senior_leave', 'manage_all'],
      admin: ['all']
    };

    if (!user) return false;
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const getRoleLabel = (role) => {
    const labels = {
      employee: 'Employee',
      team_lead: 'Team Lead',
      senior: 'Senior',
      md: 'Managing Director',
      admin: 'Administrator'
    };
    return labels[role] || role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      logout,
      updateProfile,
      hasPermission,
      getRoleLabel,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
