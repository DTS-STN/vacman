package ca.gov.dtsstn.vacman.api.web.validator;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.UserService;

@DisplayName("UserIdValidator tests")
@ExtendWith({ MockitoExtension.class })
class UserIdValidatorTest {

	@Mock
	UserService userService;

	@InjectMocks
	UserIdValidator userIdValidator;

	@Test
	@DisplayName("isValid() returns true when user id is null")
	void isValidReturnsTrueWhenUserIdIsNull() {
		assertTrue(userIdValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when user id is valid")
	void isValidReturnsTrueWhenUserTypeCodeIsValid() {
		when(userService.getUserById(anyLong()))
			.thenReturn(Optional.of(UserEntity.builder().build()));

		assertTrue(userIdValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when user id is invalid")
	void isValidReturnsFalseWhenUserTypeCodeIsInvalid() {
		when(userService.getUserById(anyLong()))
			.thenReturn(Optional.empty());

		assertFalse(userIdValidator.isValid(0L, null));
	}

}
