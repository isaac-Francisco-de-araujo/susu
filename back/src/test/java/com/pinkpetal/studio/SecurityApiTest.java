package com.pinkpetal.studio;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:security-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "ADMIN_USERNAME=professional", "ADMIN_PASSWORD=test-only-password"
})
@AutoConfigureMockMvc
class SecurityApiTest {
    @Autowired MockMvc mvc;

    @Test void publicSiteRemainsAccessibleButPrivateDataAndWritesRequireLogin() throws Exception {
        for (var path : new String[]{"/api/services", "/api/gallery", "/api/settings"})
            mvc.perform(get(path)).andExpect(status().isOk());
        mvc.perform(get("/api/settings")).andExpect(jsonPath("$.slotMinutes").doesNotExist())
                .andExpect(jsonPath("$.remindersEnabled").doesNotExist());
        for (var path : new String[]{"/api/clients", "/api/appointments", "/api/finance", "/api/auth/me", "/api/backups"})
            mvc.perform(get(path)).andExpect(status().isUnauthorized())
                    .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("no-store")));
        for (var path : new String[]{"/api/services", "/api/gallery", "/api/clients", "/api/appointments", "/api/uploads", "/api/finance"})
            mvc.perform(post(path).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/settings").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test void realLoginRotatesSessionAndLogoutRevokesIt() throws Exception {
        var before = (MockHttpSession) mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString()).andReturn().getRequest().getSession();
        String previousId = before.getId();
        mvc.perform(post("/api/auth/login").with(csrf()).param("username", "professional").param("password", "wrong"))
                .andExpect(status().isUnauthorized());
        var session = (MockHttpSession) mvc.perform(post("/api/auth/login").session(before).with(csrf())
                .param("username", "professional").param("password", "test-only-password"))
                .andExpect(status().isNoContent()).andReturn().getRequest().getSession();
        assertThat(session.getId()).isNotEqualTo(previousId);
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("professional"));
        mvc.perform(get("/api/clients").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
        mvc.perform(get("/api/clients")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").with(httpBasic("professional", "test-only-password")))
                .andExpect(status().isUnauthorized());
    }

    @Test void csrfAndRoleAreRequiredEvenWithAnAuthenticatedUser() throws Exception {
        mvc.perform(post("/api/clients").with(user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/login").param("username", "professional").param("password", "test-only-password"))
                .andExpect(status().isForbidden());
        for (var path : new String[]{"/api/clients", "/api/appointments", "/api/finance", "/api/backups"})
            mvc.perform(get(path).with(user("visitor").roles("USER"))).andExpect(status().isForbidden());
        for (var path : new String[]{"/api/services", "/api/gallery", "/api/clients", "/api/appointments", "/api/finance"}) {
            mvc.perform(post(path).with(user("visitor").roles("USER")).with(csrf())
                    .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isForbidden());
            mvc.perform(delete(path + "/00000000-0000-0000-0000-000000000001").with(csrf()))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test void inactiveProceduresAreVisibleOnlyToTheAdministrator() throws Exception {
        var response = mvc.perform(post("/api/services").with(user("professional").roles("ADMIN")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Oculto","short":"","description":"","price":20,"duration":"30 min","icon":"Sparkles","image":"","active":false}
                """)).andExpect(status().isCreated()).andReturn();
        var location = response.getResponse().getHeader("Location");
        mvc.perform(get("/api/services")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get(location)).andExpect(status().isNotFound());
        mvc.perform(get(location).with(user("visitor").roles("USER"))).andExpect(status().isNotFound());
        mvc.perform(get(location).with(user("professional").roles("ADMIN"))).andExpect(status().isOk());
    }

    @Test void repeatedLoginFailuresAreThrottled() throws Exception {
        for (int i = 0; i < 10; i++)
            mvc.perform(post("/api/auth/login").servletPath("/api/auth/login").with(csrf())
                    .with(request -> { request.setRemoteAddr("192.0.2.10"); return request; })
                    .param("username", "professional").param("password", "wrong"))
                    .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").servletPath("/api/auth/login").with(csrf())
                .with(request -> { request.setRemoteAddr("192.0.2.10"); return request; })
                .param("username", "professional").param("password", "wrong"))
                .andExpect(status().isTooManyRequests()).andExpect(header().string("Retry-After", "900"));
    }
}
