package com.projectmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    // MANUAL CONSTRUCTOR
    public JwtAuthenticationFilter(
            JwtUtil jwtUtil,
            UserDetailsServiceImpl userDetailsService) {

        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String headerAuth = request.getHeader("Authorization");
        logger.info("Incoming request to path: " + path + " | Auth Header: " + (headerAuth != null ? "Present" : "None"));

        try {
            String jwt = parseJwt(request);

            if (jwt != null) {
                logger.info("Extracted JWT Token: " + jwt.substring(0, Math.min(jwt.length(), 15)) + "...");
                try {
                    String username = jwtUtil.extractUsername(jwt);
                    logger.info("Extracted Username/Email from Token: " + username);

                    if (username != null &&
                            SecurityContextHolder.getContext()
                                    .getAuthentication() == null) {

                        UserDetails userDetails =
                                userDetailsService
                                        .loadUserByUsername(username);
                        logger.info("Loaded UserDetails for: " + username + " with authorities: " + userDetails.getAuthorities());

                        if (jwtUtil.validateToken(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities());

                            authentication.setDetails(
                                    new WebAuthenticationDetailsSource()
                                            .buildDetails(request));

                            SecurityContextHolder.getContext()
                                    .setAuthentication(authentication);
                            
                            logger.info("JWT Validation: User " + username + " authenticated successfully. SecurityContext updated.");
                        } else {
                            logger.warn("JWT Validation: Token validation returned false for user: " + username);
                        }
                    } else if (username != null) {
                        logger.info("SecurityContext already has authentication: " + SecurityContextHolder.getContext().getAuthentication().getName());
                    }
                } catch (io.jsonwebtoken.ExpiredJwtException e) {
                    logger.warn("JWT Validation: Token has expired: " + e.getMessage());
                } catch (Exception e) {
                    logger.error("JWT Validation failed with exception: " + e.getMessage(), e);
                }
            } else {
                logger.info("No Bearer token found in request headers.");
            }

        } catch (Exception e) {
            logger.error("Cannot set user authentication: ", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth)
                && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}