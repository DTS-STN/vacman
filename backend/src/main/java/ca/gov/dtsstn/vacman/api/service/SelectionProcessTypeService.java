package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;

@Service
public class SelectionProcessTypeService {

    private final SelectionProcessTypeRepository selectionProcessTypeRepository;

    public SelectionProcessTypeService(SelectionProcessTypeRepository selectionProcessTypeRepository) {
        this.selectionProcessTypeRepository = selectionProcessTypeRepository;
    }

    public List<SelectionProcessTypeEntity> getAllSelectionProcessTypes() {
        return selectionProcessTypeRepository.findAll();
    }

    public Optional<SelectionProcessTypeEntity> getSelectionProcessTypeById(Long id) {
        return selectionProcessTypeRepository.findById(id);
    }

    public Optional<SelectionProcessTypeEntity> getSelectionProcessTypeByCode(String code) {
        return selectionProcessTypeRepository.findByCode(code);
    }

    public SelectionProcessTypeEntity saveSelectionProcessType(SelectionProcessTypeEntity selectionProcessType) {
        return selectionProcessTypeRepository.save(selectionProcessType);
    }

    public void deleteSelectionProcessType(Long id) {
        selectionProcessTypeRepository.deleteById(id);
    }
}
