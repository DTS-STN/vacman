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

import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("WfaStatusCodeValidator tests")
class WfaStatusCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	WfaStatusCodeValidator wfaStatusCodeValidator;

	@Test
	@DisplayName("isValid() returns true when WFA status code is null")
	void isValidReturnsTrueWhenWfaStatusCodeIsNull() {
		assertTrue(wfaStatusCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when WFA status code is valid")
	void isValidReturnsTrueWhenWfaStatusCodeIsValid() {
		when(codeService.getAllWfaStatuses(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WfaStatusEntityBuilder().code("VALID").build())));

		assertTrue(wfaStatusCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when WFA status code is invalid")
	void isValidReturnsFalseWhenWfaStatusCodeIsInvalid() {
		when(codeService.getAllWfaStatuses(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WfaStatusEntityBuilder().code("VALID").build())));

		assertFalse(wfaStatusCodeValidator.isValid("INVALID", null));
	}

}
