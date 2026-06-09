package com.projectmanagement.aspect;

import com.projectmanagement.entity.User;
import com.projectmanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLoggingAspect {

    private final AuditLogService auditLogService;

    @Pointcut("execution(* com.projectmanagement.report.controller.ReportController.export*(..))")
    public void reportExportMethods() {}

    @Pointcut("execution(* com.projectmanagement.controller.ProjectController.createProject(..)) || " +
              "execution(* com.projectmanagement.controller.ProjectController.update*(..)) || " +
              "execution(* com.projectmanagement.controller.ProjectController.requestCompletion(..)) || " +
              "execution(* com.projectmanagement.controller.ProjectController.approveCompletion(..)) || " +
              "execution(* com.projectmanagement.controller.ProjectController.rejectCompletion(..))")
    public void projectWriteMethods() {}

    @Pointcut("execution(* com.projectmanagement.controller.WorkflowController.submit*(..)) || " +
              "execution(* com.projectmanagement.controller.WorkflowController.review*(..)) || " +
              "execution(* com.projectmanagement.controller.WorkflowController.approve*(..)) || " +
              "execution(* com.projectmanagement.controller.WorkflowController.reject*(..))")
    public void workflowWriteMethods() {}

    @Before("reportExportMethods() || projectWriteMethods() || workflowWriteMethods()")
    public void logAuditAction(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String args = Arrays.toString(joinPoint.getArgs());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = "SYSTEM/ANONYMOUS";
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            userEmail = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
        }

        String action = getActionName(methodName);
        String details = String.format("Method %s.%s called with arguments: %s", className, methodName, args);

        try {
            auditLogService.log(action, details, userEmail);
            log.info("Audit log saved: Action={} by User={}", action, userEmail);
        } catch (Exception e) {
            log.error("Failed to write audit log in aspect", e);
        }
    }

    private String getActionName(String methodName) {
        if (methodName.startsWith("export")) return "REPORT_EXPORT";
        if (methodName.startsWith("create")) return "PROJECT_CREATE";
        if (methodName.startsWith("update")) return "PROJECT_UPDATE";
        if (methodName.startsWith("submit")) return "WORKFLOW_SUBMIT";
        if (methodName.startsWith("review")) return "WORKFLOW_REVIEW";
        if (methodName.startsWith("approve")) return "WORKFLOW_APPROVE";
        if (methodName.startsWith("reject")) return "WORKFLOW_REJECT";
        if (methodName.startsWith("request")) return "PROJECT_COMPLETION_REQUEST";
        return "SYSTEM_ACTION";
    }
}
