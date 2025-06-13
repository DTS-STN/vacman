package ca.gov.dtsstn.vacman.api.web;

import java.util.List;

import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import org.mapstruct.factory.Mappers;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.WfaStatusService;
import ca.gov.dtsstn.vacman.api.web.model.WfaStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.WfaStatusModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "WFA Statuses")
@RequestMapping({ "/api/v1/wfa-statuses" })
public class WfaStatusController {

    private final WfaStatusModelMapper wfaStatusModelMapper = Mappers.getMapper(WfaStatusModelMapper.class);

    private final WfaStatusService wfaStatusService;

    public WfaStatusController(WfaStatusService wfaStatusService) {
        this.wfaStatusService = wfaStatusService;
    }

    @GetMapping
    @SecurityRequirement(name = SpringDocConfig.AZURE_AD)
    @Operation(summary = "Get all WFA statuses.", description = "Returns a collection of all WFA statuses.")
    public CollectionModel<WfaStatusReadModel> getAllWfaStatuses() {
        List<WfaStatusReadModel> statuses = wfaStatusService.getAllWfaStatuses().stream()
                .map(wfaStatusModelMapper::toModel)
                .toList();

        return new CollectionModel<>(statuses);
    }
}
