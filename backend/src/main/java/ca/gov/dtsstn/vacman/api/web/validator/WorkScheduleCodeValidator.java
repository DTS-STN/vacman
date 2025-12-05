package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class WorkScheduleCodeValidator implements ConstraintValidator<ValidWorkScheduleCode, Long> {

	private final CodeService codeService;

	public WorkScheduleCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidWorkScheduleCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long workScheduleId, ConstraintValidatorContext context) {
		if (workScheduleId == null) { return true; }

		return codeService.getWorkSchedules(Pageable.unpaged()).stream()
			.filter(workSchedule -> workSchedule.getId().equals(workScheduleId))
			.findFirst().isPresent();
	}

}
