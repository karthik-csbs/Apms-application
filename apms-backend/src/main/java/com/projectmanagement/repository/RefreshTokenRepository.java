package com.projectmanagement.repository;

import com.projectmanagement.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    java.util.Optional<RefreshToken> findByToken(String token);
    void deleteByUser(com.projectmanagement.entity.User user);
}
