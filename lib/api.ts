// lib/api.ts

const API_BASE_URL = '/api/v1';

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

        const data = await response.json();

        if (!response.ok) {
            // Throw the response body as an error for easier handling in components
            throw data;
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            // Network error or inability to parse JSON
            throw { message: 'Network or internal server error.' };
        }
        throw error; // Re-throw API error response body
    }
};