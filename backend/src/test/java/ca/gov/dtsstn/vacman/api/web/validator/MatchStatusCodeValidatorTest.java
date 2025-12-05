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

import ca.gov.dtsstn.vacman.api.data.entity.MatchStatusEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("MatchStatusCodeValidator tests")
class MatchStatusCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	MatchStatusCodeValidator matchStatusCodeValidator;

	@Test
	@DisplayName("isValid() returns true when match status code is null")
	void isValidReturnsTrueWhenMatchStatusCodeIsNull() {
		assertTrue(matchStatusCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when match status code is valid")
	void isValidReturnsTrueWhenMatchStatusCodeIsValid() {
		when(codeService.getMatchStatuses(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(MatchStatusEntity.builder().id(0L).build())));

		assertTrue(matchStatusCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when match status code is invalid")
	void isValidReturnsFalseWhenMatchStatusCodeIsInvalid() {
		when(codeService.getMatchStatuses(Pageable.unpaged())).thenReturn(Page.empty());
		assertFalse(matchStatusCodeValidator.isValid(0L, null));
	}

}