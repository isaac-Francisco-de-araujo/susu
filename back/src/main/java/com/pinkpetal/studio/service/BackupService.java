package com.pinkpetal.studio.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.sql.DataSource;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BackupService {
    private final DataSource dataSource;
    private final Path uploads;
    private final Path backups;
    private final boolean enabled;
    private final int retention;

    public BackupService(DataSource dataSource,
                         @Value("${app.upload-directory:./data/uploads}") String uploads,
                         @Value("${app.backup-directory:./data/backups}") String backups,
                         @Value("${app.backup-enabled:true}") boolean enabled,
                         @Value("${app.backup-retention:7}") int retention) {
        this.dataSource = dataSource;
        this.uploads = Path.of(uploads).toAbsolutePath().normalize();
        this.backups = Path.of(backups).toAbsolutePath().normalize();
        this.enabled = enabled;
        this.retention = Math.max(1, retention);
    }

    public synchronized Path createArchive() throws IOException, SQLException {
        // H2 SCRIPT produces a transactionally consistent logical database backup,
        // including Flyway history. Never copy a live .mv.db file.
        try (var connection = dataSource.getConnection()) {
            if (!connection.getMetaData().getDatabaseProductName().equals("H2"))
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "O backup integrado atende ao banco local H2. Para PostgreSQL, use pg_dump e copie a pasta de uploads.");
            Path sql = Files.createTempFile("studio-database-", ".sql");
            Path archive = null;
            boolean complete = false;
            try {
                try (var statement = connection.createStatement()) {
                    statement.execute("SCRIPT TO '" + sql.toString().replace("'", "''") + "'");
                }
                archive = Files.createTempFile("studio-backup-", ".zip");
                try (var zip = new ZipOutputStream(Files.newOutputStream(archive))) {
                    addFile(zip, sql, "database.sql");
                    if (Files.isDirectory(uploads)) {
                        // Uploads have immutable UUID filenames and are never removed on edits.
                        try (var files = Files.list(uploads)) {
                            for (var file : files.filter(path -> Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)).toList())
                                addFile(zip, file, "uploads/" + file.getFileName());
                        }
                    }
                    zip.putNextEntry(new ZipEntry("LEIA-ME.txt"));
                    zip.write(("Backup do Studio - " + LocalDateTime.now() + "\n\n"
                            + "Contém o banco H2 completo em database.sql e as fotos em uploads/.\n"
                            + "Restaure em um banco NOVO usando org.h2.tools.RunScript (H2 2.3.232), com a API parada.\n"
                            + "Use a mesma URL JDBC e opções da configuração local, apontando para o banco novo.\n"
                            + "Copie uploads/ para UPLOAD_DIRECTORY antes de iniciar a API.\n"
                            + "Consulte back/README.md para os comandos de restauração.\n")
                            .getBytes(StandardCharsets.UTF_8));
                    zip.closeEntry();
                }
                complete = true;
                return archive;
            } finally {
                Files.deleteIfExists(sql);
                if (!complete && archive != null) Files.deleteIfExists(archive);
            }
        }
    }

    private void addFile(ZipOutputStream zip, Path file, String name) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        Files.copy(file, zip);
        zip.closeEntry();
    }

    @Scheduled(initialDelayString = "${app.backup-initial-delay-ms:60000}", fixedDelayString = "${app.backup-interval-ms:86400000}")
    public void scheduledBackup() {
        if (!enabled) return;
        try (var connection = dataSource.getConnection()) {
            if (!connection.getMetaData().getDatabaseProductName().equals("H2")) return;
            Path archive = createArchive();
            try {
                Files.createDirectories(backups);
                String name = "studio-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS")) + ".zip";
                Files.move(archive, backups.resolve(name), StandardCopyOption.REPLACE_EXISTING);
                try (var files = Files.list(backups)) {
                    for (var old : files.filter(path -> path.getFileName().toString().matches("studio-\\d{8}-\\d{6}-\\d{3}\\.zip"))
                            .sorted(Comparator.reverseOrder()).skip(retention).toList()) Files.delete(old);
                }
                LoggerFactory.getLogger(BackupService.class).info("Backup salvo em {}", backups.resolve(name));
            } finally { Files.deleteIfExists(archive); }
        } catch (IOException | SQLException | RuntimeException exception) {
            LoggerFactory.getLogger(BackupService.class).error("Não foi possível gerar o backup automático", exception);
        }
    }
}
