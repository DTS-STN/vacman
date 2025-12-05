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

import ca.gov.dtsstn.vacman.api.data.entity.MatchFeedbackEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("MatchFeedbackCodeValidator tests")
class MatchFeedbackCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	MatchFeedbackCodeValidator matchFeedbackCodeValidator;

	@Test
	@DisplayName("isValid() returns true when match feedback code is null")
	void isValidReturnsTrueWhenMatchFeedbackCodeIsNull() {
		assertTrue(matchFeedbackCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when match feedback code is valid")
	void isValidReturnsTrueWhenMatchFeedbackCodeIsValid() {
		when(codeService.getMatchFeedbacks(Pageable.unpaged(), true))
			.thenReturn(new PageImpl<>(List.of(MatchFeedbackEntity.builder().id(0L).build())));

		assertTrue(matchFeedbackCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when match feedback code is invalid")
	void isValidReturnsFalseWhenMatchFeedbackCodeIsInvalid() {
		when(codeService.getMatchFeedbacks(Pageable.unpaged(), true)).thenReturn(Page.empty());
		assertFalse(matchFeedbackCodeValidator.isValid(0L, null));
	}

}