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
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.event.ProfileCreateEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileReadEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.ProfileUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.ProfileStatus;

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
			final var profile = ProfileEntity.builder()
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
			final var profile = ProfileEntity.builder()
				.id(456L)
				.build();

			profileEventListener.handleProfileCreated(new ProfileCreateEvent(profile));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
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
			final var profile = ProfileEntity.builder()
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
			final var profile = ProfileEntity.builder()
				.id(999L)
				.build();

			profileEventListener.handleProfileUpdated(new ProfileUpdatedEvent(profile));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleProfileStatusChange()")
	class HandleProfileStatusChange {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var profile = ProfileEntity.builder()
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
			final var profile = ProfileEntity.builder()
				.id(222L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build())
				.user(UserEntity.builder()
					.firstName("John")
					.lastName("Doe")
					.language(LanguageEntity.builder()
						.code("EN")
						.build())
					.businessEmailAddress("john.doe@example.com")
					.build())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

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
			final var profile = ProfileEntity.builder()
				.id(222L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build())
				.personalEmailAddress("john.personal@example.com")
				.user(UserEntity.builder()
					.firstName("John")
					.lastName("Doe")
					.language(LanguageEntity.builder()
						.code("EN")
						.build())
					.businessEmailAddress("john.doe@example.com")
					.build())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

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
			final var profile = ProfileEntity.builder()
				.id(333L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build())
				.personalEmailAddress("jane.personal@example.com")
				.user(UserEntity.builder()
					.firstName("Jane")
					.lastName("Smith")
					.language(LanguageEntity.builder()
						.code("EN")
						.build())
					.businessEmailAddress(null)
					.build())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

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
			final var profile = ProfileEntity.builder()
				.id(334L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build())
				.personalEmailAddress(null)
				.user(UserEntity.builder()
					.firstName("Jane")
					.lastName("Smith")
					.language(LanguageEntity.builder()
						.code("EN")
						.build())
					.businessEmailAddress(null)
					.build())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should not send approval notification when user is null")
		void shouldNotSendApprovalNotificationWhenUserIsNull() throws Exception {
			final var profile = ProfileEntity.builder()
				.id(444L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("APPROVED")
					.build())
				.user(null) // intentional
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");

			profileEventListener.handleProfileStatusChange(new ProfileStatusChangeEvent(profile, 1L, 2L));

			verify(notificationService, never()).sendProfileNotification(
				any(String.class),
				any(String.class),
				any(String.class),
				any(String.class),
				eq(ProfileStatus.APPROVED)
			);
		}

		@Test
		@DisplayName("Should send pending notification to HR advisor when transitioning from incomplete to pending")
		void shouldSendPendingNotificationWhenTransitioningFromIncompleteToPending() throws Exception {
			final var profile = ProfileEntity.builder()
				.id(555L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build())
				.user(UserEntity.builder()
					.firstName("Alice")
					.lastName("Johnson")
					.language(LanguageEntity.builder()
						.code("EN")
						.build())
					.build())
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress("hradvisor@example.com")
					.build())
				.build();

			when(profileStatusCodes.approved()).thenReturn("APPROVED");
			when(profileStatusCodes.pending()).thenReturn("PENDING");
			when(profileStatusCodes.incomplete()).thenReturn("INCOMPLETE");

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("INCOMPLETE")
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
			final var profile = ProfileEntity.builder()
				.id(666L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build())
				.user(UserEntity.builder()
					.firstName("Bob")
					.lastName("Williams")
					.language(LanguageEntity.builder()
						.code("EN")
						.build())
					.build())
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress("hr@example.com")
					.build())
				.build();

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("APPROVED")
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
			final var profile = ProfileEntity.builder()
				.id(777L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build())
				.user(UserEntity.builder()
					.firstName("Charlie")
					.lastName("Brown")
					.build())
				.hrAdvisor(null) // intentional
				.build();

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("INCOMPLETE")
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
			final var profile = ProfileEntity.builder()
				.id(888L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build())
				.user(UserEntity.builder()
					.firstName("David")
					.lastName("Miller")
					.build())
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress(null) // intentional
					.build())
				.build();

			when(profileStatusRepository.findById(1L)).thenReturn(Optional.of(ProfileStatusEntity.builder()
				.id(1L)
				.code("INCOMPLETE")
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
			final var profile = ProfileEntity.builder()
				.id(999L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build())
				.user(UserEntity.builder()
					.firstName("Eve")
					.lastName("Davis")
					.build())
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress("hradvisor@example.com")
					.build())
				.build();

			when(profileStatusRepository.findById(1L))
				.thenReturn(Optional.of(ProfileStatusEntity.builder()
					.id(1L)
					.code("REJECTED")
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
			final var profile = ProfileEntity.builder()
				.id(1000L)
				.profileStatus(null) // intentional
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
			final var profile = ProfileEntity.builder()
				.id(1111L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(2L)
					.code("PENDING")
					.build())
				.user(UserEntity.builder()
					.firstName("Frank")
					.lastName("Wilson")
					.build())
				.hrAdvisor(UserEntity.builder()
					.businessEmailAddress("hradvisor@example.com")
					.build())
				.build();

			when(profileStatusRepository.findById(1L)).thenReturn(Optional.empty());
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
			final var profile = ProfileEntity.builder()
				.id(1212L)
				.profileStatus(ProfileStatusEntity.builder()
					.id(3L)
					.code("REJECTED")
					.build())
				.build();

			when(profileStatusRepository.findById(1L)).thenReturn(Optional.of(ProfileStatusEntity.builder()
				.id(1L)
				.code("INCOMPLETE")
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
