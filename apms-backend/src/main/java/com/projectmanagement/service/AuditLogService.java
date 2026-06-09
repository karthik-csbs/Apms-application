package com.projectmanagement.service;

import com.projectmanagement.entity.User;

public interface AuditLogService {
    void log(String action, String details, User user);
    void log(String action, String details, String performedBy);
}
