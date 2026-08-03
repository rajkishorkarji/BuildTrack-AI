import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const roleUsers = {
  SUPER_ADMIN: {
    id: 1,
    fullName: 'System Master Admin',
    email: 'raj@buildtrack.ai',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin',
    avatar: 'SA',
    companyName: 'BuildTrack AI Platform',
  },
  COMPANY_ADMIN: {
    id: 2,
    fullName: 'Rajkishor Karji',
    email: 'rajkishor@buildtrack.ai',
    role: 'COMPANY_ADMIN',
    roleLabel: 'Company Admin',
    avatar: 'RK',
    companyName: 'Solviontech Infrastructure Ltd',
  },
  PROJECT_MANAGER: {
    id: 3,
    fullName: 'Vikram Nair',
    email: 'vikram@buildtrack.ai',
    role: 'PROJECT_MANAGER',
    roleLabel: 'Project Manager',
    avatar: 'VN',
    companyName: 'Solviontech Infrastructure Ltd',
  },
  SITE_ENGINEER: {
    id: 4,
    fullName: 'Divya Krishnan',
    email: 'divya@buildtrack.ai',
    role: 'SITE_ENGINEER',
    roleLabel: 'Senior Site Engineer',
    avatar: 'DK',
    companyName: 'Solviontech Infrastructure Ltd',
  },
  CONTRACTOR: {
    id: 5,
    fullName: 'Robert Fox',
    email: 'robert@buildtrack.ai',
    role: 'CONTRACTOR',
    roleLabel: 'Prime Contractor',
    avatar: 'RF',
    companyName: 'Fox Steel Constructors',
  },
  WORKER: {
    id: 6,
    fullName: 'Rose Smith',
    email: 'rose@buildtrack.ai',
    role: 'WORKER',
    roleLabel: 'Senior Mason',
    avatar: 'RS',
    companyName: 'Solviontech Infrastructure Ltd',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('buildtrack_user');
    return saved ? JSON.parse(saved) : roleUsers.SUPER_ADMIN;
  });

  const switchRole = (roleKey) => {
    if (roleUsers[roleKey]) {
      setUser(roleUsers[roleKey]);
      localStorage.setItem('buildtrack_user', JSON.stringify(roleUsers[roleKey]));
    }
  };

  const login = (email, password, role = 'SUPER_ADMIN', fullName) => {
    const formattedRole = (role || 'SUPER_ADMIN').toUpperCase().replace(' ', '_');
    const matched = roleUsers[formattedRole] || {
      id: Date.now(),
      fullName: fullName || 'BuildTrack User',
      email: email || 'user@buildtrack.ai',
      role: formattedRole,
      roleLabel: formattedRole.replace('_', ' '),
      avatar: (fullName || 'BU').split(' ').map((n) => n[0]).join('').toUpperCase(),
      companyName: 'Solviontech Infrastructure Ltd',
    };

    setUser(matched);
    localStorage.setItem('buildtrack_user', JSON.stringify(matched));
    return matched;
  };

  const logout = () => {
    setUser(roleUsers.SUPER_ADMIN);
    localStorage.removeItem('buildtrack_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
