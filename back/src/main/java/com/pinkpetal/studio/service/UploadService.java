package com.pinkpetal.studio.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UploadService {
    private final Path directory;
    public UploadService(@Value("${app.upload-directory:./data/uploads}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }
    public String save(MultipartFile file) {
        String name = Objects.toString(file.getOriginalFilename(), "").toLowerCase(Locale.ROOT);
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024 || !(name.endsWith(".jpg") || name.endsWith(".jpeg")))
            throw invalid("Escolha uma imagem JPG/JPEG de até 5 MB");
        try (var stream = ImageIO.createImageInputStream(file.getInputStream())) {
            if (stream == null) throw invalid("Arquivo de imagem inválido");
            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw invalid("O arquivo não contém uma imagem JPEG válida");
            var reader = readers.next();
            try {
                if (!reader.getFormatName().equalsIgnoreCase("JPEG")) throw invalid("Somente imagens JPEG são aceitas");
                reader.setInput(stream);
                if ((long) reader.getWidth(0) * reader.getHeight(0) > 25_000_000)
                    throw invalid("A imagem deve ter no máximo 25 megapixels");
                var image = reader.read(0);
                Files.createDirectories(directory);
                var filename = UUID.randomUUID() + ".jpg";
                ImageIO.write(image, "jpg", directory.resolve(filename).toFile());
                return "/api/uploads/" + filename;
            } finally { reader.dispose(); }
        } catch (IOException exception) {
            throw invalid("Não foi possível processar a imagem JPEG");
        }
    }
    public Resource get(String name) {
        if (!name.matches("[0-9a-f-]{36}\\.jpg"))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var resource = new FileSystemResource(directory.resolve(name));
        if (!resource.exists() || !resource.isReadable()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return resource;
    }
    public void requireUploadedImage(String image) {
        if (image == null || !image.startsWith("/api/uploads/")) throw invalid("Envie uma foto JPG/JPEG antes de salvar");
        get(image.substring("/api/uploads/".length()));
    }
    private ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
