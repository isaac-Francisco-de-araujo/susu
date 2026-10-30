package com.pinkpetal.studio;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:features-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.username=sa", "spring.datasource.password="
})
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(CsrfTestConfiguration.class)
@WithMockUser(roles = "ADMIN")
class StudioFeaturesTest {
    @TempDir static Path uploads;
    @DynamicPropertySource static void properties(DynamicPropertyRegistry registry) {
        registry.add("app.upload-directory", () -> uploads.toString());
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    private JsonNode create(String path, String input) throws Exception {
        var result = mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(input))
                .andExpect(status().isCreated()).andReturn();
        return mapper.readTree(result.getResponse().getContentAsString());
    }

    @Test void historyBelongsToClientIncludesOnlyCompletedAndPreservesProcedureSnapshot() throws Exception {
        var client = create("/api/clients", """
                {"name":"Maria","phone":"5511999991111","birthday":"1990-01-02","firstVisit":null,"notes":"Alergia a produto X"}
                """);
        var other = create("/api/clients", """
                {"name":"Ana","phone":"5511999992222","birthday":null,"firstVisit":null,"notes":""}
                """);
        var service = create("/api/services", """
                {"name":"Manicure histórica","short":"","description":"","price":30,"duration":"40 min","icon":"Sparkles","image":"","active":true}
                """);
        var input = mapper.createObjectNode().put("clientId", client.get("id").asText())
                .put("serviceId", service.get("id").asText()).put("startsAt", "2026-01-10T09:00:00")
                .put("price", 30).put("status", "Atendido").put("payment", "Pix").put("notes", "Esmalte rosa");
        create("/api/appointments", input.toString());
        input.put("startsAt", "2026-02-10T09:00:00").put("price", 45);
        var latest = create("/api/appointments", input.toString());
        input.put("startsAt", "2026-03-10T09:00:00").put("status", "Cancelado");
        create("/api/appointments", input.toString());
        input.put("clientId", other.get("id").asText()).put("status", "Atendido");
        create("/api/appointments", input.toString());
        mvc.perform(get("/api/clients/" + client.get("id").asText() + "/history"))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(latest.get("id").asText()))
                .andExpect(jsonPath("$[0].notes").value("Esmalte rosa"));
        var updatedService = (ObjectNode) service.deepCopy();
        updatedService.put("name", "Nome novo");
        mvc.perform(put("/api/services/" + service.get("id").asText()).contentType(MediaType.APPLICATION_JSON).content(updatedService.toString()))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/services/" + service.get("id").asText())).andExpect(status().isNoContent());
        mvc.perform(get("/api/clients/" + client.get("id").asText() + "/history"))
                .andExpect(jsonPath("$[0].serviceName").value("Manicure histórica"));
        var list = mapper.readTree(mvc.perform(get("/api/clients")).andReturn().getResponse().getContentAsString());
        JsonNode maria = null;
        for (var item : list) if (item.get("id").equals(client.get("id"))) maria = item;
        assertThat(maria).isNotNull();
        assertThat(maria.get("visits").asInt()).isEqualTo(2);
        assertThat(maria.get("spent").decimalValue()).isEqualByComparingTo("75");
        assertThat(maria.get("lastProcedure").asText()).isEqualTo("Manicure histórica");
        mvc.perform(delete("/api/clients/" + client.get("id").asText())).andExpect(status().isConflict());
        mvc.perform(get("/api/clients/" + UUID.randomUUID() + "/history")).andExpect(status().isNotFound());
    }

    @Test void savesSettingsAndRejectsInvalidBusinessHours() throws Exception {
        var settings = mapper.createObjectNode().put("studioName", "Studio Teste").put("professionalName", "Maria")
                .put("whatsapp", "+55 (11) 98888-7777").put("instagram", "@studio.teste")
                .put("address", "Rua Teste, 42").put("firstWeekday", 0).put("slotMinutes", 15)
                .put("opensAt", "08:00").put("closesAt", "17:00").put("remindersEnabled", false);
        mvc.perform(put("/api/settings").contentType(MediaType.APPLICATION_JSON).content(settings.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.whatsapp").value("5511988887777"));
        mvc.perform(get("/api/settings")).andExpect(jsonPath("$.studioName").value("Studio Teste"))
                .andExpect(jsonPath("$.slotMinutes").value(15)).andExpect(jsonPath("$.remindersEnabled").value(false));
        settings.put("closesAt", "07:00");
        mvc.perform(put("/api/settings").contentType(MediaType.APPLICATION_JSON).content(settings.toString()))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/settings")).andExpect(jsonPath("$.closesAt").value("17:00:00"));
    }

    @Test void rejectsInvalidClientPhoneAndAppointmentsWithoutExistingClients() throws Exception {
        mvc.perform(post("/api/clients").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Maria","phone":"----------","birthday":null,"firstVisit":null,"notes":""}
                """)).andExpect(status().isBadRequest());
        var input = mapper.createObjectNode().put("clientId", UUID.randomUUID().toString())
                .put("serviceId", UUID.randomUUID().toString()).put("startsAt", "2026-01-10T09:00:00")
                .put("price", 30).put("status", "Atendido").put("payment", "Pix").put("notes", "");
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content(input.toString()))
                .andExpect(status().isNotFound());
    }

    @Test void validatesJpegContentAndServesUploadedPhotosAndGalleryEdits() throws Exception {
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(20, 20, BufferedImage.TYPE_INT_RGB), "jpg", bytes);
        var file = new MockMultipartFile("file", "foto.JPEG", "image/jpeg", bytes.toByteArray());
        var uploaded = mvc.perform(multipart("/api/uploads").file(file)).andExpect(status().isCreated()).andReturn();
        var url = mapper.readTree(uploaded.getResponse().getContentAsString()).get("url").asText();
        mvc.perform(get(url)).andExpect(status().isOk()).andExpect(content().contentType(MediaType.IMAGE_JPEG));
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "fake.jpg", "image/jpeg", "not a JPEG".getBytes())))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "photo.png", "image/png", bytes.toByteArray())))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "big.jpg", "image/jpeg", new byte[5 * 1024 * 1024 + 1])))
                .andExpect(status().isBadRequest());
        var photo = mapper.createObjectNode().put("title", "Unhas rosa").put("image", url).put("active", true).put("displayOrder", 2);
        var created = create("/api/gallery", photo.toString());
        photo.put("title", "Trabalho atualizado").put("active", false).put("displayOrder", 1);
        mvc.perform(put("/api/gallery/" + created.get("id").asText()).contentType(MediaType.APPLICATION_JSON).content(photo.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(get("/api/gallery")).andExpect(jsonPath("$[0].title").value("Trabalho atualizado"));
        mvc.perform(delete("/api/gallery/" + created.get("id").asText())).andExpect(status().isNoContent());
        mvc.perform(get("/api/gallery")).andExpect(jsonPath("$.length()").value(0));
        photo.put("image", "https://example.com/image.jpg");
        mvc.perform(post("/api/gallery").contentType(MediaType.APPLICATION_JSON).content(photo.toString())).andExpect(status().isBadRequest());
    }
}
