package com.projectmanagement.service.impl;

import com.projectmanagement.entity.AuditLog;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.AuditLogRepository;
import com.projectmanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(String action, String details, User user) {
        String performedBy = (user != null) ? user.getEmail() : "SYSTEM";
        log(action, details, performedBy);
    }

    @Override
    public void log(String action, String details, String performedBy) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .details(details)
                .performedBy(performedBy)
                .build();
        auditLogRepository.save(auditLog);
    }
}
