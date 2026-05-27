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
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest
    ) {

        Authentication authentication;

        try {

            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();

        // Validate role
        if (user.getRole() != loginRequest.getRole()) {

            throw new UnauthorizedException(
                    "You do not have access to this portal"
            );
        }

        // Generate JWT
        String accessToken = jwtUtil.generateToken(user);

        // Delete old refresh token
        refreshTokenService.deleteByUserId(user.getId());

        // Create new refresh token
        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user.getId());

        JwtAuthenticationResponse response =
                new JwtAuthenticationResponse(
                        accessToken,
                        refreshToken.getToken(),
                        user.getRole().name(),
                        user.getName(),
                        user.getEmail(),
                        user.getId()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        response
                )
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request
    ) {

        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {

                    String token = jwtUtil.generateToken(user);

                    JwtAuthenticationResponse response =
                            new JwtAuthenticationResponse(
                                    token,
                                    requestRefreshToken,
                                    user.getRole().name(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getId()
                            );

                    return ResponseEntity.ok(
                            new ApiResponse<>(
                                    true,
                                    "Token refreshed successfully",
                                    response
                            )
                    );
                })
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Refresh token is invalid"
                        )
                );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.getPrincipal() instanceof User user) {

            refreshTokenService.deleteByUserId(user.getId());
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Logout successful",
                        null
                )
        );
    }
}