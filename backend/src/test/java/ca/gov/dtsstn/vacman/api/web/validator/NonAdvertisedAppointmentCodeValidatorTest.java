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

import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntity;
import ca.gov.dtsstn.vacman.api.service.CodeService;

@ExtendWith({ MockitoExtension.class })
@DisplayName("NonAdvertisedAppointmentCodeValidator tests")
class NonAdvertisedAppointmentCodeValidatorTest {

	@Mock
	CodeService codeService;

	@InjectMocks
	NonAdvertisedAppointmentCodeValidator nonAdvertisedAppointmentCodeValidator;

	@Test
	@DisplayName("isValid() returns true when non-advertised appointment code is null")
	void isValidReturnsTrueWhenNonAdvertisedAppointmentCodeIsNull() {
		assertTrue(nonAdvertisedAppointmentCodeValidator.isValid(null, null));
	}

	@Test
	@DisplayName("isValid() returns true when non-advertised appointment code is valid")
	void isValidReturnsTrueWhenNonAdvertisedAppointmentCodeIsValid() {
		when(codeService.getNonAdvertisedAppointments(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(NonAdvertisedAppointmentEntity.builder().id(0L).build())));

		assertTrue(nonAdvertisedAppointmentCodeValidator.isValid(0L, null));
	}

	@Test
	@DisplayName("isValid() returns false when non-advertised appointment code is invalid")
	void isValidReturnsFalseWhenNonAdvertisedAppointmentCodeIsInvalid() {
		when(codeService.getNonAdvertisedAppointments(Pageable.unpaged())).thenReturn(Page.empty());
		assertFalse(nonAdvertisedAppointmentCodeValidator.isValid(0L, null));
	}

}
