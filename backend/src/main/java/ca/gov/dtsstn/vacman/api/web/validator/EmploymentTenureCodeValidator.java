package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class EmploymentTenureCodeValidator implements ConstraintValidator<ValidEmploymentTenureCode, String> {

	private final CodeService codeService;

	public EmploymentTenureCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidEmploymentTenureCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String employmentTenureCode, ConstraintValidatorContext context) {
		if (employmentTenureCode == null) { return true; }

		return codeService.getAllEmploymentTenures(Pageable.unpaged()).stream()
			.filter(employmentTenure -> employmentTenure.getCode().equals(employmentTenureCode))
			.findFirst().isPresent();
	}

}
