package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class PriorityLevelCodeValidator implements ConstraintValidator<ValidPriorityLevelCode, Long> {

	private final CodeService codeService;

	public PriorityLevelCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidPriorityLevelCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long priorityLevelId, ConstraintValidatorContext context) {
		if (priorityLevelId == null) { return true; }

		return codeService.getPriorityLevels(Pageable.unpaged()).stream()
			.filter(priorityLevel -> priorityLevel.getId().equals(priorityLevelId))
			.findFirst().isPresent();
	}

}
