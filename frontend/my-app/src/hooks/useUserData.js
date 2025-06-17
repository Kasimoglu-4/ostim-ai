import { useMemo } from 'react';

export const useUserData = () => {
  const user = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  const userEmail = user?.email || '';

  const maskEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return local[0] + '***@' + domain;
    return local.slice(0, 2) + '***@' + domain;
  };

  const maskedEmail = useMemo(() => maskEmail(userEmail), [userEmail]);

  return {
    user,
    userEmail,
    maskedEmail,
    maskEmail
  };
}; 