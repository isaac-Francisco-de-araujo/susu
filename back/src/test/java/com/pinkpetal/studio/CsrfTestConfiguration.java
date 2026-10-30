package com.pinkpetal.studio;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

/** Business-flow tests act as a legitimate browser; security tests exercise missing tokens separately. */
@TestConfiguration
public class CsrfTestConfiguration {
    @Bean MockMvcBuilderCustomizer csrfRequests() {
        return builder -> builder.defaultRequest(get("/").with(csrf()));
    }
}
