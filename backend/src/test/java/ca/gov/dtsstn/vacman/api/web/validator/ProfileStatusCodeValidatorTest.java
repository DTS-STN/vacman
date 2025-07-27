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

import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@DisplayName("ProfileStatusCodeValidator tests")
@ExtendWith({ MockitoExtension.class })
class ProfileStatusCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	ProfileStatusCodeValidator profileStatusCodeValidator;

	@Test
	@DisplayName("isValid() returns true when profile status code is null")
	void isValidReturnsTrueWhenProfileStatusCodeIsNull() {
		assertTrue(profileStatusCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when profile status code is valid")
	void isValidReturnsTrueWhenProfileStatusCodeIsValid() {
		when(codeService.getProfileStatuses(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProfileStatusEntityBuilder().code("VALID").build())));

		assertTrue(profileStatusCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when profile status code is invalid")
	void isValidReturnsFalseWhenProfileStatusCodeIsInvalid() {
		when(codeService.getProfileStatuses(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProfileStatusEntityBuilder().code("VALID").build())));

		assertFalse(profileStatusCodeValidator.isValid("INVALID", null));
	}

}
