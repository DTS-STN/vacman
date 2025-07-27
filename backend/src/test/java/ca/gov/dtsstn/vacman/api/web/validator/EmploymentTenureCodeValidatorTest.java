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

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("EmploymentTenureCodeValidator tests")
class EmploymentTenureCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	EmploymentTenureCodeValidator employmentTenureCodeValidator;

	@Test
	@DisplayName("isValid() returns true when employment tenure code is null")
	void isValidReturnsTrueWhenEmploymentTenureCodeIsNull() {
		assertTrue(employmentTenureCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when employment tenure code is valid")
	void isValidReturnsTrueWhenEmploymentTenureCodeIsValid() {
		when(codeService.getEmploymentTenures(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentTenureEntityBuilder().code("VALID").build())));

		assertTrue(employmentTenureCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when employment tenure code is invalid")
	void isValidReturnsFalseWhenEmploymentTenureCodeIsInvalid() {
		when(codeService.getEmploymentTenures(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentTenureEntityBuilder().code("VALID").build())));

		assertFalse(employmentTenureCodeValidator.isValid("INVALID", null));
	}

}
