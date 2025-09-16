package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import static org.apache.commons.lang3.math.NumberUtils.isDigits;

@Component
public class HrAdvisorParamValidator implements ConstraintValidator<ValidHrAdvisorParam, String> {

	@Override
	public void initialize(ValidHrAdvisorParam constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String hrAdvisorParam, ConstraintValidatorContext context) {
		if (hrAdvisorParam == null) {
			return true;
		}

		if ("me".equalsIgnoreCase(hrAdvisorParam)) {
			return true;
		}

		return isDigits(hrAdvisorParam);
	}
}
