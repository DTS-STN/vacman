package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class WorkUnitCodeValidator implements ConstraintValidator<ValidWorkUnitCode, String> {

	private final CodeService codeService;

	public WorkUnitCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidWorkUnitCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String workUnitCode, ConstraintValidatorContext context) {
		if (workUnitCode == null) { return true; }

		return codeService.getAllWorkUnits(Pageable.unpaged()).stream()
			.filter(workUnit -> workUnit.getCode().equals(workUnitCode))
			.findFirst().isPresent();
	}

}
