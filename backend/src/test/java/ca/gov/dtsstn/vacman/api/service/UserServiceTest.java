package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;

@DisplayName("UserService Tests")
@ExtendWith({ MockitoExtension.class })
class UserServiceTest {

	@Mock
	UserRepository userRepository;

	UserService userService;

	@BeforeEach
	void beforeEach() {
		this.userService = new UserService(userRepository);
	}

	@Test
	@DisplayName("createUser should save and return a new user with a generated id")
	void createUser_shouldSaveAndReturnNewUser() {
		when(userRepository.save(any(UserEntity.class)))
			.thenAnswer(invocation -> invocation.getArgument(0));

		final var inputUser = UserEntity.builder()
			.name("Test User")
			.build();

		final var outputUser = userService.createUser(inputUser);

		verify(userRepository).save(any(UserEntity.class));
		assertThat(outputUser.id()).matches(id -> id.length() == 36);
		assertThat(outputUser.name()).isEqualTo("Test User");
	}

	@Test
	@DisplayName("getAllUsers should return a list of all existing users")
	void getAllUsers_shouldReturnListOfUsers() {
		final var mockUsers = List.of(
			UserEntity.builder()
				.id(UUID.randomUUID().toString())
				.name("User One")
				.build(),
			UserEntity.builder()
				.id(UUID.randomUUID().toString())
				.name("User Two")
				.build());

		when(userRepository.findAll()).thenReturn(mockUsers);

		final var outputUsers = userService.getAllUsers();

		verify(userRepository).findAll();
		assertThat(outputUsers).extracting(UserEntity::id).allMatch(id -> id.length() == 36);
		assertThat(outputUsers).extracting(UserEntity::name).containsExactly("User One", "User Two");
	}

}