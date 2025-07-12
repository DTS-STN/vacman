package ca.gov.dtsstn.vacman.api.web;

import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.util.List;

import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig;
import ca.gov.dtsstn.vacman.api.service.SelectionProcessTypeService;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.SelectionProcessTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.SelectionProcessTypeModelMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Selection Process Type")
@RequestMapping({ "/api/v1/selection-process-type" })
public class SelectionProcessTypeController {

	private final SelectionProcessTypeModelMapper selectionProcessTypeModelMapper = Mappers.getMapper(SelectionProcessTypeModelMapper.class);

	private final SelectionProcessTypeService selectionProcessTypeService;

	public SelectionProcessTypeController(SelectionProcessTypeService selectionProcessTypeService) {
		this.selectionProcessTypeService = selectionProcessTypeService;
	}

	@GetMapping
	@SecurityRequirement(name = SpringDocConfig.AZURE_AD)
	@Operation(summary = "Get all selection process types or filter by code.", description = "Returns a collection of all selection process types, or selection process types filtered by code.")
	public ResponseEntity<CollectionModel<SelectionProcessTypeReadModel>> getSelectionProcessTypes(
			@RequestParam(required = false)
			@Parameter(description = "Selection process type code to filter by (e.g., 'COMPETITIVE')") String code) {

		if (isNotBlank(code)) {
			return selectionProcessTypeService.getSelectionProcessTypeByCode(code)
				.map(selectionProcessType -> ResponseEntity.ok(new CollectionModel<>(List.of(selectionProcessTypeModelMapper.toModel(selectionProcessType)))))
				.orElse(ResponseEntity.ok(new CollectionModel<>(List.of())));
		}

		CollectionModel<SelectionProcessTypeReadModel> result = new CollectionModel<>(selectionProcessTypeService.getAllSelectionProcessTypes().stream()
			.map(selectionProcessTypeModelMapper::toModel)
			.toList());

		return ResponseEntity.ok(result);
	}

}
