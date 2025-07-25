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

import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("SecurityClearanceCodeValidator tests")
class SecurityClearanceCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	SecurityClearanceCodeValidator securityClearanceCodeValidator;

	@Test
	@DisplayName("isValid() returns true when security clearance code is null")
	void isValidReturnsTrueWhenSecurityClearanceCodeIsNull() {
		assertTrue(securityClearanceCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when security clearance code is valid")
	void isValidReturnsTrueWhenSecurityClearanceCodeIsValid() {
		when(codeService.getAllSecurityClearances(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SecurityClearanceEntityBuilder().code("VALID").build())));

		assertTrue(securityClearanceCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when security clearance code is invalid")
	void isValidReturnsFalseWhenSecurityClearanceCodeIsInvalid() {
		when(codeService.getAllSecurityClearances(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SecurityClearanceEntityBuilder().code("VALID").build())));

		assertFalse(securityClearanceCodeValidator.isValid("INVALID", null));
	}

}
