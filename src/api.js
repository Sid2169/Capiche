const API_URL = 'http://localhost:5000/api';

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};