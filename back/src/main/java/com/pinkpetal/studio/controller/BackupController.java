package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.service.BackupService;
import java.io.*;
import java.nio.file.Files;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backups")
public class BackupController {
    private final BackupService backups;
    public BackupController(BackupService backups) { this.backups = backups; }

    @GetMapping(produces = "application/zip")
    public ResponseEntity<Resource> download() throws IOException, SQLException {
        var archive = backups.createArchive();
        var resource = new FileSystemResource(archive) {
            @Override public InputStream getInputStream() throws IOException {
                return new FilterInputStream(super.getInputStream()) {
                    @Override public void close() throws IOException {
                        try { super.close(); } finally { Files.deleteIfExists(archive); }
                    }
                };
            }
        };
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"studio-backup-" + LocalDate.now() + ".zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .contentLength(Files.size(archive)).body(resource);
    }
}
