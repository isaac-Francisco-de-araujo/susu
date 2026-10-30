package com.pinkpetal.studio;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pinkpetal.studio.repository.ProcedureRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.test.context.support.WithMockUser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:studio-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.username=sa", "spring.datasource.password="
})
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(CsrfTestConfiguration.class)
@WithMockUser(roles = "ADMIN")
class ProcedureApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ProcedureRepository repository;

    private static final String INPUT = """
            {"name":"Manicure","short":"Cuidado essencial","description":"Esmaltação",
             "price":30.50,"duration":"40 min","icon":"Sparkles","image":"","active":true}
            """;

    @BeforeEach
    void reset() { repository.deleteAll(); }

    @Test
    void createsReadsUpdatesFiltersAndDeletesPersistedProcedure() throws Exception {
        var result = mvc.perform(post("/api/services").contentType(MediaType.APPLICATION_JSON).content(INPUT))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.short").value("Cuidado essencial"))
                .andReturn();
        var id = mapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
        assertThat(repository.findById(UUID.fromString(id))).isPresent();
        mvc.perform(get("/api/services/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(30.50));
        mvc.perform(put("/api/services/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content(INPUT.replace("true", "false").replace("30.50", "45.00")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.price").value(45.00));
        mvc.perform(get("/api/services").param("activeOnly", "true"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/services")).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(delete("/api/services/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/services/" + id)).andExpect(status().isNotFound());
        assertThat(repository.count()).isZero();
    }

    @Test
    void rejectsInvalidPriceAndMissingRequiredFields() throws Exception {
        mvc.perform(post("/api/services").contentType(MediaType.APPLICATION_JSON)
                        .content(INPUT.replace("30.50", "-1")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.price").exists());
        mvc.perform(post("/api/services").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.name").exists());
        assertThat(repository.count()).isZero();
    }

    @Test
    void allowsLocalFrontendOriginsAndRejectsUnknownOrigins() throws Exception {
        for (var origin : new String[] {"http://localhost:5173", "http://127.0.0.1:5173"}) {
            mvc.perform(options("/api/services").header("Origin", origin)
                            .header("Access-Control-Request-Method", "POST")
                            .header("Access-Control-Request-Headers", "Content-Type"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin));
        }
        mvc.perform(options("/api/services").header("Origin", "https://unknown.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    void handlesUnknownAndMalformedIds() throws Exception {
        mvc.perform(put("/api/services/" + UUID.randomUUID()).contentType(MediaType.APPLICATION_JSON).content(INPUT))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/services/" + UUID.randomUUID())).andExpect(status().isNotFound());
        mvc.perform(get("/api/services/not-a-uuid")).andExpect(status().isBadRequest());
    }
}
