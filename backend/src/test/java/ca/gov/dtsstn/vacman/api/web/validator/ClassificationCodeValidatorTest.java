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

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("ClassificationCodeValidator tests")
class ClassificationCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	ClassificationCodeValidator classificationCodeValidator;

	@Test
	@DisplayName("isValid() returns true when classification code is null")
	void isValidReturnsTrueWhenClassificationCodeIsNull() {
		assertTrue(classificationCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when classification code is valid")
	void isValidReturnsTrueWhenClassificationCodeIsValid() {
		when(codeService.getClassifications(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ClassificationEntityBuilder().id(0L).build())));

		assertTrue(classificationCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when classification code is invalid")
	void isValidReturnsFalseWhenClassificationCodeIsInvalid() {
		when(codeService.getClassifications(Pageable.unpaged())).thenReturn(Page.empty());
		assertFalse(classificationCodeValidator.isValid(0L, null));
	}

}
