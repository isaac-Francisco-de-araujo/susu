package com.pinkpetal.studio.repository;

import com.pinkpetal.studio.model.FinancialEntry;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialRepository extends JpaRepository<FinancialEntry, UUID> {}
