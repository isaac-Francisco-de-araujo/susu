package com.pinkpetal.studio.repository;

import com.pinkpetal.studio.model.StudioAppointment;
import java.util.*;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<StudioAppointment, UUID> {
    List<StudioAppointment> findAllByOrderByStartsAtAsc();
    List<StudioAppointment> findByClientIdAndStatusOrderByStartsAtDesc(UUID clientId, String status);
    List<StudioAppointment> findByStatusOrderByStartsAtDesc(String status);
    boolean existsByClientId(UUID clientId);
    List<StudioAppointment> findByStartsAtGreaterThanEqualAndStartsAtLessThan(LocalDateTime from, LocalDateTime to);

    interface ClientTotals {
        String getClientId();
        int getVisits();
        java.math.BigDecimal getSpent();
        LocalDateTime getLastVisit();
        String getLastProcedure();
    }

    @Query(value = """
            SELECT CAST(t.client_id AS VARCHAR(36)) AS "clientId", t.visits AS "visits", t.spent AS "spent",
                   t.starts_at AS "lastVisit", t.service_name AS "lastProcedure"
            FROM (
                SELECT client_id, starts_at, service_name,
                       COUNT(*) OVER (PARTITION BY client_id) AS visits,
                       SUM(price) OVER (PARTITION BY client_id) AS spent,
                       ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY starts_at DESC, id DESC) AS position
                FROM appointments WHERE status = 'Atendido'
            ) t WHERE t.position = 1
            """, nativeQuery = true)
    List<ClientTotals> summarizeClients();
}
