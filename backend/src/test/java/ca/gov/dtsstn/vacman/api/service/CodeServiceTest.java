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
import ca.gov.dtsstn.vacman.api.data.entity.MatchFeedbackEntityBuilder;
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
import ca.gov.dtsstn.vacman.api.data.repository.MatchFeedbackRepository;

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
	
	@Mock
	MatchFeedbackRepository matchFeedbackRepository;

	@InjectMocks
	CodeService codeService;

	@Test
	@DisplayName("getCities() returns a page of cities")
	void getCitiesReturnsPageOfCities() {
		when(cityRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new CityEntityBuilder().code("TEST_CITY").build())));

		final var result = codeService.getCities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new CityEntityBuilder().code("TEST_CITY").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getClassifications() returns a page of classifications")
	void getClassificationsReturnsPageOfClassifications() {
		when(classificationRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ClassificationEntityBuilder().code("TEST_CLASSIFICATION").build())));

		final var result = codeService.getClassifications(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new ClassificationEntityBuilder().code("TEST_CLASSIFICATION").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getEmploymentEquities() returns a page of employment equities")
	void getEmploymentEquitiesReturnsPageOfEmploymentEquities() {
		when(employmentEquityRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentEquityEntityBuilder().code("TEST_EE").build())));

		final var result = codeService.getEmploymentEquities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new EmploymentEquityEntityBuilder().code("TEST_EE").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getEmploymentOpportunities() returns a page of employment opportunities")
	void getEmploymentOpportunitiesReturnsPageOfEmploymentOpportunities() {
		when(employmentOpportunityRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentOpportunityEntityBuilder().code("TEST_EO").build())));

		final var result = codeService.getEmploymentOpportunities(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new EmploymentOpportunityEntityBuilder().code("TEST_EO").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getEmploymentTenures() returns a page of employment tenures")
	void getEmploymentTenuresReturnsPageOfEmploymentTenures() {
		when(employmentTenureRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new EmploymentTenureEntityBuilder().code("TEST_ET").build())));

		final var result = codeService.getEmploymentTenures(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new EmploymentTenureEntityBuilder().code("TEST_ET").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getLanguages() returns a page of languages")
	void getLanguagesReturnsPageOfLanguages() {
		when(languageRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageEntityBuilder().code("TEST_LANG").build())));

		final var result = codeService.getLanguages(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new LanguageEntityBuilder().code("TEST_LANG").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getLanguageReferralTypes() returns a page of language referral types")
	void getLanguageReferralTypesReturnsPageOfLanguageReferralTypes() {
		when(languageReferralTypeRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageReferralTypeEntityBuilder().code("TEST_LRT").build())));

		final var result = codeService.getLanguageReferralTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new LanguageReferralTypeEntityBuilder().code("TEST_LRT").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getLanguageRequirements() returns a page of language requirements")
	void getLanguageRequirementsReturnsPageOfLanguageRequirements() {
		when(languageRequirementRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new LanguageRequirementEntityBuilder().code("TEST_LR").build())));

		final var result = codeService.getLanguageRequirements(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new LanguageRequirementEntityBuilder().code("TEST_LR").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getNonAdvertisedAppointments() returns a page of non-advertised appointments")
	void getNonAdvertisedAppointmentsReturnsPageOfNonAdvertisedAppointments() {
		when(nonAdvertisedAppointmentRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new NonAdvertisedAppointmentEntityBuilder().code("TEST_NAA").build())));

		final var result = codeService.getNonAdvertisedAppointments(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new NonAdvertisedAppointmentEntityBuilder().code("TEST_NAA").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getPriorityLevels() returns a page of priority levels")
	void getPriorityLevelsReturnsPageOfPriorityLevels() {
		when(priorityLevelRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new PriorityLevelEntityBuilder().code("TEST_PL").build())));

		final var result = codeService.getPriorityLevels(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new PriorityLevelEntityBuilder().code("TEST_PL").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getProfileStatuses() returns a page of profile statuses")
	void getProfileStatusesReturnsPageOfProfileStatuses() {
		when(profileStatusRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProfileStatusEntityBuilder().code("TEST_PS").build())));

		final var result = codeService.getProfileStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new ProfileStatusEntityBuilder().code("TEST_PS").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getProvinces() returns a page of provinces")
	void getProvincesReturnsPageOfProvinces() {
		when(provinceRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new ProvinceEntityBuilder().code("TEST_PROV").build())));

		final var result = codeService.getProvinces(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new ProvinceEntityBuilder().code("TEST_PROV").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getRequestStatuses() returns a page of request statuses")
	void getRequestStatusesReturnsPageOfRequestStatuses() {
		when(requestStatusRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new RequestStatusEntityBuilder().code("TEST_RS").build())));

		final var result = codeService.getRequestStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new RequestStatusEntityBuilder().code("TEST_RS").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getSecurityClearances() returns a page of security clearances")
	void getSecurityClearancesReturnsPageOfSecurityClearances() {
		when(securityClearanceRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SecurityClearanceEntityBuilder().code("TEST_SC").build())));

		final var result = codeService.getSecurityClearances(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new SecurityClearanceEntityBuilder().code("TEST_SC").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getSelectionProcessTypes() returns a page of selection process types")
	void getSelectionProcessTypesReturnsPageOfSelectionProcessTypes() {
		when(selectionProcessTypeRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new SelectionProcessTypeEntityBuilder().code("TEST_SPT").build())));

		final var result = codeService.getSelectionProcessTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new SelectionProcessTypeEntityBuilder().code("TEST_SPT").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getUserTypes() returns a page of user types")
	void getUserTypesReturnsPageOfUserTypes() {
		when(userTypeRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new UserTypeEntityBuilder().code("TEST_UT").build())));

		final var result = codeService.getUserTypes(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new UserTypeEntityBuilder().code("TEST_UT").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getWfaStatuses() returns a page of WFA statuses")
	void getWfaStatusesReturnsPageOfWfaStatuses() {
		when(wfaStatusRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WfaStatusEntityBuilder().code("TEST_WFA").build())));

		final var result = codeService.getWfaStatuses(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new WfaStatusEntityBuilder().code("TEST_WFA").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getWorkSchedules() returns a page of work schedules")
	void getWorkSchedulesReturnsPageOfWorkSchedules() {
		when(workScheduleRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkScheduleEntityBuilder().code("TEST_WS").build())));

		final var result = codeService.getWorkSchedules(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new WorkScheduleEntityBuilder().code("TEST_WS").build(), result.getContent().getFirst());
	}

	@Test
	@DisplayName("getWorkUnits() returns a page of work units")
	void getWorkUnitsReturnsPageOfWorkUnits() {
		when(workUnitRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new WorkUnitEntityBuilder().code("TEST_WU").build())));

		final var result = codeService.getWorkUnits(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new WorkUnitEntityBuilder().code("TEST_WU").build(), result.getContent().getFirst());
	}
	
	@Test
	@DisplayName("getMatchFeedback() returns a page of match feedback")
	void getMatchFeedbackReturnsPageOfMatchFeedback() {
		when(matchFeedbackRepository.findAll(Pageable.unpaged()))
			.thenReturn(new PageImpl<>(List.of(new MatchFeedbackEntityBuilder().code("TEST_MF").build())));

		final var result = codeService.getMatchFeedback(Pageable.unpaged());

		assertNotNull(result);
		assertEquals(1, result.getTotalElements());
		assertEquals(new MatchFeedbackEntityBuilder().code("TEST_MF").build(), result.getContent().getFirst());
	}

}
