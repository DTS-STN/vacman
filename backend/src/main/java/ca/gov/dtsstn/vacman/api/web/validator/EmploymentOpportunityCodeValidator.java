package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class EmploymentOpportunityCodeValidator implements ConstraintValidator<ValidEmploymentOpportunityCode, Long> {

	private final CodeService codeService;

	public EmploymentOpportunityCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidEmploymentOpportunityCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long employmentOpportunityId, ConstraintValidatorContext context) {
		if (employmentOpportunityId == null) { return true; }

		return codeService.getEmploymentOpportunities(Pageable.unpaged()).stream()
			.filter(employmentOpportunity -> employmentOpportunity.getId().equals(employmentOpportunityId))
			.findFirst().isPresent();
	}

}
