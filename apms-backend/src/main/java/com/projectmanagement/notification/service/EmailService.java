package com.projectmanagement.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-login-url:http://localhost:5173/login}")
    private String frontendLoginUrl;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendCredentialEmail(String studentName, String studentEmail, String username, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        } else {
            message.setFrom("apms@pec.edu");
        }
        message.setTo(studentEmail);
        message.setSubject("APMS Student Account Credentials");
        
        String body = String.format(
            "Dear %s,\n\n" +
            "Your Academic Project Management System (APMS) account has been created.\n\n" +
            "Login URL:\n" +
            "%s\n\n" +
            "Username:\n" +
            "%s\n\n" +
            "Temporary Password:\n" +
            "%s\n\n" +
            "Important:\n" +
            "You must change your password after your first login.\n\n" +
            "Regards,\n" +
            "Prathyusha Engineering College\n" +
            "APMS Portal",
            studentName,
            frontendLoginUrl,
            username,
            temporaryPassword
        );
        
        message.setText(body);
        mailSender.send(message);
    }
}
