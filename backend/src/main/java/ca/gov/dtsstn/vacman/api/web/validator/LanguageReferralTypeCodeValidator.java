package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class LanguageReferralTypeCodeValidator implements ConstraintValidator<ValidLanguageReferralTypeCode, Long> {

	private final CodeService codeService;

	public LanguageReferralTypeCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidLanguageReferralTypeCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long languageReferralTypeId, ConstraintValidatorContext context) {
		if (languageReferralTypeId == null) { return true; }

		return codeService.getLanguageReferralTypes(Pageable.unpaged()).stream()
			.filter(languageReferralType -> languageReferralType.getId().equals(languageReferralTypeId))
			.findFirst().isPresent();
	}

}
