import api from './api';

export const authService = {
    async login(email, password) {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
        });

        const data = response.data?.data;

        if (!data?.accessToken || !data?.user) {
            throw new Error('Invalid authentication response.');
        }

        localStorage.setItem(
            'accessToken',
            data.accessToken
        );

        localStorage.setItem(
            'refreshToken',
            data.refreshToken
        );

        return data.user;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Unable to sign in.';

        throw new Error(message);
    }
},

    async verifyEmail(token) {
        const response = await api.get(
            `/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        return response.data;
    },

    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', {
            email,
        });

        return response.data;
    },

    async resetPassword(token, newPassword) {
        const response = await api.post('/auth/reset-password', {
            token,
            newPassword,
        });

        return response.data;
    },

    getGoogleLoginUrl() {
    const baseUrl =
        import.meta.env.VITE_API_BASE_URL || '/api';

    const origin = window.location.origin;

    if (baseUrl.startsWith('http')) {
        const gatewayOrigin = new URL(baseUrl).origin;
        return `${gatewayOrigin}/oauth2/authorization/google`;
    }

    return `${origin}/oauth2/authorization/google`;
},

    async logout() {
        const refreshToken = localStorage.getItem('refreshToken');

        try {
            if (refreshToken) {
                await api.post('/auth/logout', {
                    refreshToken,
                });
            }
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('buildtrack_user');
        }
    },

    async getInvitation(token) {
    const response = await api.get(
        `/auth/invitations/${encodeURIComponent(token)}`
    );

    return response.data;
},

async acceptInvitation(
    token,
    password,
    confirmPassword
) {
    const response = await api.post(
        '/auth/invitations/accept',
        {
            token,
            password,
            confirmPassword,
        }
    );

    return response.data;
},
};



export default authService;