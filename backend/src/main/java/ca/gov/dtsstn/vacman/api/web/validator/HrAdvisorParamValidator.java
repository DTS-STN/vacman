package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

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

        try {
            Long.parseLong(hrAdvisorParam);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}