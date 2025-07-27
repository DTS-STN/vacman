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

import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@DisplayName("ProvinceCodeValidator tests")
@ExtendWith({ MockitoExtension.class })
class ProvinceCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	ProvinceCodeValidator provinceCodeValidator;

	@Test
	@DisplayName("isValid() returns true when province code is null")
	void isValidReturnsTrueWhenProvinceCodeIsNull() {
		assertTrue(provinceCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when province code is valid")
	void isValidReturnsTrueWhenProvinceCodeIsValid() {
		when(codeService.getProvinces(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProvinceEntityBuilder().code("VALID").build())));

		assertTrue(provinceCodeValidator.isValid("VALID", null));
	}

	@Test
	@DisplayName("isValid() returns false when province code is invalid")
	void isValidReturnsFalseWhenProvinceCodeIsInvalid() {
		when(codeService.getProvinces(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProvinceEntityBuilder().code("VALID").build())));

		assertFalse(provinceCodeValidator.isValid("INVALID", null));
	}

}
