package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class ProfileStatusCodeValidator implements ConstraintValidator<ValidProfileStatusCode, Long> {

	private final CodeService codeService;

	public ProfileStatusCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidProfileStatusCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long profileStatusId, ConstraintValidatorContext context) {
		if (profileStatusId == null) { return true; }

		return codeService.getProfileStatuses(Pageable.unpaged()).stream()
			.filter(profileStatus -> profileStatus.getId().equals(profileStatusId))
			.findFirst().isPresent();
	}

}
