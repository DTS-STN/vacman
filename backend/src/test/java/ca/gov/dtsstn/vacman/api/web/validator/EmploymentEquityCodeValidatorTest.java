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

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@DisplayName("EmploymentEquityCodeValidator tests")
@ExtendWith({ MockitoExtension.class })
class EmploymentEquityCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	EmploymentEquityCodeValidator employmentEquityCodeValidator;

	@Test
	@DisplayName("isValid() returns true when employment equity code is null")
	void isValidReturnsTrueWhenEmploymentEquityCodeIsNull() {
		assertTrue(employmentEquityCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when employment equity code is valid")
	void isValidReturnsTrueWhenEmploymentEquityCodeIsValid() {
		when(codeService.getAllEmploymentEquities(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentEquityEntityBuilder().code("VALID").build())));

		assertTrue(employmentEquityCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when employment equity code is invalid")
	void isValidReturnsFalseWhenEmploymentEquityCodeIsInvalid() {
		when(codeService.getAllEmploymentEquities(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentEquityEntityBuilder().code("VALID").build())));

		assertFalse(employmentEquityCodeValidator.isValid("INVALID", null));
	}

}
