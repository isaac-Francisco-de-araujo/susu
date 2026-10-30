package com.pinkpetal.studio.service;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.repository.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class AppointmentService {
    private final AppointmentRepository appointments;
    private final ClientService clients;
    private final ProcedureRepository procedures;
    private final SettingsRepository settings;
    public AppointmentService(AppointmentRepository appointments, ClientService clients, ProcedureRepository procedures, SettingsRepository settings) {
        this.appointments = appointments; this.clients = clients; this.procedures = procedures; this.settings = settings;
    }
    public List<StudioAppointment> list() { return appointments.findAllByOrderByStartsAtAsc(); }
    @Transactional
    public StudioAppointment save(UUID id, AppointmentInput input) {
        // One studio/professional: serialize scheduling, including concurrent requests.
        var hours = settings.lockForScheduling();
        var item = id == null ? new StudioAppointment() : appointments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));
        clients.find(input.clientId());
        var procedure = procedures.findById(input.serviceId());
        if (procedure.isEmpty() && !input.serviceId().equals(item.serviceId))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Procedimento não encontrado");
        boolean changedService = !input.serviceId().equals(item.serviceId);
        if (changedService && !procedure.orElseThrow().isActive())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha um procedimento ativo");
        int duration = changedService ? ProcedureDuration.minutes(procedure.orElseThrow().getDuration()) : item.durationMinutes;
        var end = input.startsAt().plusMinutes(duration);
        boolean blocksTime = !Set.of("Cancelado", "Não atendido").contains(input.status());
        boolean rescheduled = id == null || changedService || !input.startsAt().equals(item.startsAt)
                || Set.of("Cancelado", "Não atendido").contains(item.status);
        if (blocksTime && rescheduled && (!end.toLocalDate().equals(input.startsAt().toLocalDate())
                || input.startsAt().toLocalTime().isBefore(hours.opensAt) || end.toLocalTime().isAfter(hours.closesAt)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O atendimento completo deve ficar dentro do horário de funcionamento");
        if (blocksTime) {
            var nearby = appointments.findByStartsAtGreaterThanEqualAndStartsAtLessThan(input.startsAt().minusDays(1), end);
            boolean overlaps = nearby.stream().anyMatch(other -> !other.id.equals(id)
                    && !Set.of("Cancelado", "Não atendido").contains(other.status)
                    && other.startsAt.plusMinutes(other.durationMinutes).isAfter(input.startsAt()));
            if (overlaps) throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um atendimento nesse intervalo. Escolha outro horário.");
        }
        // Preserve the historical name when only date, price or status changes.
        if (!input.serviceId().equals(item.serviceId)) item.serviceName = procedure.orElseThrow().getName();
        item.clientId = input.clientId(); item.serviceId = input.serviceId(); item.startsAt = input.startsAt();
        item.durationMinutes = duration;
        item.price = input.price(); item.status = input.status(); item.payment = input.payment(); item.notes = input.notes();
        return appointments.save(item);
    }
}
