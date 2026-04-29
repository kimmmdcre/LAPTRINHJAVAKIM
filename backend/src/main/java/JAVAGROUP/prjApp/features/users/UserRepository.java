package javagroup.prjApp.features.users;

import javagroup.prjApp.features.users.User;
import javagroup.prjApp.features.users.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    List<User> findByRoleCode(UserRole roleCode);
}
