package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.JwtAuthenticationResponse;
import com.projectmanagement.dto.LoginRequest;
import com.projectmanagement.dto.TokenRefreshRequest;
import com.projectmanagement.entity.RefreshToken;
import com.projectmanagement.entity.User;
import com.projectmanagement.exception.UnauthorizedException;
import com.projectmanagement.security.JwtUtil;
import com.projectmanagement.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User userDetails = (User) authentication.getPrincipal();

        // Check if role matches the requested role in UI
        if (userDetails.getRole() != loginRequest.getRole()) {
            throw new UnauthorizedException("You do not have the role required to login through this portal.");
        }

        String jwt = jwtUtil.generateToken(userDetails);
        
        // Delete any existing refresh token for this user, then create a new one
        refreshTokenService.deleteByUserId(userDetails.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        JwtAuthenticationResponse response = new JwtAuthenticationResponse(
                jwt,
                refreshToken.getToken(),
                userDetails.getRole().name(),
                userDetails.getName(),
                userDetails.getEmail()
        );

        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateToken(user);
                    JwtAuthenticationResponse response = new JwtAuthenticationResponse(
                            token,
                            requestRefreshToken,
                            user.getRole().name(),
                            user.getName(),
                            user.getEmail()
                    );
                    return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed successfully", response));
                })
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User userDetails = (User) authentication.getPrincipal();
            refreshTokenService.deleteByUserId(userDetails.getId());
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse<>(true, "Log out successful", null));
    }
}
