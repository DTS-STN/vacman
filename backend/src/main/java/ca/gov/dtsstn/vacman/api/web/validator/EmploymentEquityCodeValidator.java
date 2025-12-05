package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class EmploymentEquityCodeValidator implements ConstraintValidator<ValidEmploymentEquityCode, Long> {

	private final CodeService codeService;

	public EmploymentEquityCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidEmploymentEquityCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long employmentEquityId, ConstraintValidatorContext context) {
		if (employmentEquityId == null) { return true; }

		return codeService.getEmploymentEquities(Pageable.unpaged()).stream()
			.filter(employmentEquity -> employmentEquity.getId().equals(employmentEquityId))
			.findFirst().isPresent();
	}

}
