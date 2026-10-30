package com.pinkpetal.studio.service;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.repository.GalleryRepository;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class GalleryService {
    private final GalleryRepository repository;
    private final UploadService uploads;
    public GalleryService(GalleryRepository repository, UploadService uploads) { this.repository = repository; this.uploads = uploads; }
    public List<GalleryPhoto> list() { return repository.findAllByOrderByDisplayOrderAscTitleAsc(); }
    private GalleryPhoto find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foto não encontrada"));
    }
    @Transactional
    public GalleryPhoto save(UUID id, GalleryInput input) {
        uploads.requireUploadedImage(input.image());
        var item = id == null ? new GalleryPhoto() : find(id);
        item.title = input.title().trim(); item.image = input.image(); item.active = input.active(); item.displayOrder = input.displayOrder();
        return repository.save(item);
    }
    @Transactional public void delete(UUID id) { repository.delete(find(id)); }
}
