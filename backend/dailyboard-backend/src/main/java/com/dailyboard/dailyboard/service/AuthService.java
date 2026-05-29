package com.dailyboard.dailyboard.service;

import com.dailyboard.dailyboard.exepctions.DuplicateEmailException;
import com.dailyboard.dailyboard.exepctions.InvalidCredentialsException;
import com.dailyboard.dailyboard.model.dao.User;
import com.dailyboard.dailyboard.model.dto.AuthRequestDto;
import com.dailyboard.dailyboard.model.dto.AuthResponseDto;
import com.dailyboard.dailyboard.model.dto.UserDto;
import com.dailyboard.dailyboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDto register(AuthRequestDto request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return toAuthResponse(savedUser);
    }

    public AuthResponseDto login(AuthRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return toAuthResponse(user);
    }

    private AuthResponseDto toAuthResponse(User user) {
        return new AuthResponseDto(
                jwtService.generateToken(user),
                new UserDto(user.getId(), user.getEmail())
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
