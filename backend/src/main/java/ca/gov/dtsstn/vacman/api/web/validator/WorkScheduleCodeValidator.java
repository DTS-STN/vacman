package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class WorkScheduleCodeValidator implements ConstraintValidator<ValidWorkScheduleCode, String> {

	private final CodeService codeService;

	public WorkScheduleCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidWorkScheduleCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String workScheduleCode, ConstraintValidatorContext context) {
		if (workScheduleCode == null) { return true; }

		return codeService.getWorkSchedules(Pageable.unpaged()).stream()
			.filter(workSchedule -> workSchedule.getCode().equals(workScheduleCode))
			.findFirst().isPresent();
	}

}
