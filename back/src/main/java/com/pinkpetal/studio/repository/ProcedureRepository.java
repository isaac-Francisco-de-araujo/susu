package com.pinkpetal.studio.repository;

import com.pinkpetal.studio.model.Procedure;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcedureRepository extends JpaRepository<Procedure, UUID> {
    List<Procedure> findAllByOrderByNameAsc();
    List<Procedure> findByActiveTrueOrderByNameAsc();
}
