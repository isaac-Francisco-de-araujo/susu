package com.pinkpetal.studio.repository;

import com.pinkpetal.studio.model.StudioSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

public interface SettingsRepository extends JpaRepository<StudioSettings, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StudioSettings s where s.id = 1")
    StudioSettings lockForScheduling();
}
