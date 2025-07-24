package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

@Component
public class ProvinceCodeValidator implements ConstraintValidator<ValidProvinceCode, String> {

	private final CodeService codeService;

	public ProvinceCodeValidator(CodeService codeService) {
		this.codeService = codeService;
	}

	@Override
	public void initialize(ValidProvinceCode constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String provinceCode, ConstraintValidatorContext context) {
		if (provinceCode == null) { return true; }

		return codeService.getAllProvinces(Pageable.unpaged()).stream()
			.filter(province -> province.getCode().equals(provinceCode))
			.findFirst().isPresent();
	}

}
