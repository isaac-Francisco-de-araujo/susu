package com.pinkpetal.studio.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.filter.OncePerRequestFilter;

/** Bounded, in-memory throttling. Never records usernames, passwords or request bodies. */
public class LoginAttemptFilter extends OncePerRequestFilter {
    private record Attempt(int failures, long expiresAt) {}
    private final Map<String, Attempt> attempts = new HashMap<>();
    private static final long WINDOW = 15 * 60 * 1000L;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (!request.getServletPath().equals("/api/auth/login") || !request.getMethod().equals("POST")) {
            chain.doFilter(request, response);
            return;
        }
        String address = request.getRemoteAddr(); // Do not trust client-supplied forwarding headers.
        synchronized (attempts) {
            long now = System.currentTimeMillis();
            attempts.entrySet().removeIf(entry -> entry.getValue().expiresAt <= now);
            Attempt previous = attempts.get(address);
            if ((previous != null && previous.failures >= 10) || (previous == null && attempts.size() >= 1024)) {
                response.setStatus(429);
                response.setHeader("Retry-After", "900");
                response.setContentType("application/problem+json;charset=UTF-8");
                response.getWriter().write("{\"status\":429,\"detail\":\"Muitas tentativas de acesso. Aguarde 15 minutos.\"}");
                return;
            }
            attempts.put(address, new Attempt(previous == null ? 1 : previous.failures + 1,
                    previous == null ? now + WINDOW : previous.expiresAt));
        }
        chain.doFilter(request, response);
        if (response.getStatus() == 204) synchronized (attempts) { attempts.remove(address); }
    }
}
