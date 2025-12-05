package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class SelectionProcessTypeCodeValidator implements ConstraintValidator<ValidSelectionProcessTypeCode, Long> {

	private final CodeService codeService;

	public SelectionProcessTypeCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidSelectionProcessTypeCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long selectionProcessTypeId, ConstraintValidatorContext context) {
		if (selectionProcessTypeId == null) { return true; }

		return codeService.getSelectionProcessTypes(Pageable.unpaged(), true).stream()
			.filter(selectionProcessType -> selectionProcessType.getId().equals(selectionProcessTypeId))
			.findFirst().isPresent();
	}

}
