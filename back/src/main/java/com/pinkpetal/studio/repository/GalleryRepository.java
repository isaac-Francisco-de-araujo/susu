package com.pinkpetal.studio.repository;

import com.pinkpetal.studio.model.GalleryPhoto;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GalleryRepository extends JpaRepository<GalleryPhoto, UUID> {
    List<GalleryPhoto> findAllByOrderByDisplayOrderAscTitleAsc();
}
