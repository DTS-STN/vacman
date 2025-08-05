package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.UserService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a user with the given Microsoft Entra ID already exists.
 * This is used by the web layer to validate incoming user creation requests.
 */
@Component
public class UniqueMicrosoftEntraIdValidator implements ConstraintValidator<UniqueMicrosoftEntraId, String> {

	private final UserService userService;

	public UniqueMicrosoftEntraIdValidator(UserService userService) {
		this.userService = userService;
	}

	@Override
	public void initialize(UniqueMicrosoftEntraId constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String microsoftEntraId, ConstraintValidatorContext context) {
		if (microsoftEntraId == null) { return true; }

		return userService.getUserByMicrosoftEntraId(microsoftEntraId).isEmpty();
	}

}
