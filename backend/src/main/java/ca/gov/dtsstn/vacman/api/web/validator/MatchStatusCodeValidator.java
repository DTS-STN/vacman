package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a match status exists in the database.
 */
@Component
public class MatchStatusCodeValidator implements ConstraintValidator<ValidMatchStatusCode, Long> {

	private final CodeService codeService;

	public MatchStatusCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidMatchStatusCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long matchStatusId, ConstraintValidatorContext context) {
		if (matchStatusId == null) { return true; }

		return codeService.getMatchStatuses(Pageable.unpaged()).stream()
			.filter(matchStatus -> matchStatus.getId().equals(matchStatusId))
			.findFirst().isPresent();
	}
}
