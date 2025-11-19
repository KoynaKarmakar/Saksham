// lib/api.ts

const API_BASE_URL = '/api';

/**
 * Gets the JWT token from localStorage.
 */
export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

/**
 * Saves the JWT token to localStorage.
 */
export const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

/**
 * Removes the JWT token from localStorage.
 */
export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

/**
 * Generic fetch wrapper for API calls.
 */
export const apiFetch = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, finalOptions);

        if (response.status === 204) { // Handle No Content responses
            return null;
        }

        // CHECK 1: If status is non-2xx AND the response is NOT JSON (e.g., HTML error page), throw a clean error.
        const contentType = response.headers.get('content-type');
        if (!response.ok && (!contentType || !contentType.includes('application/json'))) {
            // This covers the HTML error page case, preventing the JSON parsing error.
            throw { message: `Authentication Failed or Internal Server Error (${response.status})` };
        }

        // If we reach here, we expect JSON.
        const data = await response.json();

        if (!response.ok) {
            // Throw the response body (which is a JSON error object from the API)
            throw data;
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            // Network error (e.g., server offline) or unhandled JSON parsing
            throw { message: 'Network connection failed or server is offline.' };
        }
        throw error; // Re-throw the structured API error or the custom error above
    }
};