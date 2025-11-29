package ca.gov.dtsstn.vacman.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import org.springframework.data.jpa.domain.Specification;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;

@DisplayName("CodeService tests")
@ExtendWith({ MockitoExtension.class })
class CodeServiceTest {

	@Mock
	CityRepository cityRepository;

	@Mock
	ClassificationRepository classificationRepository;

	@Mock
	EmploymentEquityRepository employmentEquityRepository;

	@Mock
	EmploymentOpportunityRepository employmentOpportunityRepository;

	@Mock
	EmploymentTenureRepository employmentTenureRepository;

	@Mock
	LanguageRepository languageRepository;

	@Mock
	LanguageReferralTypeRepository languageReferralTypeRepository;

	@Mock
	LanguageRequirementRepository languageRequirementRepository;

	@Mock
	NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;

	@Mock
	ProfileStatusRepository profileStatusRepository;

	@Mock
	ProvinceRepository provinceRepository;

	@Mock
	RequestStatusRepository requestStatusRepository;

	@Mock
	SecurityClearanceRepository securityClearanceRepository;

	@Mock
	SelectionProcessTypeRepository selectionProcessTypeRepository;

	@Mock
	UserTypeRepository userTypeRepository;

	@Mock
	WfaStatusRepository wfaStatusRepository;

	@Mock
	WorkScheduleRepository workScheduleRepository;

	@Mock
	WorkUnitRepository workUnitRepository;

	@InjectMocks
	CodeService codeService;

	@Test
	@DisplayName("getCities() returns a page of cities")
	void getCitiesReturnsPageOfCities() {
		final var testCity = CityEntity.builder().code("TEST_CITY").build();

		when(cityRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testCity)));

		final var result = codeService.getCities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testCity, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getClassifications() returns a page of classifications")
	void getClassificationsReturnsPageOfClassifications() {
		final var testClassification = ClassificationEntity.builder().code("TEST_CLASSIFICATION").build();

		when(classificationRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testClassification)));

		final var result = codeService.getClassifications(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testClassification, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getEmploymentEquities() returns a page of employment equities")
	void getEmploymentEquitiesReturnsPageOfEmploymentEquities() {
		final var testEmploymentEquity = EmploymentEquityEntity.builder().code("TEST_EE").build();

		when(employmentEquityRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testEmploymentEquity)));

		final var result = codeService.getEmploymentEquities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testEmploymentEquity, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getEmploymentOpportunities() returns a page of employment opportunities")
	void getEmploymentOpportunitiesReturnsPageOfEmploymentOpportunities() {
		final var testEmploymentOpportunity = EmploymentOpportunityEntity.builder().code("TEST_EO").build();

		when(employmentOpportunityRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testEmploymentOpportunity)));

		final var result = codeService.getEmploymentOpportunities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testEmploymentOpportunity, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getEmploymentTenures() returns a page of employment tenures")
	void getEmploymentTenuresReturnsPageOfEmploymentTenures() {
		final var testEmploymentTenure = EmploymentTenureEntity.builder().code("TEST_ET").build();

		when(employmentTenureRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testEmploymentTenure)));

		final var result = codeService.getEmploymentTenures(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testEmploymentTenure, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getLanguages() returns a page of languages")
	void getLanguagesReturnsPageOfLanguages() {
		final var testLanguage = LanguageEntity.builder().code("TEST_LANG").build();

		when(languageRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testLanguage)));

		final var result = codeService.getLanguages(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testLanguage, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getLanguageReferralTypes() returns a page of language referral types")
	void getLanguageReferralTypesReturnsPageOfLanguageReferralTypes() {
		final var testLanguageReferralType = LanguageReferralTypeEntity.builder().code("TEST_LRT").build();

		when(languageReferralTypeRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testLanguageReferralType)));

		final var result = codeService.getLanguageReferralTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testLanguageReferralType, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getLanguageRequirements() returns a page of language requirements")
	void getLanguageRequirementsReturnsPageOfLanguageRequirements() {
		final var testLanguageRequirement = LanguageRequirementEntity.builder().code("TEST_LR").build();

		when(languageRequirementRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testLanguageRequirement)));

		final var result = codeService.getLanguageRequirements(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testLanguageRequirement, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getNonAdvertisedAppointments() returns a page of non-advertised appointments")
	void getNonAdvertisedAppointmentsReturnsPageOfNonAdvertisedAppointments() {
		final var testNonAdvertisedAppointment = NonAdvertisedAppointmentEntity.builder().code("TEST_NAA").build();

		when(nonAdvertisedAppointmentRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testNonAdvertisedAppointment)));

		final var result = codeService.getNonAdvertisedAppointments(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testNonAdvertisedAppointment, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getProfileStatuses() returns a page of profile statuses")
	void getProfileStatusesReturnsPageOfProfileStatuses() {
		final var testProfileStatus = ProfileStatusEntity.builder().code("TEST_PS").build();

		when(profileStatusRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testProfileStatus)));

		final var result = codeService.getProfileStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testProfileStatus, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getProvinces() returns a page of provinces")
	void getProvincesReturnsPageOfProvinces() {
		final var testProvince = ProvinceEntity.builder().code("TEST_PROV").build();

		when(provinceRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testProvince)));

		final var result = codeService.getProvinces(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testProvince, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getRequestStatuses() returns a page of request statuses")
	void getRequestStatusesReturnsPageOfRequestStatuses() {
		final var testRequestStatus = RequestStatusEntity.builder().code("TEST_RS").build();

		when(requestStatusRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testRequestStatus)));

		final var result = codeService.getRequestStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testRequestStatus, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getSecurityClearances() returns a page of security clearances")
	void getSecurityClearancesReturnsPageOfSecurityClearances() {
		final var testSecurityClearance = SecurityClearanceEntity.builder().code("TEST_SC").build();

		when(securityClearanceRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testSecurityClearance)));

		final var result = codeService.getSecurityClearances(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testSecurityClearance, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getSelectionProcessTypes() returns a page of selection process types")
	void getSelectionProcessTypesReturnsPageOfSelectionProcessTypes() {
		final var testSelectionProcessType = SelectionProcessTypeEntity.builder().code("TEST_SPT").build();

		when(selectionProcessTypeRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testSelectionProcessType)));

		final var result = codeService.getSelectionProcessTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testSelectionProcessType, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getUserTypes() returns a page of user types")
	void getUserTypesReturnsPageOfUserTypes() {
		final var testUserType = UserTypeEntity.builder().code("TEST_UT").build();

		when(userTypeRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testUserType)));

		final var result = codeService.getUserTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testUserType, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getWfaStatuses() returns a page of WFA statuses")
	void getWfaStatusesReturnsPageOfWfaStatuses() {
		final var testWfaStatus = WfaStatusEntity.builder().code("TEST_WFA").build();

		when(wfaStatusRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testWfaStatus)));

		final var result = codeService.getWfaStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testWfaStatus, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getWorkSchedules() returns a page of work schedules")
	void getWorkSchedulesReturnsPageOfWorkSchedules() {
		final var testWorkSchedule = WorkScheduleEntity.builder().code("TEST_WS").build();

		when(workScheduleRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testWorkSchedule)));

		final var result = codeService.getWorkSchedules(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testWorkSchedule, result.getContent().getFirst());
	}

	@Test
	@DisplayName("getWorkUnits() returns a page of work units")
	void getWorkUnitsReturnsPageOfWorkUnits() {
		final var testWorkEntity = WorkUnitEntity.builder().code("TEST_WU").build();

		when(workUnitRepository.findAll(any(Specification.class), eq(Pageable.unpaged())))
			.thenReturn(new PageImpl<>(List.of(testWorkEntity)));

		final var result = codeService.getWorkUnits(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(testWorkEntity, result.getContent().getFirst());
	}

}
