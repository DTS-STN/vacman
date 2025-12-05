package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a user type code exists in the database.
 * This is used by the web layer to validate incoming role codes.
 */
@Component
public class UserTypeCodeValidator implements ConstraintValidator<ValidUserTypeCode, Long> {

	private final CodeService codeService;

	public UserTypeCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidUserTypeCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long userTypeId, ConstraintValidatorContext context) {
		if (userTypeId == null) { return true; }

		return codeService.getUserTypes(Pageable.unpaged(), true).stream()
				.filter(userType -> userType.getId().equals(userTypeId))
				.findFirst().isPresent();
	}
}
