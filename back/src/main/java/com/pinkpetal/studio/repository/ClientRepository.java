package com.pinkpetal.studio.repository;

import com.pinkpetal.studio.model.StudioClient;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<StudioClient, UUID> {
    List<StudioClient> findAllByOrderByNameAsc();
}
