package com.pinkpetal.studio.service;

import com.pinkpetal.studio.model.Procedure;
import com.pinkpetal.studio.model.ProcedureInput;
import com.pinkpetal.studio.model.ProcedureResponse;
import com.pinkpetal.studio.repository.ProcedureRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ProcedureService {
    private final ProcedureRepository repository;

    public ProcedureService(ProcedureRepository repository) {
        this.repository = repository;
    }

    public List<ProcedureResponse> list(boolean activeOnly) {
        var procedures = activeOnly ? repository.findByActiveTrueOrderByNameAsc()
                : repository.findAllByOrderByNameAsc();
        return procedures.stream().map(ProcedureResponse::from).toList();
    }

    public ProcedureResponse get(UUID id) {
        return ProcedureResponse.from(find(id));
    }

    @Transactional
    public ProcedureResponse create(ProcedureInput input) {
        ProcedureDuration.minutes(input.duration());
        return ProcedureResponse.from(repository.save(new Procedure(input)));
    }

    @Transactional
    public ProcedureResponse update(UUID id, ProcedureInput input) {
        ProcedureDuration.minutes(input.duration());
        var procedure = find(id);
        procedure.update(input);
        return ProcedureResponse.from(procedure);
    }

    @Transactional
    public void delete(UUID id) {
        repository.delete(find(id));
    }

    private Procedure find(UUID id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedimento não encontrado"));
    }
}
