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

import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("PriorityLevelCodeValidator tests")
class PriorityLevelCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	PriorityLevelCodeValidator priorityLevelCodeValidator;

	@Test
	@DisplayName("isValid() returns true when priority level code is null")
	void isValidReturnsTrueWhenPriorityLevelCodeIsNull() {
		assertTrue(priorityLevelCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when priority level code is valid")
	void isValidReturnsTrueWhenPriorityLevelCodeIsValid() {
		when(codeService.getPriorityLevels(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new PriorityLevelEntityBuilder().code("VALID").build())));

		assertTrue(priorityLevelCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when priority level code is invalid")
	void isValidReturnsFalseWhenPriorityLevelCodeIsInvalid() {
		when(codeService.getPriorityLevels(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new PriorityLevelEntityBuilder().code("VALID").build())));

		assertFalse(priorityLevelCodeValidator.isValid("INVALID", null));
	}

}
