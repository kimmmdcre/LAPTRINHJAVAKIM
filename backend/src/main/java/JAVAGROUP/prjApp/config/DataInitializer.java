package javagroup.prjApp.config;

import javagroup.prjApp.repositories.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Synchronizing default credentials (username=password)...");

        syncUser("admin", "admin");
        syncUser("teacher", "teacher");
        syncUser("student1", "student1");
        syncUser("student2", "student2");

        logger.info("Credential synchronization completed.");
    }

    private void syncUser(String username, String password) {
        userRepository.findByUsername(username).ifPresentOrElse(
            user -> {
                user.setPasswordHash(passwordEncoder.encode(password));
                userRepository.save(user);
                logger.debug("Updated password for user: {}", username);
            },
            () -> {
                logger.warn("Default user '{}' not found in database. Skipping password sync for this account.", username);
                // We don't auto-create here to avoid constraint violations (like studentCode)
                // If you want to auto-create, you should ensure all unique fields are handled.
            }
        );
    }

}
