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

    async updateProfile(data) {
        const response = await api.put('/auth/profile', data);
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

/**
 * Pre-validates whether the given email is eligible to use "Continue with Google".
 *
 * The backend checks three conditions:
 *  1. The email exists in the users table (was invited + accepted invitation).
 *  2. The invitation for this email is claimed (password was created on the invite page).
 *  3. A refresh token exists for this user (proves at least one prior password login).
 *
 * Returns: { eligible: boolean, reason?: string }
 */
async checkGoogleEligibility(email) {
    const response = await api.post('/auth/google-eligibility', { email });
    return response.data?.data || response.data;
},

async unlinkGoogle() {
    const response = await api.post('/auth/unlink-google');
    return response.data;
},
};



export default authService;