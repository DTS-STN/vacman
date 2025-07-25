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

import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("EmploymentOpportunityCodeValidator tests")
class EmploymentOpportunityCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	EmploymentOpportunityCodeValidator employmentOpportunityCodeValidator;

	@Test
	@DisplayName("isValid() returns true when employment opportunity code is null")
	void isValidReturnsTrueWhenEmploymentOpportunityCodeIsNull() {
		assertTrue(employmentOpportunityCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when employment opportunity code is valid")
	void isValidReturnsTrueWhenEmploymentOpportunityCodeIsValid() {
		when(codeService.getAllEmploymentOpportunities(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentOpportunityEntityBuilder().code("VALID").build())));

		assertTrue(employmentOpportunityCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when employment opportunity code is invalid")
	void isValidReturnsFalseWhenEmploymentOpportunityCodeIsInvalid() {
		when(codeService.getAllEmploymentOpportunities(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentOpportunityEntityBuilder().code("VALID").build())));

		assertFalse(employmentOpportunityCodeValidator.isValid("INVALID", null));
	}

}
