package com.omer.ostim.ai.service;

import com.omer.ostim.ai.dto.LoginRequest;
import com.omer.ostim.ai.dto.LoginResponse;
import com.omer.ostim.ai.dto.SignupRequest;
import com.omer.ostim.ai.dto.ChangePasswordRequest;
import com.omer.ostim.ai.model.User;
import com.omer.ostim.ai.repository.UserRepository;
import com.omer.ostim.ai.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public void createDefaultUser() {
        if (userRepository.count() == 0) { 
            User defaultUser = new User();
            defaultUser.setUsername("omer");
            defaultUser.setEmail("omer@example.com");
            defaultUser.setPassword(passwordEncoder.encode("ostim2025")); 
            defaultUser.setRole("USER");
            userRepository.save(defaultUser);
            System.out.println("Default user created: omer / 2025");
        } else {
            System.out.println("Users already exist, skipping default user creation.");
        }
    }
    
    public void registerUser(SignupRequest signupRequest) {
        // Check if username already exists
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Validate email format
        if (!isValidEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole("USER");
        
        // Save user
        userRepository.save(user);
    }

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate a JWT token
        String token = jwtUtils.generateToken(user.getUsername(), user.getEmail(), user.getRole());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        return response;
    }
    
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(emailRegex);
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteAccountByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
}
