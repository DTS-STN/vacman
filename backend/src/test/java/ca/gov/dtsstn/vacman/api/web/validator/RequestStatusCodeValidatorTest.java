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

import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("RequestStatusCodeValidator tests")
class RequestStatusCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	RequestStatusCodeValidator requestStatusCodeValidator;

	@Test
	@DisplayName("isValid() returns true when request status code is null")
	void isValidReturnsTrueWhenRequestStatusCodeIsNull() {
		assertTrue(requestStatusCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when request status code is valid")
	void isValidReturnsTrueWhenRequestStatusCodeIsValid() {
		when(codeService.getRequestStatuses(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(RequestStatusEntity.builder().id(0L).build())));

		assertTrue(requestStatusCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when request status code is invalid")
	void isValidReturnsFalseWhenRequestStatusCodeIsInvalid() {
		when(codeService.getRequestStatuses(Pageable.unpaged())).thenReturn(Page.empty());
		assertFalse(requestStatusCodeValidator.isValid(0L, null));
	}

}
