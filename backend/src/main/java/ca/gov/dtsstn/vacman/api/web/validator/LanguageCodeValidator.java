package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a language code exists in the database.
 * This is used by the web layer to validate incoming language codes.
 */
@Component
public class LanguageCodeValidator implements ConstraintValidator<ValidLanguageCode, String> {

	private final CodeService codeService;

	public LanguageCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidLanguageCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String languageCode, ConstraintValidatorContext context) {
		if (languageCode == null) { return true; }

		return codeService.getLanguages(Pageable.unpaged()).stream()
			.filter(language -> language.getCode().equals(languageCode))
			.findFirst().isPresent();
	}

}
