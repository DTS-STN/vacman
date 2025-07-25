package ca.gov.dtsstn.vacman.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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

import ca.gov.dtsstn.vacman.api.data.entity.CityEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
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
	PriorityLevelRepository priorityLevelRepository;

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
	@DisplayName("getAllCities() returns a page of cities")
	void getAllCitiesReturnsPageOfCities() {
		when(cityRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new CityEntityBuilder().code("TEST_CITY").build())));

		final var result = codeService.getAllCities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new CityEntityBuilder().code("TEST_CITY").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllClassifications() returns a page of classifications")
	void getAllClassificationsReturnsPageOfClassifications() {
		when(classificationRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ClassificationEntityBuilder().code("TEST_CLASSIFICATION").build())));

		final var result = codeService.getAllClassifications(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new ClassificationEntityBuilder().code("TEST_CLASSIFICATION").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllEmploymentEquities() returns a page of employment equities")
	void getAllEmploymentEquitiesReturnsPageOfEmploymentEquities() {
		when(employmentEquityRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentEquityEntityBuilder().code("TEST_EE").build())));

		final var result = codeService.getAllEmploymentEquities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new EmploymentEquityEntityBuilder().code("TEST_EE").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllEmploymentOpportunities() returns a page of employment opportunities")
	void getAllEmploymentOpportunitiesReturnsPageOfEmploymentOpportunities() {
		when(employmentOpportunityRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentOpportunityEntityBuilder().code("TEST_EO").build())));

		final var result = codeService.getAllEmploymentOpportunities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new EmploymentOpportunityEntityBuilder().code("TEST_EO").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllEmploymentTenures() returns a page of employment tenures")
	void getAllEmploymentTenuresReturnsPageOfEmploymentTenures() {
		when(employmentTenureRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentTenureEntityBuilder().code("TEST_ET").build())));

		final var result = codeService.getAllEmploymentTenures(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new EmploymentTenureEntityBuilder().code("TEST_ET").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllLanguages() returns a page of languages")
	void getAllLanguagesReturnsPageOfLanguages() {
		when(languageRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageEntityBuilder().code("TEST_LANG").build())));

		final var result = codeService.getAllLanguages(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new LanguageEntityBuilder().code("TEST_LANG").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllLanguageReferralTypes() returns a page of language referral types")
	void getAllLanguageReferralTypesReturnsPageOfLanguageReferralTypes() {
		when(languageReferralTypeRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageReferralTypeEntityBuilder().code("TEST_LRT").build())));

		final var result = codeService.getAllLanguageReferralTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new LanguageReferralTypeEntityBuilder().code("TEST_LRT").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllLanguageRequirements() returns a page of language requirements")
	void getAllLanguageRequirementsReturnsPageOfLanguageRequirements() {
		when(languageRequirementRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageRequirementEntityBuilder().code("TEST_LR").build())));

		final var result = codeService.getAllLanguageRequirements(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new LanguageRequirementEntityBuilder().code("TEST_LR").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllNonAdvertisedAppointments() returns a page of non-advertised appointments")
	void getAllNonAdvertisedAppointmentsReturnsPageOfNonAdvertisedAppointments() {
		when(nonAdvertisedAppointmentRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new NonAdvertisedAppointmentEntityBuilder().code("TEST_NAA").build())));

		final var result = codeService.getAllNonAdvertisedAppointments(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new NonAdvertisedAppointmentEntityBuilder().code("TEST_NAA").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllPriorityLevels() returns a page of priority levels")
	void getAllPriorityLevelsReturnsPageOfPriorityLevels() {
		when(priorityLevelRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new PriorityLevelEntityBuilder().code("TEST_PL").build())));

		final var result = codeService.getAllPriorityLevels(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new PriorityLevelEntityBuilder().code("TEST_PL").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllProfileStatuses() returns a page of profile statuses")
	void getAllProfileStatusesReturnsPageOfProfileStatuses() {
		when(profileStatusRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProfileStatusEntityBuilder().code("TEST_PS").build())));

		final var result = codeService.getAllProfileStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new ProfileStatusEntityBuilder().code("TEST_PS").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllProvinces() returns a page of provinces")
	void getAllProvincesReturnsPageOfProvinces() {
		when(provinceRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProvinceEntityBuilder().code("TEST_PROV").build())));

		final var result = codeService.getAllProvinces(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new ProvinceEntityBuilder().code("TEST_PROV").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllRequestStatuses() returns a page of request statuses")
	void getAllRequestStatusesReturnsPageOfRequestStatuses() {
		when(requestStatusRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new RequestStatusEntityBuilder().code("TEST_RS").build())));

		final var result = codeService.getAllRequestStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new RequestStatusEntityBuilder().code("TEST_RS").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllSecurityClearances() returns a page of security clearances")
	void getAllSecurityClearancesReturnsPageOfSecurityClearances() {
		when(securityClearanceRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SecurityClearanceEntityBuilder().code("TEST_SC").build())));

		final var result = codeService.getAllSecurityClearances(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new SecurityClearanceEntityBuilder().code("TEST_SC").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllSelectionProcessTypes() returns a page of selection process types")
	void getAllSelectionProcessTypesReturnsPageOfSelectionProcessTypes() {
		when(selectionProcessTypeRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SelectionProcessTypeEntityBuilder().code("TEST_SPT").build())));

		final var result = codeService.getAllSelectionProcessTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new SelectionProcessTypeEntityBuilder().code("TEST_SPT").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllUserTypes() returns a page of user types")
	void getAllUserTypesReturnsPageOfUserTypes() {
		when(userTypeRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new UserTypeEntityBuilder().code("TEST_UT").build())));

		final var result = codeService.getAllUserTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new UserTypeEntityBuilder().code("TEST_UT").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllWfaStatuses() returns a page of WFA statuses")
	void getAllWfaStatusesReturnsPageOfWfaStatuses() {
		when(wfaStatusRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WfaStatusEntityBuilder().code("TEST_WFA").build())));

		final var result = codeService.getAllWfaStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new WfaStatusEntityBuilder().code("TEST_WFA").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllWorkSchedules() returns a page of work schedules")
	void getAllWorkSchedulesReturnsPageOfWorkSchedules() {
		when(workScheduleRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkScheduleEntityBuilder().code("TEST_WS").build())));

		final var result = codeService.getAllWorkSchedules(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new WorkScheduleEntityBuilder().code("TEST_WS").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getAllWorkUnits() returns a page of work units")
	void getAllWorkUnitsReturnsPageOfWorkUnits() {
		when(workUnitRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkUnitEntityBuilder().code("TEST_WU").build())));

		final var result = codeService.getAllWorkUnits(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new WorkUnitEntityBuilder().code("TEST_WU").build(), result.getContent().getFirst());
	}

}
