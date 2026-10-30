package com.pinkpetal.studio.service;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.repository.*;
import java.util.*;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class FinancialService {
    private final FinancialRepository entries;
    private final AppointmentRepository appointments;
    public FinancialService(FinancialRepository entries, AppointmentRepository appointments) {
        this.entries = entries; this.appointments = appointments;
    }
    public List<FinancialResponse> list() {
        // Completed appointments are projected, not copied, so edits and cancellations cannot duplicate revenue.
        var services = appointments.findByStatusOrderByStartsAtDesc("Atendido").stream()
                .map(item -> new FinancialResponse(item.id, "Entrada", item.serviceName,
                        item.startsAt.toLocalDate(), item.payment, item.price, "appointment"));
        return Stream.concat(entries.findAll().stream().map(FinancialResponse::from), services)
                .sorted(Comparator.comparing(FinancialResponse::date).reversed()
                        .thenComparing(FinancialResponse::id)).toList();
    }
    @Transactional
    public FinancialResponse save(UUID id, FinancialInput input) {
        var item = id == null ? new FinancialEntry() : find(id);
        item.type = input.type(); item.description = input.description().trim(); item.date = input.date();
        item.payment = input.payment(); item.amount = input.amount();
        return FinancialResponse.from(entries.save(item));
    }
    private FinancialEntry find(UUID id) {
        return entries.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento manual não encontrado"));
    }
    @Transactional
    public void delete(UUID id) { entries.delete(find(id)); }
}
