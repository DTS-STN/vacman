package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;

@Service
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;

    public WorkScheduleService(WorkScheduleRepository workScheduleRepository) {
        this.workScheduleRepository = workScheduleRepository;
    }

    public List<WorkScheduleEntity> getAllWorkSchedules() {
        return workScheduleRepository.findAll();
    }

    public Optional<WorkScheduleEntity> getWorkScheduleById(Long id) {
        return workScheduleRepository.findById(id);
    }

    public Optional<WorkScheduleEntity> getWorkScheduleByCode(String code) {
        return workScheduleRepository.findByCode(code);
    }

    public WorkScheduleEntity saveWorkSchedule(WorkScheduleEntity workSchedule) {
        return workScheduleRepository.save(workSchedule);
    }

    public void deleteWorkSchedule(Long id) {
        workScheduleRepository.deleteById(id);
    }
}
