package ca.gov.dtsstn.vacman.api.web.validator;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;
import static org.springframework.data.domain.Pageable.unpaged;

import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a match status code exists in the database.
 */
@Component
public class MatchStatusCodeStringValidator implements ConstraintValidator<ValidMatchStatusCode, String> {

	private final CodeService codeService;

	public MatchStatusCodeStringValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidMatchStatusCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String matchStatusCode, ConstraintValidatorContext context) {
		if (matchStatusCode == null) { return true; }

		return codeService.getMatchStatuses(unpaged(), true).stream()
			.anyMatch(byCode(matchStatusCode));
	}
}