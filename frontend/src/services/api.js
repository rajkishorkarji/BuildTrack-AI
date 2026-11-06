import axios from 'axios';

// Create central Axios instance for backend REST API calls
export function resolveApiBaseUrl() {
    const raw = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
    if (!raw || raw === '/api' || raw === 'api') {
        return '/api';
    }

    let url = raw;

    // Detect if host is a Render private service slug like "buildtrack-backend-fy94" or "buildtrack-backend"
    // Render's blueprint "fromService: ... property: host" produces only the slug without .onrender.com
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    const hostPart = withoutProtocol.split('/')[0].split(':')[0];

    // If hostPart has no dot (not a public FQDN) and is not localhost
    if (hostPart && !hostPart.includes('.') && hostPart !== 'localhost') {
        url = url.replace(hostPart, `${hostPart}.onrender.com`);
    }

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        url = `https://${url}`;
    }

    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    return url.endsWith('/api') ? url : `${url}/api`;
}

export const apiBaseUrl = resolveApiBaseUrl();

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
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

        // Normalize raw timeout and network errors to prevent leaking raw technical messages
        if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
            error.message = 'The server is taking longer than expected to respond (it may be waking up from sleep mode). Please wait a moment and try again.';
        } else if (!error.response && (error.code === 'ERR_NETWORK' || (error.message && error.message.toLowerCase().includes('network')))) {
            error.message = 'Unable to connect to the server. Please check your internet connection or verify the server status.';
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

    publish(event, payload) {
        this.emit(event, payload);
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