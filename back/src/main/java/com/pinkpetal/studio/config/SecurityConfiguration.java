package com.pinkpetal.studio.config;

import java.util.UUID;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfiguration {
    @Bean
    UserDetailsService users(@Value("${ADMIN_USERNAME:admim}") String username,
                            @Value("${ADMIN_PASSWORD:}") String configuredPassword) {
        String password = configuredPassword;
        if (password.isBlank()) {
            password = UUID.randomUUID().toString();
            LoggerFactory.getLogger(SecurityConfiguration.class)
                    .warn("Senha temporária de acesso para {}: {}. Configure ADMIN_PASSWORD para manter o acesso após reiniciar.", username, password);
        }
        return new InMemoryUserDetailsManager(User.withUsername(username)
                .password("{bcrypt}" + new BCryptPasswordEncoder().encode(password)).roles("ADMIN").build());
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http.cors(Customizer.withDefaults())
                .csrf(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionFixation(fixation -> fixation.changeSessionId()))
                .requestCache(cache -> cache.disable())
                .addFilterBefore(new com.pinkpetal.studio.security.LoginAttemptFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services/**", "/api/gallery", "/api/settings", "/api/uploads/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().hasRole("ADMIN"))
                .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType("application/problem+json;charset=UTF-8");
                    response.getWriter().write("{\"status\":401,\"detail\":\"Entre com seu usuário e senha para acessar o painel.\"}");
                }).accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(403);
                    response.setContentType("application/problem+json;charset=UTF-8");
                    response.getWriter().write("{\"status\":403,\"detail\":\"Operação não autorizada ou sessão de segurança expirada. Atualize a página e tente novamente.\"}");
                }))
                .formLogin(form -> form.loginProcessingUrl("/api/auth/login")
                        .successHandler((request, response, authentication) -> response.setStatus(204))
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/problem+json;charset=UTF-8");
                            response.getWriter().write("{\"status\":401,\"detail\":\"Usuário ou senha inválidos.\"}");
                        }))
                .logout(logout -> logout.logoutUrl("/api/auth/logout").invalidateHttpSession(true)
                        .deleteCookies("STUDIO_SESSION")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
                .headers(headers -> headers.referrerPolicy(policy -> policy.policy(
                        org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)))
                .build();
    }
}
