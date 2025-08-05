package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class NonAdvertisedAppointmentCodeValidator implements ConstraintValidator<ValidNonAdvertisedAppointmentCode, Long> {

	private final CodeService codeService;

	public NonAdvertisedAppointmentCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidNonAdvertisedAppointmentCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long nonAdvertisedAppointmentId, ConstraintValidatorContext context) {
		if (nonAdvertisedAppointmentId == null) { return true; }

		return codeService.getNonAdvertisedAppointments(Pageable.unpaged()).stream()
			.filter(nonAdvertisedAppointment -> nonAdvertisedAppointment.getId().equals(nonAdvertisedAppointmentId))
			.findFirst().isPresent();
	}

}
