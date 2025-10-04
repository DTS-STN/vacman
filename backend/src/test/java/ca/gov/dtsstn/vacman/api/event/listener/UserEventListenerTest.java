package ca.gov.dtsstn.vacman.api.event.listener;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.event.CurrentUserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserCreateConflictEvent;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.UserDeletedEvent;
import ca.gov.dtsstn.vacman.api.event.UserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserUpdatedEvent;

@ExtendWith({ MockitoExtension.class })
@DisplayName("UserEventListener tests")
class UserEventListenerTest {

	@Mock
	EventRepository eventRepository;

	@Captor
	ArgumentCaptor<EventEntity> eventEntityCaptor;

	UserEventListener userEventListener;

	@BeforeEach
	void beforeEach() {
		this.userEventListener = new UserEventListener(eventRepository);
	}

	@Nested
	@DisplayName("handleUserCreated()")
	class HandleUserCreated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var user = UserEntity.builder()
				.id(123L)
				.build();

			userEventListener.handleUserCreated(new UserCreatedEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("USER_CREATED");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":123");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var user = UserEntity.builder()
				.id(456L)
				.build();

			userEventListener.handleUserCreated(new UserCreatedEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleUserCreateConflict()")
	class HandleUserCreateConflict {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var user = UserEntity.builder()
				.id(789L)
				.build();

			userEventListener.handleUserCreateConflict(new UserCreateConflictEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("USER_CREATE_CONFLICT");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":789");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var user = UserEntity.builder()
				.id(999L)
				.build();

			userEventListener.handleUserCreateConflict(new UserCreateConflictEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleUserUpdated()")
	class HandleUserUpdated {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var user = UserEntity.builder()
				.id(111L)
				.build();

			userEventListener.handleUserUpdated(new UserUpdatedEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("USER_UPDATED");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":111");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var user = UserEntity.builder()
				.id(222L)
				.build();

			userEventListener.handleUserUpdated(new UserUpdatedEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleUserDeleted()")
	class HandleUserDeleted {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var user = UserEntity.builder()
				.id(333L)
				.build();

			userEventListener.handleUserDeleted(new UserDeletedEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("USER_DELETED");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":333");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var user = UserEntity.builder()
				.id(444L)
				.build();

			userEventListener.handleUserDeleted(new UserDeletedEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleUserRead()")
	class HandleUserRead {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			final var user = UserEntity.builder()
				.id(555L)
				.build();

			userEventListener.handleUserRead(new UserReadEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("USER_READ");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("\"id\":555");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			final var user = UserEntity.builder()
				.id(666L)
				.build();

			userEventListener.handleUserRead(new UserReadEvent(user));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entity");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

	}

	@Nested
	@DisplayName("handleCurrentUserRead()")
	class HandleCurrentUserRead {

		@Test
		@DisplayName("Should save event to repository")
		void shouldSaveEventToRepository() throws Exception {
			userEventListener.handleCurrentUserRead(new CurrentUserReadEvent(777L, "entra-id-123"));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("CURRENT_USER_READ");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("777");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("entra-id-123");
		}

		@Test
		@DisplayName("Should save event with valid JSON details")
		void shouldSaveEventWithValidJsonDetails() throws Exception {
			userEventListener.handleCurrentUserRead(new CurrentUserReadEvent(888L, "entra-id-456"));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getDetails()).isNotNull();
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("userId");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("microsoftEntraId");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("timestamp");
		}

		@Test
		@DisplayName("Should handle null Entra ID")
		void shouldHandleNullEntraId() throws Exception {
			userEventListener.handleCurrentUserRead(new CurrentUserReadEvent(999L, null));

			verify(eventRepository).save(eventEntityCaptor.capture());
			assertThat(eventEntityCaptor.getValue().getType()).isEqualTo("CURRENT_USER_READ");
			assertThat(eventEntityCaptor.getValue().getDetails()).contains("999");
		}

	}

}
