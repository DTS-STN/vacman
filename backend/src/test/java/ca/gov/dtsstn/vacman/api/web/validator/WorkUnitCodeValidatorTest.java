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

import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("WorkUnitCodeValidator tests")
class WorkUnitCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	WorkUnitCodeValidator workUnitCodeValidator;

	@Test
	@DisplayName("isValid() returns true when work unit code is null")
	void isValidReturnsTrueWhenWorkUnitCodeIsNull() {
		assertTrue(workUnitCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when work unit code is valid")
	void isValidReturnsTrueWhenWorkUnitCodeIsValid() {
		when(codeService.getAllWorkUnits(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkUnitEntityBuilder().code("VALID").build())));

		assertTrue(workUnitCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when work unit code is invalid")
	void isValidReturnsFalseWhenWorkUnitCodeIsInvalid() {
		when(codeService.getAllWorkUnits(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkUnitEntityBuilder().code("VALID").build())));

		assertFalse(workUnitCodeValidator.isValid("INVALID", null));
	}

}
