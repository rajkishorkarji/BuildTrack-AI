import {
    createContext,
    useContext,
    useState,
} from 'react';

import {
    getRolePermissions,
    hasPermission as checkPermission,
} from '../config/rbac';

import authService from '../services/authService';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
    if (!user) return null;

    const role = String(user.role || '')
        .toUpperCase()
        .replace(/\s+/g, '_');

    const fullName =
        user.fullName ||
        user.name ||
        'BuildTrack User';

    return {
        ...user,
        fullName,
        role,
        roleLabel:
            user.roleLabel ||
            role.replace(/_/g, ' '),
        avatar:
            user.avatar ||
            fullName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
        permissions:
            Array.isArray(user.permissions)
                ? user.permissions
                : getRolePermissions(role),
    };
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('buildtrack_user');

        if (!token || !savedUser) {
            return null;
        }

        try {
            return normalizeUser(JSON.parse(savedUser));
        } catch {
            localStorage.removeItem('buildtrack_user');
            return null;
        }
    });

    const login = (apiUser) => {
        if (!apiUser?.email || !apiUser?.role) {
            throw new Error(
                'Invalid user information returned by server.'
            );
        }

        const sessionUser = normalizeUser(apiUser);

        setUser(sessionUser);

        localStorage.setItem(
            'buildtrack_user',
            JSON.stringify(sessionUser)
        );

        return sessionUser;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);

            localStorage.removeItem('buildtrack_user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            window.dispatchEvent(
                new Event('buildtrack:auth-changed')
            );
        }
    };

    const updateUser = (updatedFields) => {
        setUser((previous) => {
            if (!previous) return null;

            const updated = normalizeUser({
                ...previous,
                ...updatedFields,
            });

            localStorage.setItem(
                'buildtrack_user',
                JSON.stringify(updated)
            );

            return updated;
        });
    };

    const hasPermission = (requiredPermission) => {
        if (!user || !requiredPermission) {
            return false;
        }

        const userRole = String(user.role || '').toUpperCase();
        if (userRole === 'SUPER_ADMIN') {
            return true;
        }

        const rolePerms = getRolePermissions(userRole);
        const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
        const permissions = Array.from(new Set([...userPerms, ...rolePerms]));

        return checkPermission(
            permissions,
            requiredPermission
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                updateUser,
                login,
                logout,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used within an AuthProvider'
        );
    }

    return context;
}