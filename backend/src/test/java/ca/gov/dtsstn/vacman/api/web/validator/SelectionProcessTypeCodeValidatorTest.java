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

import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("SelectionProcessTypeCodeValidator tests")
class SelectionProcessTypeCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	SelectionProcessTypeCodeValidator selectionProcessTypeCodeValidator;

	@Test
	@DisplayName("isValid() returns true when selection process type code is null")
	void isValidReturnsTrueWhenSelectionProcessTypeCodeIsNull() {
		assertTrue(selectionProcessTypeCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when selection process type code is valid")
	void isValidReturnsTrueWhenSelectionProcessTypeCodeIsValid() {
		when(codeService.getAllSelectionProcessTypes(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SelectionProcessTypeEntityBuilder().code("VALID").build())));

		assertTrue(selectionProcessTypeCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when selection process type code is invalid")
	void isValidReturnsFalseWhenSelectionProcessTypeCodeIsInvalid() {
		when(codeService.getAllSelectionProcessTypes(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SelectionProcessTypeEntityBuilder().code("VALID").build())));

		assertFalse(selectionProcessTypeCodeValidator.isValid("INVALID", null));
	}

}
