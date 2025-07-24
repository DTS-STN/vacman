package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class PriorityLevelCodeValidator implements ConstraintValidator<ValidPriorityLevelCode, String> {

	private final CodeService codeService;

	public PriorityLevelCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidPriorityLevelCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String priorityLevelCode, ConstraintValidatorContext context) {
		if (priorityLevelCode == null) { return true; }

		return codeService.getAllPriorityLevels(Pageable.unpaged()).stream()
			.filter(priorityLevel -> priorityLevel.getCode().equals(priorityLevelCode))
			.findFirst().isPresent();
	}

}
