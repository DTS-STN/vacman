package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class LanguageRequirementCodeValidator implements ConstraintValidator<ValidLanguageRequirementCode, String> {

	private final CodeService codeService;

	public LanguageRequirementCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidLanguageRequirementCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String languageRequirementCode, ConstraintValidatorContext context) {
		if (languageRequirementCode == null) { return true; }

		return codeService.getAllLanguageRequirements(Pageable.unpaged()).stream()
			.filter(languageRequirement -> languageRequirement.getCode().equals(languageRequirementCode))
			.findFirst().isPresent();
	}

}
