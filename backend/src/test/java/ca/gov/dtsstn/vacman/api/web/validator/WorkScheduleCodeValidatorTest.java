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

import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("WorkScheduleCodeValidator tests")
class WorkScheduleCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	WorkScheduleCodeValidator workScheduleCodeValidator;

	@Test
	@DisplayName("isValid() returns true when work schedule code is null")
	void isValidReturnsTrueWhenWorkScheduleCodeIsNull() {
		assertTrue(workScheduleCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when work schedule code is valid")
	void isValidReturnsTrueWhenWorkScheduleCodeIsValid() {
		when(codeService.getWorkSchedules(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkScheduleEntityBuilder().code("VALID").build())));

		assertTrue(workScheduleCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when work schedule code is invalid")
	void isValidReturnsFalseWhenWorkScheduleCodeIsInvalid() {
		when(codeService.getWorkSchedules(Pageable.unpaged()))
		.thenReturn(new PageImpl<>(List.of(new WorkScheduleEntityBuilder().code("VALID").build())));

		assertFalse(workScheduleCodeValidator.isValid("INVALID", null));
	}

}
