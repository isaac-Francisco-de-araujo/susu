package com.pinkpetal.studio;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pinkpetal.studio.repository.*;
import java.util.List;
import java.util.concurrent.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:operations-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.username=sa", "spring.datasource.password=", "ADMIN_PASSWORD=test-only-password"
})
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(CsrfTestConfiguration.class)
@WithMockUser(roles = "ADMIN")
class OperationalFlowsTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired AppointmentRepository appointments;
    @Autowired FinancialRepository finance;
    @Autowired ClientRepository clients;
    @Autowired ProcedureRepository procedures;

    @BeforeEach void reset() {
        appointments.deleteAll(); finance.deleteAll(); clients.deleteAll(); procedures.deleteAll();
    }
    private JsonNode create(String path, String body) throws Exception {
        return mapper.readTree(mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }
    private ObjectNode input() throws Exception {
        var client = create("/api/clients", """
                {"name":"Cliente real","phone":"5511999998888","birthday":null,"firstVisit":null,"notes":""}
                """);
        var service = create("/api/services", """
                {"name":"Procedimento real","short":"","description":"","price":80,"duration":"1h30","icon":"Sparkles","image":"","active":true}
                """);
        return mapper.createObjectNode().put("clientId", client.get("id").asText())
                .put("serviceId", service.get("id").asText()).put("startsAt", "2026-10-22T09:00:00")
                .put("price", 80).put("status", "Confirmado").put("payment", "Pix").put("notes", "");
    }

    @Test void blocksOverlapsAndClosingTimeButAllowsAdjacentAppointmentsAndCancellation() throws Exception {
        var input = input();
        var first = create("/api/appointments", input.toString());
        assertThat(first.get("durationMinutes").asInt()).isEqualTo(90);
        input.put("startsAt", "2026-10-22T10:00:00");
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isConflict());
        input.put("startsAt", "2026-10-22T10:30:00");
        create("/api/appointments", input.toString());
        input.put("startsAt", "2026-10-22T18:00:00");
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isBadRequest());
        input.put("startsAt", "2026-10-22T08:30:00");
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isBadRequest());
        input.put("startsAt", "2026-10-22T09:00:00").put("status", "Cancelado");
        mvc.perform(put("/api/appointments/" + first.get("id").asText()).contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isOk());
        input.put("status", "Confirmado");
        create("/api/appointments", input.toString());
    }

    @Test void simultaneousRequestsCannotDoubleBookTheSameInterval() throws Exception {
        var input = input().toString();
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Integer> request = () -> {
                ready.countDown(); start.await(5, TimeUnit.SECONDS);
                return mvc.perform(post("/api/appointments").with(user("professional").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON).content(input)).andReturn().getResponse().getStatus();
            };
            var first = executor.submit(request); var second = executor.submit(request);
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue(); start.countDown();
            assertThat(List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(201, 409);
        }
        assertThat(appointments.count()).isEqualTo(1);
    }

    @Test void revenueFollowsCompletedAppointmentsWithoutDuplicationAndManualEntriesKeepTheirDate() throws Exception {
        var input = input();
        var appointment = create("/api/appointments", input.toString());
        mvc.perform(get("/api/finance")).andExpect(jsonPath("$.length()").value(0));
        input.put("status", "Atendido");
        for (int i = 0; i < 2; i++) mvc.perform(put("/api/appointments/" + appointment.get("id").asText())
                .contentType(MediaType.APPLICATION_JSON).content(input.toString())).andExpect(status().isOk());
        mvc.perform(get("/api/finance")).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].amount").value(80)).andExpect(jsonPath("$[0].source").value("appointment"));
        input.put("price", 95);
        mvc.perform(put("/api/appointments/" + appointment.get("id").asText()).contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isOk());
        mvc.perform(get("/api/finance")).andExpect(jsonPath("$[0].amount").value(95));
        mvc.perform(get("/api/clients")).andExpect(jsonPath("$[0].visits").value(1)).andExpect(jsonPath("$[0].spent").value(95));
        var manual = create("/api/finance", """
                {"type":"Despesa","description":"Esmaltes","date":"2025-02-03","payment":"Pix","amount":25.50}
                """);
        assertThat(manual.get("date").asText()).isEqualTo("2025-02-03");
        assertThat(manual.get("source").asText()).isEqualTo("manual");
        input.put("status", "Cancelado");
        mvc.perform(put("/api/appointments/" + appointment.get("id").asText()).contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isOk());
        mvc.perform(get("/api/finance")).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].source").value("manual"));
        mvc.perform(put("/api/finance/" + manual.get("id").asText()).contentType(MediaType.APPLICATION_JSON).content("""
                {"type":"Despesa","description":"Esmaltes atualizados","date":"2025-02-04","payment":"Dinheiro","amount":30}
                """)).andExpect(status().isOk()).andExpect(jsonPath("$.date").value("2025-02-04"));
        mvc.perform(delete("/api/finance/" + manual.get("id").asText())).andExpect(status().isNoContent());
        mvc.perform(get("/api/finance")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/finance").contentType(MediaType.APPLICATION_JSON).content("""
                {"type":"Despesa","description":"Inválido","date":"2025-02-03","payment":"Pix","amount":-1}
                """)).andExpect(status().isBadRequest());
    }
}
