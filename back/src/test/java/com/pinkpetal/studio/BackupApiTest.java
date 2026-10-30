package com.pinkpetal.studio;

import com.pinkpetal.studio.service.BackupService;
import java.io.*;
import java.nio.file.*;
import java.sql.DriverManager;
import java.util.HashMap;
import java.util.zip.ZipInputStream;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:backup-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.username=sa", "spring.datasource.password=", "app.backup-enabled=false"
})
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(CsrfTestConfiguration.class)
class BackupApiTest {
    @TempDir static Path directory;
    @Autowired MockMvc mvc;
    @Autowired DataSource dataSource;

    @DynamicPropertySource static void properties(DynamicPropertyRegistry registry) {
        registry.add("app.upload-directory", () -> directory.resolve("uploads").toString());
    }

    @Test void backupRequiresAuthenticationAndRestoresDatabaseAndPhotos() throws Exception {
        mvc.perform(get("/api/backups")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/clients").with(user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Cliente do backup","phone":"5511999998888","birthday":null,"firstVisit":null,"notes":"Preservar histórico"}
                """)).andExpect(status().isCreated());
        Files.createDirectories(directory.resolve("uploads"));
        byte[] photo = {1, 2, 3, 4};
        Files.write(directory.resolve("uploads/photo.jpg"), photo);
        var response = mvc.perform(get("/api/backups").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk()).andExpect(content().contentType("application/zip"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andReturn().getResponse().getContentAsByteArray();
        var files = new HashMap<String, byte[]>();
        try (var zip = new ZipInputStream(new ByteArrayInputStream(response))) {
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry())
                files.put(entry.getName(), zip.readAllBytes());
        }
        assertThat(files.keySet()).contains("database.sql", "uploads/photo.jpg", "LEIA-ME.txt");
        assertThat(files.get("uploads/photo.jpg")).isEqualTo(photo);
        var sql = directory.resolve("database.sql");
        Files.write(sql, files.get("database.sql"));
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:restored;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE", "sa", "");
             var statement = connection.createStatement()) {
            statement.execute("RUNSCRIPT FROM '" + sql.toString().replace("'", "''") + "'");
            try (var result = statement.executeQuery("SELECT name, notes FROM clients WHERE name = 'Cliente do backup'")) {
                assertThat(result.next()).isTrue();
                assertThat(result.getString("notes")).isEqualTo("Preservar histórico");
            }
            try (var result = statement.executeQuery("SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE")) {
                result.next(); assertThat(result.getInt(1)).isGreaterThanOrEqualTo(4);
            }
        }
    }

    @Test void scheduledBackupsKeepOnlyConfiguredRetention() throws Exception {
        var destination = directory.resolve("scheduled");
        var service = new BackupService(dataSource, directory.resolve("uploads").toString(), destination.toString(), true, 1);
        service.scheduledBackup();
        Thread.sleep(10);
        service.scheduledBackup();
        try (var files = Files.list(destination)) {
            assertThat(files.toList()).hasSize(1).allMatch(path -> path.toString().endsWith(".zip"));
        }
    }
}
