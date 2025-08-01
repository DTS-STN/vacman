package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class WfaStatusCodeValidator implements ConstraintValidator<ValidWfaStatusCode, Long> {

	private final CodeService codeService;

	public WfaStatusCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidWfaStatusCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long wfaStatusId, ConstraintValidatorContext context) {
		if (wfaStatusId == null) { return true; }

		return codeService.getWfaStatuses(Pageable.unpaged()).stream()
			.filter(wfaStatus -> wfaStatus.getId().equals(wfaStatusId))
			.findFirst().isPresent();
	}

}
