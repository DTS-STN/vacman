package ca.gov.dtsstn.vacman.api.web.validator;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("UserTypeCodeValidator tests")
class UserTypeCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	UserTypeCodeValidator userTypeCodeValidator;

	@Test
	@DisplayName("isValid() returns true when user type code is null")
	void isValidReturnsTrueWhenUserTypeCodeIsNull() {
		assertTrue(userTypeCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when user type code is valid")
	void isValidReturnsTrueWhenUserTypeCodeIsValid() {
		when(codeService.getAllUserTypes(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new UserTypeEntityBuilder().code("VALID").build())));

		assertTrue(userTypeCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when user type code is invalid")
	void isValidReturnsFalseWhenUserTypeCodeIsInvalid() {
		when(codeService.getAllUserTypes(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new UserTypeEntityBuilder().code("VALID").build())));

		assertFalse(userTypeCodeValidator.isValid("INVALID", null));
	}

}
