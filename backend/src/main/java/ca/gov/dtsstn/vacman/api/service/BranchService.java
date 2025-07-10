package ca.gov.dtsstn.vacman.api.service;

import ca.gov.dtsstn.vacman.api.data.entity.BranchEntity;
import ca.gov.dtsstn.vacman.api.data.repository.BranchRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchService(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    public List<BranchEntity> getAllBranches() {
        return List.copyOf(branchRepository.findAll());
    }

    public Optional<BranchEntity> getBranchByCode(String code) {
        return branchRepository.findByCode(code);
    }

    public Optional<BranchEntity> getBranchById(Long id) {
        return branchRepository.findById(id);
    }
}