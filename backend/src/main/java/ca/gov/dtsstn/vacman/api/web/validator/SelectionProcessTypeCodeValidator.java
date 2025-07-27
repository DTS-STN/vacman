package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class SelectionProcessTypeCodeValidator implements ConstraintValidator<ValidSelectionProcessTypeCode, String> {

	private final CodeService codeService;

	public SelectionProcessTypeCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidSelectionProcessTypeCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String selectionProcessTypeCode, ConstraintValidatorContext context) {
		if (selectionProcessTypeCode == null) { return true; }

		return codeService.getSelectionProcessTypes(Pageable.unpaged()).stream()
			.filter(selectionProcessType -> selectionProcessType.getCode().equals(selectionProcessTypeCode))
			.findFirst().isPresent();
	}

}
