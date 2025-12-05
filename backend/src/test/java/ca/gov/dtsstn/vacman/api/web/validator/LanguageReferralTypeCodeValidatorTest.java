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

import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@DisplayName("LanguageReferralTypeCodeValidator tests")
@ExtendWith({ MockitoExtension.class })
class LanguageReferralTypeCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	LanguageReferralTypeCodeValidator languageReferralTypeCodeValidator;

	@Test
	@DisplayName("isValid() returns true when language referral type code is null")
	void isValidReturnsTrueWhenLanguageReferralTypeCodeIsNull() {
		assertTrue(languageReferralTypeCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when language referral type code is valid")
	void isValidReturnsTrueWhenLanguageReferralTypeCodeIsValid() {
		when(codeService.getLanguageReferralTypes(Pageable.unpaged(), true))
			.thenReturn(new PageImpl<>(List.of(LanguageReferralTypeEntity.builder().id(0L).build())));

		assertTrue(languageReferralTypeCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when language referral type code is invalid")
	void isValidReturnsFalseWhenLanguageReferralTypeCodeIsInvalid() {
		when(codeService.getLanguageReferralTypes(Pageable.unpaged(), true)).thenReturn(Page.empty());
		assertFalse(languageReferralTypeCodeValidator.isValid(0L, null));
	}

}
