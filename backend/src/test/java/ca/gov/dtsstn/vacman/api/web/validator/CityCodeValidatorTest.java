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

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@DisplayName("CityCodeValidator tests")
@ExtendWith({ MockitoExtension.class })
class CityCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	CityCodeValidator cityCodeValidator;

	@Test
	@DisplayName("isValid() returns true when city code is null")
	void isValidReturnsTrueWhenCityCodeIsNull() {
		assertTrue(cityCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when city code is valid")
	void isValidReturnsTrueWhenCityCodeIsValid() {
		when(codeService.getCities(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(CityEntity.builder().id(0L).build())));

		assertTrue(cityCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when city code is invalid")
	void isValidReturnsFalseWhenCityCodeIsInvalid() {
		when(codeService.getCities(Pageable.unpaged())).thenReturn(Page.empty());
		assertFalse(cityCodeValidator.isValid(0L, null));
	}

}
