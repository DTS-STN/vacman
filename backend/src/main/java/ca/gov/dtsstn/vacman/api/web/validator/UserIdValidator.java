package ca.gov.dtsstn.vacman.api.web.validator;

import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.service.UserService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator that checks if a user exists in the database.
 */
@Component
public class UserIdValidator implements ConstraintValidator<ValidUserId, Long> {

	private final UserService userService;

	public UserIdValidator(UserService userService) {
		this.userService = userService;
	}

	@Override
	public void initialize(ValidUserId constraintAnnotation) {
		// No initialization needed
	}

	@Override
	public boolean isValid(Long userId, ConstraintValidatorContext context) {
		if (userId == null) { return true; }

		return userService.getUserById(userId).isPresent();
	}

}
