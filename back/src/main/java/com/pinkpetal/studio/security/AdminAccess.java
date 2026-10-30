package com.pinkpetal.studio.security;

import java.security.Principal;
import org.springframework.security.core.Authentication;

public final class AdminAccess {
    private AdminAccess() {}
    public static boolean allowed(Principal principal) {
        return principal instanceof Authentication auth && auth.isAuthenticated()
                && auth.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));
    }
}
