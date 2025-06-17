import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import styles from '../styles/SignupBox.module.css';
import ThemeToggle from '../components/ui/ThemeToggle';

const EmailIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.97671 3.2998C3.0897 3.2998 1.55998 4.85786 1.55998 6.77981V17.2198C1.55998 19.1418 3.0897 20.6998 4.97671 20.6998H19.0233C20.9103 20.6998 22.44 19.1418 22.44 17.2198V6.7798C22.44 4.85785 20.9103 3.2998 19.0233 3.2998H4.97671ZM4.97671 5.23314C4.13804 5.23314 3.45816 5.92561 3.45816 6.77981V7.18001L12.0001 11.8068L20.5418 7.18021V6.7798C20.5418 5.9256 19.8619 5.23314 19.0233 5.23314H4.97671ZM20.5418 9.50025L12.4962 13.8582C12.3427 13.9434 12.1689 13.9881 11.9927 13.987C11.8501 13.9861 11.7059 13.9552 11.5695 13.8915C11.5467 13.8809 11.5243 13.8695 11.5022 13.8572L3.45816 9.50005V17.2198C3.45816 18.074 4.13804 18.7665 4.97671 18.7665H19.0233C19.8619 18.7665 20.5418 18.074 20.5418 17.2198V9.50025Z" fill="currentColor"></path>
  </svg>
);

const PasswordIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12.9819 14.7816C12.9819 14.2394 12.5423 13.7998 12.0001 13.7998C11.4578 13.7998 11.0182 14.2394 11.0182 14.7816V17.0289C11.0182 17.5711 11.4578 18.0107 12.0001 18.0107C12.5423 18.0107 12.9819 17.5711 12.9819 17.0289V14.7816Z" fill="currentColor"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.00012 6.51953V9.52051H6.42405C4.54628 9.52051 3.02405 11.0427 3.02405 12.9205V19.1205C3.02405 20.9983 4.54628 22.5205 6.42405 22.5205H17.576C19.4538 22.5205 20.976 20.9983 20.976 19.1205V12.9205C20.976 11.0427 19.4538 9.52051 17.576 9.52051H17.0001V6.51953C17.0001 3.75811 14.7615 1.51953 12.0001 1.51953C9.2387 1.51953 7.00012 3.75811 7.00012 6.51953ZM12.0001 3.51953C10.3433 3.51953 9.00012 4.86268 9.00012 6.51953V9.52051H15.0001V6.51953C15.0001 4.86268 13.657 3.51953 12.0001 3.51953ZM17.576 11.5205H6.42405C5.65085 11.5205 5.02405 12.1473 5.02405 12.9205V19.1205C5.02405 19.8937 5.65085 20.5205 6.42405 20.5205H17.576C18.3492 20.5205 18.976 19.8937 18.976 19.1205V12.9205C18.976 12.1473 18.3492 11.5205 17.576 11.5205Z" fill="currentColor"></path>
  </svg>
);

const ConfirmPasswordIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12.9819 14.7816C12.9819 14.2394 12.5423 13.7998 12.0001 13.7998C11.4578 13.7998 11.0182 14.2394 11.0182 14.7816V17.0289C11.0182 17.5711 11.4578 18.0107 12.0001 18.0107C12.5423 18.0107 12.9819 17.5711 12.9819 17.0289V14.7816Z" fill="currentColor"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.00012 6.51953V9.52051H6.42405C4.54628 9.52051 3.02405 11.0427 3.02405 12.9205V19.1205C3.02405 20.9983 4.54628 22.5205 6.42405 22.5205H17.576C19.4538 22.5205 20.976 20.9983 20.976 19.1205V12.9205C20.976 11.0427 19.4538 9.52051 17.576 9.52051H17.0001V6.51953C17.0001 3.75811 14.7615 1.51953 12.0001 1.51953C9.2387 1.51953 7.00012 3.75811 7.00012 6.51953ZM12.0001 3.51953C10.3433 3.51953 9.00012 4.86268 9.00012 6.51953V9.52051H15.0001V6.51953C15.0001 4.86268 13.657 3.51953 12.0001 3.51953ZM17.576 11.5205H6.42405C5.65085 11.5205 5.02405 12.1473 5.02405 12.9205V19.1205C5.02405 19.8937 5.65085 20.5205 6.42405 20.5205H17.576C18.3492 20.5205 18.976 19.8937 18.976 19.1205V12.9205C18.976 12.1473 18.3492 11.5205 17.576 11.5205Z" fill="currentColor"></path>
  </svg>
);

const UsernameIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" fill="currentColor"/>
    <path d="M4 20c0-2.7614 3.5817-5 8-5s8 2.2386 8 5" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const EyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M0.853566 11.0498C3.9301 6.63986 7.93993 4.2998 11.9841 4.2998C16.7263 4.2998 20.7897 7.38605 23.178 11.0747L23.1793 11.0767C23.3565 11.3522 23.4509 11.673 23.4509 12.0005C23.4509 12.3273 23.3571 12.6472 23.1806 12.9222C20.7935 16.6596 16.7554 19.6998 11.9841 19.6998C7.16233 19.6998 3.20136 16.6654 0.820516 12.9394C0.639165 12.6577 0.545108 12.3286 0.550199 11.9935C0.555305 11.6575 0.660199 11.3301 0.851082 11.0534L0.853566 11.0498ZM2.49107 12.0246C4.64797 15.3395 8.05011 17.8002 11.9841 17.8002C15.8763 17.8002 19.3535 15.3248 21.5137 12.0017C19.3439 8.71129 15.8389 6.2002 11.9841 6.2002C8.75169 6.2002 5.30085 8.05427 2.49107 12.0246ZM7.8 11.9998C7.8 9.68021 9.68041 7.7998 12 7.7998C14.3196 7.7998 16.2 9.68021 16.2 11.9998C16.2 14.3194 14.3196 16.1998 12 16.1998C9.68041 16.1998 7.8 14.3194 7.8 11.9998ZM12 9.5332C10.6377 9.5332 9.53334 10.6376 9.53334 11.9999C9.53334 13.3622 10.6377 14.4665 12 14.4665C13.3623 14.4665 14.4667 13.3622 14.4667 11.9999C14.4667 10.6376 13.3623 9.5332 12 9.5332Z" fill="currentColor"></path>
  </svg>
);

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  function isValidEmail(email) {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signup(username, email, password);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <Box className={styles.signupBg}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className={styles.signupBox} sx={{ borderRadius: '16px' }}>
          <Box className={styles.signupTitleBox}>
            <Typography component="h1" variant="h4" className={`${styles.title} ${styles.zenTokyoZoo}`}>
              OSTIM AI
            </Typography>
          </Box>
          <Typography variant="h6" className={styles.subtitle}>
            Create your account
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              className={styles.errorAlert}
              icon={false}
              variant="outlined"
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              className={styles.successAlert}
              icon={false}
              variant="outlined"
            >
              Account created successfully! Redirecting to login...
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} className={styles.form}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              placeholder="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {UsernameIcon}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {EmailIcon}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {PasswordIcon}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {EyeIcon}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {ConfirmPasswordIcon}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword((show) => !show)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {EyeIcon}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" gap={2} mt={3} mb={2}>
              <Button
                type="submit"
                variant="contained"
                className={`${styles.signupFormButton} ${styles.signupButton}`}
                fullWidth
                disabled={success}
              >
                Sign Up
              </Button>
              <Button
                variant="contained"
                className={`${styles.signupFormButton} ${styles.signinButton}`}
                fullWidth
                disabled={success}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          </Box>
          
          <Box className={styles.themeContainer}>
            <Typography variant="body2" className={styles.themeLabel}>
              Choose theme:
            </Typography>
            <ThemeToggle />
          </Box>
          
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup; 