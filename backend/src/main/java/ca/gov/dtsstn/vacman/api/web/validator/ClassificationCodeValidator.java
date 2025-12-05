package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class ClassificationCodeValidator implements ConstraintValidator<ValidClassificationCode, Long> {

	private final CodeService codeService;

	public ClassificationCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidClassificationCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long classificationId, ConstraintValidatorContext context) {
		if (classificationId == null) { return true; }

		return codeService.getClassifications(Pageable.unpaged(), true).stream()
			.filter(classification -> classification.getId().equals(classificationId))
			.findFirst().isPresent();
	}

}
