package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class EmploymentEquityCodeValidator implements ConstraintValidator<ValidEmploymentEquityCode, String> {

	private final CodeService codeService;

	public EmploymentEquityCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidEmploymentEquityCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String employmentEquityCode, ConstraintValidatorContext context) {
		if (employmentEquityCode == null) { return true; }

		return codeService.getAllEmploymentEquities(Pageable.unpaged()).stream()
			.filter(employmentEquity -> employmentEquity.getCode().equals(employmentEquityCode))
			.findFirst().isPresent();
	}

}
