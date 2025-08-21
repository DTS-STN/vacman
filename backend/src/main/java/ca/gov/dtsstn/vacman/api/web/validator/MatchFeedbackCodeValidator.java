package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class MatchFeedbackCodeValidator implements ConstraintValidator<ValidMatchFeedbackCode, Long> {

	private final CodeService codeService;

	public MatchFeedbackCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidMatchFeedbackCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long matchFeedbackId, ConstraintValidatorContext context) {
		if (matchFeedbackId == null) { return true; }

		return codeService.getMatchFeedback(Pageable.unpaged()).stream()
			.filter(matchFeedback -> matchFeedback.getId().equals(matchFeedbackId))
			.findFirst().isPresent();
	}

}
