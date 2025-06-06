package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
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

		final var inputUser = new UserEntityBuilder()
			.firstName("Test")
			.lastName("User")
			.build();

		userService.createUser(inputUser);

		verify(userRepository).save(any(UserEntity.class));
	}

	@Test
	@DisplayName("getAllUsers should return a list of all existing users")
	void getAllUsers_shouldReturnListOfUsers() {
		final var mockUsers = List.of(
			new UserEntityBuilder()
				.firstName("User")
				.lastName("One")
				.build(),
			new UserEntityBuilder()
				.firstName("User")
				.lastName("Two")
				.build());

		when(userRepository.findAll()).thenReturn(mockUsers);

		final var outputUsers = userService.getAllUsers();

		verify(userRepository).findAll();
		assertThat(outputUsers).extracting(UserEntity::getFirstName).containsExactly("User One", "User Two");
	}

}