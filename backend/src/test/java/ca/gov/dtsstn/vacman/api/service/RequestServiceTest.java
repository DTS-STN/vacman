package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.MatchStatuses;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.RequestStatuses;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.UserTypes;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.event.RequestHrAdvisorUpdatedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestUpdatedEvent;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

	@Mock ApplicationEventPublisher eventPublisher;
	@Mock ApplicationProperties applicationProperties;
	@Mock CityRepository cityRepository;
	@Mock ClassificationRepository classificationRepository;
	@Mock EmploymentEquityRepository employmentEquityRepository;
	@Mock EmploymentTenureRepository employmentTenureRepository;
	@Mock LanguageRepository languageRepository;
	@Mock LanguageRequirementRepository languageRequirementRepository;
	@Mock LookupCodes lookupCodes;
	@Mock MatchRepository matchRepository;
	@Mock MatchStatusRepository matchStatusRepository;
	@Mock NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;
	@Mock ProvinceRepository provinceRepository;
	@Mock RequestMatchingService requestMatchingService;
	@Mock RequestRepository requestRepository;
	@Mock RequestStatusRepository requestStatusRepository;
	@Mock SecurityClearanceRepository securityClearanceRepository;
	@Mock SelectionProcessTypeRepository selectionProcessTypeRepository;
	@Mock UserService userService;
	@Mock WorkScheduleRepository workScheduleRepository;
	@Mock WorkUnitRepository workUnitRepository;
	@Mock(answer = Answers.RETURNS_DEEP_STUBS) RequestStatuses requestStatuses;
	@Mock(answer = Answers.RETURNS_DEEP_STUBS) MatchStatuses matchStatuses;
	@Mock(answer = Answers.RETURNS_DEEP_STUBS) UserTypes userTypes;

	RequestService requestService;

	@BeforeEach
	void setUp() {
		when(lookupCodes.requestStatuses()).thenReturn(requestStatuses);
		when(lookupCodes.matchStatuses()).thenReturn(matchStatuses);
		when(lookupCodes.userTypes()).thenReturn(userTypes);
		when(requestRepository.save(any(RequestEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		requestService = new RequestService(
			eventPublisher,
			applicationProperties,
			cityRepository,
			classificationRepository,
			employmentEquityRepository,
			employmentTenureRepository,
			languageRepository,
			languageRequirementRepository,
			lookupCodes,
			matchRepository,
			matchStatusRepository,
			nonAdvertisedAppointmentRepository,
			provinceRepository,
			requestMatchingService,
			requestRepository,
			requestStatusRepository,
			securityClearanceRepository,
			selectionProcessTypeRepository,
			userService,
			workScheduleRepository,
			workUnitRepository);
	}

	@Test
	@DisplayName("updateRequest(previousHrAdvisorId) publishes HR advisor change event when IDs differ")
	void updateRequestPublishesHrAdvisorChangeEvent() {
		final var request = buildRequestEntity(10L, 200L, "advisor@example.com");

		requestService.updateRequest(request, 100L);

		final var eventCaptor = ArgumentCaptor.forClass(Object.class);
		verify(eventPublisher, atLeastOnce()).publishEvent(eventCaptor.capture());

		final var hrAdvisorEvent = eventCaptor.getAllValues().stream()
			.filter(RequestHrAdvisorUpdatedEvent.class::isInstance)
			.map(RequestHrAdvisorUpdatedEvent.class::cast)
			.findFirst();

		assertTrue(hrAdvisorEvent.isPresent(), "Expected HR advisor update event to be published");
		assertThat(hrAdvisorEvent.get().previousHrAdvisorId()).isEqualTo(100L);
		assertThat(hrAdvisorEvent.get().newHrAdvisorId()).isEqualTo(200L);
	}

	@Test
	@DisplayName("updateRequest() without previous HR advisor does not publish change event")
	void updateRequestWithoutPreviousAdvisorSkipsHrAdvisorEvent() {
		final var request = buildRequestEntity(42L, 300L, "advisor@example.com");

		requestService.updateRequest(request);

		final var eventCaptor = ArgumentCaptor.forClass(Object.class);
		verify(eventPublisher, atLeastOnce()).publishEvent(eventCaptor.capture());

		final boolean hrEventPublished = eventCaptor.getAllValues().stream()
			.anyMatch(RequestHrAdvisorUpdatedEvent.class::isInstance);

		assertFalse(hrEventPublished, "HR advisor update event should not be published by default overload");

		final boolean requestUpdatedPublished = eventCaptor.getAllValues().stream()
			.anyMatch(RequestUpdatedEvent.class::isInstance);

		assertTrue(requestUpdatedPublished, "RequestUpdatedEvent should always be published");
	}

	private RequestEntity buildRequestEntity(Long requestId, Long advisorId, String advisorEmail) {
		final var request = new RequestEntity();
		ReflectionTestUtils.setField(request, "id", requestId);
		request.setNameEn("Test Request");

		final var advisor = new UserEntity();
		ReflectionTestUtils.setField(advisor, "id", advisorId);
		advisor.setFirstName("Alex");
		advisor.setLastName("Advisor");
		advisor.setBusinessEmailAddress(advisorEmail);

		request.setHrAdvisor(advisor);
		return request;
	}
}
