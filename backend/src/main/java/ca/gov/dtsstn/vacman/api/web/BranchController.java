package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.BranchService;
import ca.gov.dtsstn.vacman.api.web.model.BranchReadModel;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.BranchModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Branches")
@RequestMapping({ "/api/v1/branches" })
public class BranchController {

    private final BranchModelMapper branchModelMapper = Mappers.getMapper(BranchModelMapper.class);

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Get all branches or filter by code.", description = "Returns a collection of all branches, or branches filtered by code.")
    public ResponseEntity<CollectionModel<BranchReadModel>> getBranches(
            @RequestParam(required = false)
            @Parameter(description = "Branch code to filter by (e.g., 'IITB' for Innovation, Information and Technology Branch)") String code) {

        if (isNotBlank(code)) {
            CollectionModel<BranchReadModel> result = new CollectionModel<>(branchService.getBranchByCode(code)
                .map(branchModelMapper::toModel)
                .map(List::of)
                .orElse(List.of()));
            return ResponseEntity.ok(result);
        }

        CollectionModel<BranchReadModel> result = new CollectionModel<>(branchService.getAllBranches().stream()
            .map(branchModelMapper::toModel)
            .toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Get a branch by ID.", description = "Returns a branch by its ID.")
    public ResponseEntity<BranchReadModel> getBranchById(
            @PathVariable
            @Parameter(description = "Branch ID") Long id) {

        return branchService.getBranchById(id)
            .map(branchModelMapper::toModel)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}