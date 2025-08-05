package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class SecurityClearanceCodeValidator implements ConstraintValidator<ValidSecurityClearanceCode, Long> {

	private final CodeService codeService;

	public SecurityClearanceCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidSecurityClearanceCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long securityClearanceId, ConstraintValidatorContext context) {
		if (securityClearanceId == null) { return true; }

		return codeService.getSecurityClearances(Pageable.unpaged()).stream()
			.filter(securityClearance -> securityClearance.getId().equals(securityClearanceId))
			.findFirst().isPresent();
	}

}
