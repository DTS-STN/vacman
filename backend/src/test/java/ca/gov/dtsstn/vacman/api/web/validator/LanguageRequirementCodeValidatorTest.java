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

import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("LanguageRequirementCodeValidator tests")
class LanguageRequirementCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	LanguageRequirementCodeValidator languageRequirementCodeValidator;

	@Test
	@DisplayName("isValid() returns true when language requirement code is null")
	void isValidReturnsTrueWhenLanguageRequirementCodeIsNull() {
		assertTrue(languageRequirementCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when language requirement code is valid")
	void isValidReturnsTrueWhenLanguageRequirementCodeIsValid() {
		when(codeService.getLanguageRequirements(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageRequirementEntityBuilder().code("VALID").build())));

		assertTrue(languageRequirementCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when language requirement code is invalid")
	void isValidReturnsFalseWhenLanguageRequirementCodeIsInvalid() {
		when(codeService.getLanguageRequirements(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageRequirementEntityBuilder().code("VALID").build())));

		assertFalse(languageRequirementCodeValidator.isValid("INVALID", null));
	}

}
