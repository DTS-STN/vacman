package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class ProvinceCodeValidator implements ConstraintValidator<ValidProvinceCode, Long> {

	private final CodeService codeService;

	public ProvinceCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidProvinceCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long provinceId, ConstraintValidatorContext context) {
		if (provinceId == null) { return true; }

		return codeService.getProvinces(Pageable.unpaged()).stream()
			.filter(province -> province.getId().equals(provinceId))
			.findFirst().isPresent();
	}

}
