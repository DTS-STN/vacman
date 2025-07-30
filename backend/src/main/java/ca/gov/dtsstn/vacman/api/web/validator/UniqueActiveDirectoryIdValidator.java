package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.UserService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a user with the given Active Directory ID already exists.
 * This is used by the web layer to validate incoming user creation requests.
 */
@Component
public class UniqueActiveDirectoryIdValidator implements ConstraintValidator<UniqueActiveDirectoryId, String> {

	private final UserService userService;

	public UniqueActiveDirectoryIdValidator(UserService userService) {
		this.userService = userService;
	}

	@Override
	public void initialize(UniqueActiveDirectoryId constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(String activeDirectoryId, ConstraintValidatorContext context) {
		if (activeDirectoryId == null) { return true; }

		return userService.getUserByActiveDirectoryId(activeDirectoryId).isEmpty();
	}

}
