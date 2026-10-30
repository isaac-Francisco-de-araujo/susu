package com.pinkpetal.studio.service;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.repository.*;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ClientService {
    private final ClientRepository clients;
    private final AppointmentRepository appointments;
    public ClientService(ClientRepository clients, AppointmentRepository appointments) {
        this.clients = clients; this.appointments = appointments;
    }
    public StudioClient find(UUID id) {
        return clients.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrada"));
    }
    public List<StudioAppointment> history(UUID id) {
        find(id);
        return appointments.findByClientIdAndStatusOrderByStartsAtDesc(id, "Atendido");
    }
    private ClientResponse response(StudioClient client) {
        var history = appointments.findByClientIdAndStatusOrderByStartsAtDesc(client.id, "Atendido");
        var last = history.isEmpty() ? null : history.getFirst();
        return new ClientResponse(client.id, client.name, client.phone, client.birthday, client.firstVisit,
                client.notes, last == null ? null : last.startsAt, last == null ? null : last.serviceName,
                history.size(), history.stream().map(item -> item.price).reduce(BigDecimal.ZERO, BigDecimal::add));
    }
    public List<ClientResponse> list() {
        var totals = new HashMap<UUID, AppointmentRepository.ClientTotals>();
        appointments.summarizeClients().forEach(item -> totals.put(UUID.fromString(item.getClientId()), item));
        return clients.findAllByOrderByNameAsc().stream().map(client -> {
            var stats = totals.get(client.id);
            return new ClientResponse(client.id, client.name, client.phone, client.birthday, client.firstVisit,
                    client.notes, stats == null ? null : stats.getLastVisit(), stats == null ? null : stats.getLastProcedure(),
                    stats == null ? 0 : stats.getVisits(), stats == null ? BigDecimal.ZERO : stats.getSpent());
        }).toList();
    }
    @Transactional
    public ClientResponse save(UUID id, ClientInput input) {
        var client = id == null ? new StudioClient() : find(id);
        client.name = input.name().trim(); client.phone = input.phone().replaceAll("\\D", "");
        client.birthday = input.birthday(); client.firstVisit = input.firstVisit(); client.notes = input.notes();
        return response(clients.save(client));
    }
    @Transactional
    public void delete(UUID id) {
        var client = find(id);
        if (appointments.existsByClientId(id)) throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Esta cliente possui agendamentos ou histórico. Preserve o cadastro para manter os atendimentos.");
        clients.delete(client);
    }
}
