import axios from 'axios';

// Create central Axios instance for backend REST API calls
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to append JWT Bearer Token if logged in
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest?._retry
        ) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const res = await api.post(
                        '/auth/refresh',
                        { refreshToken }
                    );

                    const newAccessToken =
                        res.data?.data?.accessToken;

                    if (newAccessToken) {
                        localStorage.setItem(
                            'accessToken',
                            newAccessToken
                        );

                        originalRequest.headers.Authorization =
                            `Bearer ${newAccessToken}`;

                        return api(originalRequest);
                    }
                } catch (refreshErr) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('buildtrack_user');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
            } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('buildtrack_user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

// Real-time event bus
class RealTimeEventBus {
    constructor() {
        this.listeners = new Map();
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event).add(callback);

        return () => {
            const callbacks = this.listeners.get(event);

            if (callbacks) {
                callbacks.delete(callback);

                if (callbacks.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }

    emit(event, payload) {
        const callbacks = this.listeners.get(event);

        if (!callbacks) {
            return;
        }

        callbacks.forEach((callback) => {
            try {
                callback(payload);
            } catch (error) {
                console.error(
                    `Error handling event ${event}:`,
                    error
                );
            }
        });
    }
}

export const realtimeBus = new RealTimeEventBus();

export default api;