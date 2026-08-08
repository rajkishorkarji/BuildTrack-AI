import { createContext, useContext, useState } from 'react';
import { getRolePermissions, hasPermission as checkPermission } from '../config/rbac';

const AuthContext = createContext(null);

const normalize = (value) => String(value || '').trim().toLowerCase();

// Only Super Admin is provided as default system account
export const defaultSuperAdmin = {
  id: 'super-admin-1',
  fullName: 'System Master Admin',
  email: 'raj@buildtrack.ai',
  phone: '+91 9876543210',
  role: 'SUPER_ADMIN',
  roleLabel: 'Super Admin',
  avatar: 'SA',
  companyName: 'BuildTrack AI Platform',
  permissions: getRolePermissions('SUPER_ADMIN'),
};

export function AuthProvider({ children }) {
  // Store registered users in localStorage for real-time auth
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('buildtrack_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [defaultSuperAdmin];
      }
    }
    return [defaultSuperAdmin];
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('buildtrack_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          permissions: parsed.permissions || getRolePermissions(parsed.role),
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const newAvatar = updatedFields.fullName
        ? updatedFields.fullName
            .trim()
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : prev.avatar;

      const updated = {
        ...prev,
        ...updatedFields,
        avatar: newAvatar,
      };

      // Also update in registeredUsers list
      setRegisteredUsers((users) => {
        const newUsers = users.map((u) => (u.email === prev.email ? { ...u, ...updated } : u));
        localStorage.setItem('buildtrack_registered_users', JSON.stringify(newUsers));
        return newUsers;
      });

      localStorage.setItem('buildtrack_user', JSON.stringify(updated));
      return updated;
    });
  };

  const registerUser = (userData) => {
    const formattedRole = (userData.role || 'COMPANY_ADMIN').toUpperCase().replace(/\s+/g, '_');
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'New User';
    const email = normalize(userData.email);
    let tenantData = null;

    try {
      tenantData = JSON.parse(localStorage.getItem('buildtrack_app_data') || '{}');
    } catch (e) {
      tenantData = {};
    }

    const requiresTenant = formattedRole !== 'SUPER_ADMIN';
    const company = (tenantData.companies || []).find(
      (item) => normalize(item.code) === normalize(userData.companyCode)
    );

    if (requiresTenant && !userData.companyCode?.trim()) {
      throw new Error('Enter the company code supplied by your Company Admin.');
    }
    if (requiresTenant && !company) {
      throw new Error('This company code is not valid. Ask your Company Admin for the correct code.');
    }
    if (company && (company.status || 'Active') !== 'Active') {
      throw new Error('This tenant is currently suspended. Contact the platform administrator.');
    }

    const invitedUser = (tenantData.usersList || []).find((item) => normalize(item.email) === email);
    if (invitedUser && (normalize(invitedUser.fullName || invitedUser.name) !== normalize(fullName) ||
        normalize(invitedUser.companyCode) !== normalize(company?.code) ||
        normalize(invitedUser.role) !== normalize(formattedRole))) {
      throw new Error('Your name, email, role, and company code must match the personnel record created by your Company Admin.');
    }
    if (formattedRole === 'COMPANY_ADMIN' && company &&
        (normalize(company.adminEmail) !== email || normalize(company.adminName) !== normalize(fullName))) {
      throw new Error('Company Admin registration must use the name and email registered for this tenant.');
    }
    if (registeredUsers.some((item) => normalize(item.email) === email)) {
      throw new Error('An account already exists for this email. Please sign in instead.');
    }

    const resolvedCompanyName = company?.name || 'BuildTrack AI Platform';
    const resolvedCompanyCode = company?.code || '';

    const newUser = {
      id: Date.now().toString(),
      fullName,
      email: userData.email.trim(),
      password: userData.password,
      phone: userData.phone || '+91 9876543210',
      role: invitedUser?.role || formattedRole,
      roleLabel: formattedRole.replace(/_/g, ' '),
      avatar: fullName.split(' ').map((n) => n[0]).join('').toUpperCase(),
      companyName: resolvedCompanyName,
      companyCode: resolvedCompanyCode,
      companyId: company?.id,
      permissions: getRolePermissions(formattedRole),
    };

    setRegisteredUsers((prev) => {
      const updated = [newUser, ...prev];
      localStorage.setItem('buildtrack_registered_users', JSON.stringify(updated));
      return updated;
    });

    setUser(newUser);
    localStorage.setItem('buildtrack_user', JSON.stringify(newUser));
    return newUser;
  };

  const login = (email, password) => {
    if (typeof email === 'object' && email) {
      const sessionUser = {
        ...email,
        roleLabel: email.roleLabel || String(email.role || 'WORKER').replace(/_/g, ' '),
        avatar: email.avatar || String(email.fullName || email.email || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        permissions: email.permissions?.length ? email.permissions : getRolePermissions(email.role),
      };
      setUser(sessionUser);
      localStorage.setItem('buildtrack_user', JSON.stringify(sessionUser));
      window.dispatchEvent(new Event('buildtrack:auth-changed'));
      return sessionUser;
    }
    const emailLower = (email || '').toLowerCase().trim();
    
    // Super Admin emails always resolve to defaultSuperAdmin
    if (
      emailLower === 'raj@buildtrack.ai' ||
      emailLower === 'superadmin@buildtrack.ai' ||
      emailLower === 'admin@buildtrack.ai'
    ) {
      setUser(defaultSuperAdmin);
      localStorage.setItem('buildtrack_user', JSON.stringify(defaultSuperAdmin));
      return defaultSuperAdmin;
    }

    // A tenant account must have been registered or invited before it can sign in.
    let found = registeredUsers.find((u) => u.email.toLowerCase() === emailLower);
    if (!found) return null;

    const sessionUser = {
      ...found,
      permissions: getRolePermissions(found.role),
    };

    setUser(sessionUser);
    localStorage.setItem('buildtrack_user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const logout = () => {
    setUser(defaultSuperAdmin);
    localStorage.removeItem('buildtrack_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const switchRole = (roleKey) => {
    const permissions = getRolePermissions(roleKey);
    const u = {
      ...user,
      role: roleKey,
      roleLabel: roleKey.replace(/_/g, ' '),
      permissions,
    };
    setUser(u);
    localStorage.setItem('buildtrack_user', JSON.stringify(u));
  };

  const hasPermission = (requiredPermission) => {
    const perms = user?.permissions || getRolePermissions(user?.role);
    return checkPermission(perms, requiredPermission);
  };

  return (
    <AuthContext.Provider value={{ user, registeredUsers, updateUser, registerUser, login, logout, switchRole, hasPermission }}>
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
