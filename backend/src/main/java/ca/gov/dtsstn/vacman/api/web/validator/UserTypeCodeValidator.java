package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a user type code exists in the database.
 * This is used by the web layer to validate incoming role codes.
 */
@Component
public class UserTypeCodeValidator implements ConstraintValidator<ValidUserTypeCode, String> {

    private final UserTypeRepository userTypeRepository;

    public UserTypeCodeValidator(UserTypeRepository userTypeRepository) {
        this.userTypeRepository = userTypeRepository;
    }

    @Override
    public void initialize(ValidUserTypeCode constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String userTypeCode, ConstraintValidatorContext context) {
        if (userTypeCode == null) {
            return true;
        }

        // Check if the user type code exists in the database
        return userTypeRepository.findByCode(userTypeCode).isPresent();
    }
}
