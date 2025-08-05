package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class CityCodeValidator implements ConstraintValidator<ValidCityCode, Long> {

	private final CodeService codeService;

	public CityCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidCityCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long cityId, ConstraintValidatorContext context) {
		if (cityId == null) { return true; }

		return codeService.getCities(Pageable.unpaged()).stream()
			.filter(city -> city.getId().equals(cityId))
			.findFirst().isPresent();
	}

}
