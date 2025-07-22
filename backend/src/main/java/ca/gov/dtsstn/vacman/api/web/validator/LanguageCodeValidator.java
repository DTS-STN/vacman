package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a language code exists in the database.
 * This is used by the web layer to validate incoming language codes.
 */
@Component
public class LanguageCodeValidator implements ConstraintValidator<ValidLanguageCode, String> {

    private final LanguageRepository languageRepository;

    public LanguageCodeValidator(LanguageRepository languageRepository) {
        this.languageRepository = languageRepository;
    }

    @Override
    public void initialize(ValidLanguageCode constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String languageCode, ConstraintValidatorContext context) {
        if (languageCode == null) {
            return true;
        }

        // Check if the language code exists in the database
        return languageRepository.findByCode(languageCode).isPresent();
    }
}
