
package com.pharmacy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.pharmacy.entity.User;
import com.pharmacy.entity.UserRole;
import com.pharmacy.repository.UserRepository;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean adminEnabled;
    private final String adminUsername;
    private final String adminPassword;
    private final boolean staffEnabled;
    private final String staffUsername;
    private final String staffPassword;

    public AdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${pharmacy.security.bootstrap-admin-enabled:false}")
            boolean adminEnabled,
            @Value("${pharmacy.security.bootstrap-admin-username:}")
            String adminUsername,
            @Value("${pharmacy.security.bootstrap-admin-password:}")
            String adminPassword,
            @Value("${pharmacy.security.bootstrap-staff-enabled:false}")
            boolean staffEnabled,
            @Value("${pharmacy.security.bootstrap-staff-username:}")
            String staffUsername,
            @Value("${pharmacy.security.bootstrap-staff-password:}")
            String staffPassword) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEnabled = adminEnabled;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.staffEnabled = staffEnabled;
        this.staffUsername = staffUsername;
        this.staffPassword = staffPassword;
    }

    @Override
    public void run(String... args) {
        createUserIfEnabled(
                adminEnabled, adminUsername, adminPassword, UserRole.ADMIN);
        createUserIfEnabled(
                staffEnabled, staffUsername, staffPassword, UserRole.STAFF);
    }

    private void createUserIfEnabled(
            boolean enabled, String username, String password, UserRole role) {

        if (!enabled) {
            return;
        }

        if (username.isBlank() || password.isBlank()) {
            throw new IllegalStateException(
                    role + " bootstrap is enabled, but username or password is missing.");
        }

        if (password.length() < 12) {
            throw new IllegalStateException(
                    role + " password must be at least 12 characters.");
        }

        if (userRepository.existsByUsername(username)) {
            System.out.println(
                    role + " bootstrap skipped: username already exists.");
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);
        System.out.println(role + " account created successfully.");
    }
}
