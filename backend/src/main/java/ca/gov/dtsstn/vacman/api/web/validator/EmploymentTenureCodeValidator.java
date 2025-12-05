package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class EmploymentTenureCodeValidator implements ConstraintValidator<ValidEmploymentTenureCode, Long> {

	private final CodeService codeService;

	public EmploymentTenureCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidEmploymentTenureCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long employmentTenureId, ConstraintValidatorContext context) {
		if (employmentTenureId == null) { return true; }

		return codeService.getEmploymentTenures(Pageable.unpaged(), true).stream()
			.filter(employmentTenure -> employmentTenure.getId().equals(employmentTenureId))
			.findFirst().isPresent();
	}

}
