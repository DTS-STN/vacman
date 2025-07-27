package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class RequestStatusCodeValidator implements ConstraintValidator<ValidRequestStatusCode, String> {

	private final CodeService codeService;

	public RequestStatusCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidRequestStatusCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String requestStatusCode, ConstraintValidatorContext context) {
		if (requestStatusCode == null) { return true; }

		return codeService.getRequestStatuses(Pageable.unpaged()).stream()
			.filter(requestStatus -> requestStatus.getCode().equals(requestStatusCode))
			.findFirst().isPresent();
	}

}
