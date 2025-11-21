package ca.gov.dtsstn.vacman.api.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.data.domain.Pageable.unpaged;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import ca.gov.dtsstn.vacman.api.config.WebSecurityConfig;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchFeedbackEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchStatusEntity;
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
import ca.gov.dtsstn.vacman.api.security.OwnershipPermissionEvaluator;
import ca.gov.dtsstn.vacman.api.service.CodeService;
import io.micrometer.core.instrument.MeterRegistry;

@ActiveProfiles({ "test" })
@Import({ WebSecurityConfig.class })
@WebMvcTest({ CodesController.class })
@DisplayName("CodesController API endpoints")
class CodesControllerTest {

	@Autowired
	MockMvc mockMvc;

	@MockitoBean
	CodeService codeService;

	@MockitoBean
	MeterRegistry meterRegistry;

	@MockitoBean
	OwnershipPermissionEvaluator ownershipPermissionEvaluator;

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/cities - Should return 200 OK with a page of cities")
	void getCities_shouldReturnOk() throws Exception {
		final var city = CityEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test City")
			.nameFr("Ville de test")
			.provinceTerritory(ProvinceEntity.builder()
				.id(0L)
				.code("TEST")
				.nameEn("Test Province")
				.nameFr("Province de test")
				.createdBy("TestUser")
				.createdDate(Instant.EPOCH)
				.lastModifiedBy("TestUser")
				.lastModifiedDate(Instant.EPOCH)
				.build())
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getCities(unpaged(), false)).thenReturn(new PageImpl<>(List.of(city)));

		mockMvc.perform(get("/api/v1/codes/cities"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(city.getId()))
			.andExpect(jsonPath("$.content[0].code").value(city.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(city.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(city.getNameFr()))
			.andExpect(jsonPath("$.content[0].provinceTerritory.id").value(city.getProvinceTerritory().getId()))
			.andExpect(jsonPath("$.content[0].provinceTerritory.code").value(city.getProvinceTerritory().getCode()))
			.andExpect(jsonPath("$.content[0].provinceTerritory.nameEn").value(city.getProvinceTerritory().getNameEn()))
			.andExpect(jsonPath("$.content[0].provinceTerritory.nameFr").value(city.getProvinceTerritory().getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/classifications - Should return 200 OK with a page of classifications")
	void getClassifications_shouldReturnOk() throws Exception {
		final var classification = ClassificationEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Classification")
			.nameFr("Classification de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getClassifications(unpaged(), false)).thenReturn(new PageImpl<>(List.of(classification)));

		mockMvc.perform(get("/api/v1/codes/classifications"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(classification.getId()))
			.andExpect(jsonPath("$.content[0].code").value(classification.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(classification.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(classification.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/employment-equities - Should return 200 OK with a page of employment equities")
	void getEmploymentEquities_shouldReturnOk() throws Exception {
		final var employmentEquity = EmploymentEquityEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Employment Equity")
			.nameFr("Équité en matière d'emploi de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getEmploymentEquities(unpaged(), false)).thenReturn(new PageImpl<>(List.of(employmentEquity)));

		mockMvc.perform(get("/api/v1/codes/employment-equities"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(employmentEquity.getId()))
			.andExpect(jsonPath("$.content[0].code").value(employmentEquity.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(employmentEquity.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(employmentEquity.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/employment-opportunities - Should return 200 OK with a page of employment opportunities")
	void getEmploymentOpportunities_shouldReturnOk() throws Exception {
		final var employmentOpportunity = EmploymentOpportunityEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Employment Opportunity")
			.nameFr("Opportunité d'emploi de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getEmploymentOpportunities(unpaged(), false)).thenReturn(new PageImpl<>(List.of(employmentOpportunity)));

		mockMvc.perform(get("/api/v1/codes/employment-opportunities"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(employmentOpportunity.getId()))
			.andExpect(jsonPath("$.content[0].code").value(employmentOpportunity.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(employmentOpportunity.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(employmentOpportunity.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/employment-tenures - Should return 200 OK with a page of employment tenures")
	void getEmploymentTenures_shouldReturnOk() throws Exception {
		final var employmentTenure = EmploymentTenureEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Employment Tenure")
			.nameFr("Durée d'emploi de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getEmploymentTenures(unpaged(), false)).thenReturn(new PageImpl<>(List.of(employmentTenure)));

		mockMvc.perform(get("/api/v1/codes/employment-tenures"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(employmentTenure.getId()))
			.andExpect(jsonPath("$.content[0].code").value(employmentTenure.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(employmentTenure.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(employmentTenure.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/languages - Should return 200 OK with a page of languages")
	void getLanguages_shouldReturnOk() throws Exception {
		final var language = LanguageEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Language")
			.nameFr("Langue de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getLanguages(unpaged(), false)).thenReturn(new PageImpl<>(List.of(language)));

		mockMvc.perform(get("/api/v1/codes/languages"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(language.getId()))
			.andExpect(jsonPath("$.content[0].code").value(language.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(language.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(language.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/language-referral-types - Should return 200 OK with a page of language referral types")
	void getLanguageReferralTypes_shouldReturnOk() throws Exception {
		final var languageReferralType = LanguageReferralTypeEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Language Referral Type")
			.nameFr("Type de référence linguistique de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getLanguageReferralTypes(unpaged(), false)).thenReturn(new PageImpl<>(List.of(languageReferralType)));

		mockMvc.perform(get("/api/v1/codes/language-referral-types"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(languageReferralType.getId()))
			.andExpect(jsonPath("$.content[0].code").value(languageReferralType.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(languageReferralType.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(languageReferralType.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/language-requirements - Should return 200 OK with a page of language requirements")
	void getLanguageRequirements_shouldReturnOk() throws Exception {
		final var languageRequirement = LanguageRequirementEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Language Requirement")
			.nameFr("Exigence linguistique de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getLanguageRequirements(unpaged(), false)).thenReturn(new PageImpl<>(List.of(languageRequirement)));

		mockMvc.perform(get("/api/v1/codes/language-requirements"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(languageRequirement.getId()))
			.andExpect(jsonPath("$.content[0].code").value(languageRequirement.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(languageRequirement.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(languageRequirement.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/match-feedbacks - Should return 200 OK with a page of match feedbacks")
	void getMatchFeedbacks_shouldReturnOk() throws Exception {
		final var matchFeedback = MatchFeedbackEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Match Feedback")
			.nameFr("Retour de correspondance de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getMatchFeedbacks(unpaged(), false)).thenReturn(new PageImpl<>(List.of(matchFeedback)));

		mockMvc.perform(get("/api/v1/codes/match-feedbacks"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(matchFeedback.getId()))
			.andExpect(jsonPath("$.content[0].code").value(matchFeedback.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(matchFeedback.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(matchFeedback.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/match-statuses - Should return 200 OK with a page of match statuses")
	void getMatchStatuses_shouldReturnOk() throws Exception {
		final var matchStatus = MatchStatusEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Match Status")
			.nameFr("Statut de correspondance de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getMatchStatuses(unpaged(), false)).thenReturn(new PageImpl<>(List.of(matchStatus)));

		mockMvc.perform(get("/api/v1/codes/match-statuses"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(matchStatus.getId()))
			.andExpect(jsonPath("$.content[0].code").value(matchStatus.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(matchStatus.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(matchStatus.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/non-advertised-appointments - Should return 200 OK with a page of non-advertised appointments")
	void getNonAdvertisedAppointments_shouldReturnOk() throws Exception {
		final var nonAdvertisedAppointment = NonAdvertisedAppointmentEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Non-Advertised Appointment")
			.nameFr("Nomination non annoncée de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getNonAdvertisedAppointments(unpaged(), false)).thenReturn(new PageImpl<>(List.of(nonAdvertisedAppointment)));

		mockMvc.perform(get("/api/v1/codes/non-advertised-appointments"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(nonAdvertisedAppointment.getId()))
			.andExpect(jsonPath("$.content[0].code").value(nonAdvertisedAppointment.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(nonAdvertisedAppointment.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(nonAdvertisedAppointment.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/profile-statuses - Should return 200 OK with a page of profile statuses")
	void getProfileStatuses_shouldReturnOk() throws Exception {
		final var profileStatus = ProfileStatusEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Profile Status")
			.nameFr("Statut de profil de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getProfileStatuses(unpaged(), false)).thenReturn(new PageImpl<>(List.of(profileStatus)));

		mockMvc.perform(get("/api/v1/codes/profile-statuses"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(profileStatus.getId()))
			.andExpect(jsonPath("$.content[0].code").value(profileStatus.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(profileStatus.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(profileStatus.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/provinces - Should return 200 OK with a page of provinces")
	void getProvinces_shouldReturnOk() throws Exception {
		final var province = ProvinceEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Province")
			.nameFr("Province de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getProvinces(unpaged(), false)).thenReturn(new PageImpl<>(List.of(province)));

		mockMvc.perform(get("/api/v1/codes/provinces"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(province.getId()))
			.andExpect(jsonPath("$.content[0].code").value(province.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(province.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(province.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/request-statuses - Should return 200 OK with a page of request statuses")
	void getRequestStatuses_shouldReturnOk() throws Exception {
		final var requestStatus = RequestStatusEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Request Status")
			.nameFr("Statut de la demande de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getRequestStatuses(unpaged(), false)).thenReturn(new PageImpl<>(List.of(requestStatus)));

		mockMvc.perform(get("/api/v1/codes/request-statuses"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(requestStatus.getId()))
			.andExpect(jsonPath("$.content[0].code").value(requestStatus.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(requestStatus.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(requestStatus.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/security-clearances - Should return 200 OK with a page of security clearances")
	void getSecurityClearances_shouldReturnOk() throws Exception {
		final var securityClearance = SecurityClearanceEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Security Clearance")
			.nameFr("Habilitation de sécurité de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getSecurityClearances(unpaged(), false)).thenReturn(new PageImpl<>(List.of(securityClearance)));

		mockMvc.perform(get("/api/v1/codes/security-clearances"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(securityClearance.getId()))
			.andExpect(jsonPath("$.content[0].code").value(securityClearance.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(securityClearance.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(securityClearance.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/selection-process-types - Should return 200 OK with a page of selection process types")
	void getSelectionProcessTypes_shouldReturnOk() throws Exception {
		final var selectionProcessType = SelectionProcessTypeEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Selection Process Type")
			.nameFr("Type de processus de sélection de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getSelectionProcessTypes(unpaged(), false)).thenReturn(new PageImpl<>(List.of(selectionProcessType)));

		mockMvc.perform(get("/api/v1/codes/selection-process-types"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(selectionProcessType.getId()))
			.andExpect(jsonPath("$.content[0].code").value(selectionProcessType.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(selectionProcessType.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(selectionProcessType.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/user-types - Should return 200 OK with a page of user types")
	void getUserTypes_shouldReturnOk() throws Exception {
		final var userType = UserTypeEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test User Type")
			.nameFr("Type d'utilisateur de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getUserTypes(unpaged(), false)).thenReturn(new PageImpl<>(List.of(userType)));

		mockMvc.perform(get("/api/v1/codes/user-types"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(userType.getId()))
			.andExpect(jsonPath("$.content[0].code").value(userType.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(userType.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(userType.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/wfa-statuses - Should return 200 OK with a page of WFA statuses")
	void getWfaStatuses_shouldReturnOk() throws Exception {
		final var wfaStatus = WfaStatusEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test WFA Status")
			.nameFr("Statut WFA de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getWfaStatuses(unpaged(), false)).thenReturn(new PageImpl<>(List.of(wfaStatus)));

		mockMvc.perform(get("/api/v1/codes/wfa-statuses"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(wfaStatus.getId()))
			.andExpect(jsonPath("$.content[0].code").value(wfaStatus.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(wfaStatus.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(wfaStatus.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/work-schedules - Should return 200 OK with a page of work schedules")
	void getWorkSchedules_shouldReturnOk() throws Exception {
		final var workSchedule = WorkScheduleEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Work Schedule")
			.nameFr("Horaire de travail de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getWorkSchedules(unpaged(), false)).thenReturn(new PageImpl<>(List.of(workSchedule)));

		mockMvc.perform(get("/api/v1/codes/work-schedules"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(workSchedule.getId()))
			.andExpect(jsonPath("$.content[0].code").value(workSchedule.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(workSchedule.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(workSchedule.getNameFr()));
	}

	@Test
	@WithAnonymousUser
	@DisplayName("GET /codes/work-units - Should return 200 OK with a page of work units")
	void getWorkUnits_shouldReturnOk() throws Exception {
		final var workUnit = WorkUnitEntity.builder()
			.id(0L)
			.code("TEST")
			.nameEn("Test Work Unit")
			.nameFr("Unité de travail de test")
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build();

		when(codeService.getWorkUnits(unpaged(), false)).thenReturn(new PageImpl<>(List.of(workUnit)));

		mockMvc.perform(get("/api/v1/codes/work-units"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.content", hasSize(1)))
			.andExpect(jsonPath("$.content[0].id").value(workUnit.getId()))
			.andExpect(jsonPath("$.content[0].code").value(workUnit.getCode()))
			.andExpect(jsonPath("$.content[0].nameEn").value(workUnit.getNameEn()))
			.andExpect(jsonPath("$.content[0].nameFr").value(workUnit.getNameFr()));
	}

}
