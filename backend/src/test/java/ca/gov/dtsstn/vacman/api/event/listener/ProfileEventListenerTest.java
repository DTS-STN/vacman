package ca.gov.dtsstn.vacman.api.event.listener;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.ProfileStatuses;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;
import ca.gov.dtsstn.vacman.api.service.dto.ProfileEventDtoBuilder;

@ExtendWith({ MockitoExtension.class })
@DisplayName("ProfileEventListener tests")
class ProfileEventListenerTest {

	@Mock
	EventRepository eventRepository;

	@Mock
	ProfileStatusRepository profileStatusRepository;

	@Mock
	LookupCodes lookupCodes;

	@Mock
	ProfileStatuses profileStatusCodes;

	@Mock
	NotificationService notificationService;

	@Captor
	ArgumentCaptor<EventEntity> eventEntityCaptor;

	ProfileEventListener profileEventListener;

	@BeforeEach
	void beforeEach() {
		when(lookupCodes.profileStatuses()).thenReturn(profileStatusCodes);

		this.profileEventListener = new ProfileEventListener(
			eventRepository,
			lookupCodes,
			profileStatusRepository,
			notificationService
		);
	}

	@Nested
	@DisplayName("handleProfileCreated()")
	class HandleProfileCreated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(123L)
				.build();

			profileEventListener.handleProfileCreated(new ProfileCreateEvent(profile));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("PROFILE_CREATED");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":123");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(456L)
				.build();

			profileEventListener.handleProfileCreated(new ProfileCreateEvent(profile));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("dto");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleProfileRead()")
	class HandleProfileRead {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			profileEventListener.handleProfileRead(new ProfileReadEvent(List.of(1L, 2L, 3L), "user@example.com"));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("PROFILE_READ");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("user@example.com");
		}

		@Test
		@DisplayName("Should save event with profile IDs in JSON details")
		void shouldSaveEventWithProfileIdsInJsonDetails() throws Exception {
			profileEventListener.handleProfileRead(new ProfileReadEvent(List.of(100L, 200L), "test.user@example.com"));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("100");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("200");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("test.user@example.com");
		}

		@Test
		@DisplayName("Should handle empty profile IDs list")
		void shouldHandleEmptyProfileIdsList() throws Exception {
			profileEventListener.handleProfileRead(new ProfileReadEvent(List.of(), "empty@example.com"));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("PROFILE_READ");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("empty@example.com");
		}

	}

	@Nested
	@DisplayName("handleProfileUpdated()")
	class HandleProfileUpdated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(789L)
				.build();

			profileEventListener.handleProfileUpdated(new ProfileUpdatedEvent(profile));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("PROFILE_UPDATED");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":789");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(999L)
				.build();

			profileEventListener.handleProfileUpdated(new ProfileUpdatedEvent(profile));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("dto");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleProfileStatusChange()")
	class HandleProfileStatusChange {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(111L)
				.build();

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("PROFILE_STATUS_CHANGE");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":111");
		}

		@Test
		@DisplayName("Should send approval notification to business email when new status is approved")
		void shouldSendApprovalNotificationWhenNewStatusIsApproved() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(222L)
				.userFirstName("John")
				.userLastName("Doe")
				.userLanguageCode("EN")
				.userEmails(List.of("john.doe@example.com"))
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build()));

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService).sendProfileNotification(
				eq(List.of("john.doe@example.com")),
				eq("222"),
				eq("John Doe"),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should send approval notification to both business and personal emails when new status is approved")
		void shouldSendApprovalNotificationToPersonalEmailWhenNewStatusIsApproved() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(222L)
				.userFirstName("John")
				.userLastName("Doe")
				.userLanguageCode("EN")
				.userEmails(List.of("john.doe@example.com", "john.personal@example.com"))
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build()));

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService).sendProfileNotification(
				eq(List.of("john.doe@example.com", "john.personal@example.com")),
				eq("222"),
				eq("John Doe"),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should still send approval notification to personal email when business email is null")
		void shouldStillSendApprovalNotificationToPersonalEmailWhenBusinessEmailIsNull() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(333L)
				.userFirstName("Jane")
				.userLastName("Smith")
				.userLanguageCode("EN")
				.userEmails(List.of("jane.personal@example.com"))
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build()));

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService).sendProfileNotification(
				eq(List.of("jane.personal@example.com")),
				eq("333"),
				eq("Jane Smith"),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should not send approval notification when both business and personal emails are null")
		void shouldNotSendApprovalNotificationWhenBothEmailsAreNull() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(334L)
				.userFirstName("Jane")
				.userLastName("Smith")
				.userLanguageCode("EN")
				.userEmails(List.of())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build()));

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(List.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should not send approval notification when user is null")
		void shouldNotSendApprovalNotificationWhenUserIsNull() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(444L)
				.userFirstName(null)
				.userLastName(null)
				.userLanguageCode(null)
				.userEmails(List.of())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build()));

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(List.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should send pending notification to HR advisor when transitioning from incomplete to pending")
		void shouldSendPendingNotificationWhenTransitioningFromIncompleteToPending() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(555L)
				.userFirstName("Alice")
				.userLastName("Johnson")
				.userLanguageCode("EN")
				.hrAdvisorEmail("hradvisor@example.com")
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("INCOMPLETE")
					.build()));

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build()));

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService).sendProfileNotification(
				eq("hradvisor@example.com"),
				eq("555"),
				eq("Alice Johnson"),
				any(String.class),
				eq(ProfileStatus.PENDING)
			);
		}

		@Test
		@DisplayName("Should send pending notification to HR advisor when transitioning from approved to pending")
		void shouldSendPendingNotificationWhenTransitioningFromApprovedToPending() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(666L)
				.userFirstName("Bob")
				.userLastName("Williams")
				.userLanguageCode("EN")
				.hrAdvisorEmail("hr@example.com")
				.build();

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("APPROVED")
					.build()));

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build()));

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService).sendProfileNotification(
				eq("hr@example.com"),
				eq("666"),
				eq("Bob Williams"),
				any(String.class),
				eq(ProfileStatus.PENDING)
			);
		}

		@Test
		@DisplayName("Should not send pending notification when HR advisor is null")
		void shouldNotSendPendingNotificationWhenHrAdvisorIsNull() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(777L)
				.userFirstName("Charlie")
				.userLastName("Brown")
				.hrAdvisorEmail(null)
				.build();

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("INCOMPLETE")
					.build()));

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build()));

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.PENDING)
			);
		}

		@Test
		@DisplayName("Should not send pending notification when HR advisor email is null")
		void shouldNotSendPendingNotificationWhenHrAdvisorEmailIsNull() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(888L)
				.userFirstName("David")
				.userLastName("Miller")
				.hrAdvisorEmail(null)
				.build();

			when(profileStatusRepository.findById(1L)).thenReturn(Optional.of(ProfileStatusEntity.builder()
				.id(1L)
				.code("INCOMPLETE")
				.build()));

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build()));

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.PENDING)
			);
		}

		@Test
		@DisplayName("Should not send pending notification when transitioning from other status to pending")
		void shouldNotSendPendingNotificationWhenTransitioningFromOtherStatusToPending() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(999L)
				.userFirstName("Eve")
				.userLastName("Davis")
				.hrAdvisorEmail("hradvisor@example.com")
				.build();

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("REJECTED")
					.build()));

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build()));

			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");
			when(profileStatusCodes.approved()).thenReturn("APPROVED");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.PENDING)
			);
		}

		@Test
		@DisplayName("Should not send any notification when new status is null")
		void shouldNotSendAnyNotificationWhenNewStatusIsNull() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(1000L)
				.build();

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				any(ProfileStatus.class)
			);
		}

		@Test
		@DisplayName("Should not send pending notification when previous status is not found")
		void shouldNotSendPendingNotificationWhenPreviousStatusNotFound() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(1111L)
				.userFirstName("Frank")
				.userLastName("Wilson")
				.hrAdvisorEmail("hradvisor@example.com")
				.build();

			when(profileStatusRepository.findById(1L)).thenReturn(Optional.empty());

			when(profileStatusRepository.findById(2L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build()));

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.PENDING)
			);
		}

		@Test
		@DisplayName("Should not send notification when transitioning to non-approved and non-pending status")
		void shouldNotSendNotificationWhenTransitioningToOtherStatus() throws Exception {
			final var profile = ProfileEventDtoBuilder.builder()
				.id(1212L)
				.build();

			when(profileStatusRepository.findById(1L)).thenReturn(Optional.of(ProfileStatusEntity.builder()
				.id(1L)
				.code("INCOMPLETE")
				.build()));

			when(profileStatusRepository.findById(3L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(3L)
					.code("REJECTED")
					.build()));

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 3L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				any(ProfileStatus.class)
			);
		}

	}

}
