package com.projectmanagement.audit;

import java.util.Optional;
import java.util.Objects;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@EnableJpaAuditing
public class JpaAuditConfig {

    @Bean
    AuditorAware<String> auditorAware() {

        return () -> {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (authentication == null ||
                    !authentication.isAuthenticated()) {

                return currentAuditor("SYSTEM");
            }

            return currentAuditor(authentication.getName());
        };
    }

    private @NonNull Optional<String> currentAuditor(String auditor) {
        String resolvedAuditor = auditor == null || auditor.isBlank()
                ? "SYSTEM"
                : auditor;

        return Objects.requireNonNull(Optional.of(resolvedAuditor), "Auditor must not be null");
    }
}
