package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class ClassificationCodeValidator implements ConstraintValidator<ValidClassificationCode, String> {

	private final CodeService codeService;

	public ClassificationCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidClassificationCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String classificationCode, ConstraintValidatorContext context) {
		if (classificationCode == null) { return true; }

		return codeService.getAllClassifications(Pageable.unpaged()).stream()
			.filter(classification -> classification.getCode().equals(classificationCode))
			.findFirst().isPresent();
	}

}
