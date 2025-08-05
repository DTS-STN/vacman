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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("LanguageCodeValidator tests")
class LanguageCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	LanguageCodeValidator languageCodeValidator;

	@Test
	@DisplayName("isValid() returns true when language code is null")
	void isValidReturnsTrueWhenLanguageCodeIsNull() {
		assertTrue(languageCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when language code is valid")
	void isValidReturnsTrueWhenLanguageCodeIsValid() {
		when(codeService.getLanguages(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageEntityBuilder().id(0L).build())));

		assertTrue(languageCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when language code is invalid")
	void isValidReturnsFalseWhenLanguageCodeIsInvalid() {
		when(codeService.getLanguages(Pageable.unpaged())).thenReturn(Page.empty());
		assertFalse(languageCodeValidator.isValid(0L, null));
	}

}
