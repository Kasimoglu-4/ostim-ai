import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Invalid email or password');
    }
    throw error;
  }
};

export const signup = async (username, email, password) => {
  try {
    const response = await api.post('/auth/signup', {
      username,
      email,
      password
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create account');
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const changePassword = async (email, currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      email,
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data || 'Failed to change password');
    }
    throw error;
  }
};

export const deleteAccount = async (email) => {
  try {
    const response = await api.delete('/auth/delete-account', {
      data: { email },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data || 'Failed to delete account');
    }
    throw error;
  }
};

/**
 * Verify if the current token is valid
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
export const verifyToken = async () => {
  const user = getCurrentUser();
  if (!user || !user.token) {
    return false;
  }
  
  try {
    const response = await api.get('/auth/validate-token');
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    // Clear invalid token
    logout();
    return false;
  }
}; 