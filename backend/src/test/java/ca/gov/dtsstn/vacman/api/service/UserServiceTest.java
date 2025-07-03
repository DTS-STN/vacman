package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.NotificationPurposeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.NotificationPurposeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;

@DisplayName("UserService Tests")
@ExtendWith({ MockitoExtension.class })
class UserServiceTest {

 @Mock
	UserRepository userRepository;

	@Mock
	ProfileRepository profileRepository;

	@Mock
	NotificationPurposeRepository notificationPurposeRepository;

	@Mock
	ProfileStatusRepository profileStatusRepository;

	@Mock
	ProfileModelMapper profileModelMapper;

	@Mock
	PriorityLevelRepository priorityLevelRepository;

	@Mock
	UserTypeRepository userTypeRepository;

	@Mock
	WorkUnitRepository workUnitRepository;

	UserService userService;

	@BeforeEach
	void beforeEach() {
		this.userService = new UserService(
			userRepository,
			profileRepository,
			notificationPurposeRepository,
			profileStatusRepository,
			profileModelMapper,
			priorityLevelRepository,
			userTypeRepository,
			workUnitRepository
		);
	}

	@Test
	@DisplayName("createUser should save and return a new user with a generated id")
	void createUser_shouldSaveAndReturnNewUser() {
		when(userRepository.save(any(UserEntity.class)))
			.thenAnswer(invocation -> invocation.getArgument(0));
		when(profileRepository.save(any(ProfileEntity.class)))
			.thenAnswer(invocation -> invocation.getArgument(0));
		when(profileStatusRepository.findByCode("PENDING"))
			.thenReturn(Optional.of(new ProfileStatusEntity()));
		when(notificationPurposeRepository.findByCode("GENERAL"))
			.thenReturn(Optional.of(new NotificationPurposeEntity()));
		when(priorityLevelRepository.findByCode("NORMAL"))
			.thenReturn(Optional.of(new PriorityLevelEntity()));
		when(userTypeRepository.findByCode("employee"))
			.thenReturn(Optional.of(new UserTypeEntity()));
		when(workUnitRepository.findByCode("LABOUR"))
			.thenReturn(Optional.of(new WorkUnitEntity()));
		when(profileModelMapper.toEntity(any(UserCreateModel.class)))
			.thenReturn(new ProfileEntity());

		final var inputUser = new UserEntityBuilder()
			.firstName("Test")
			.lastName("User")
			.build();

		final var userCreateModel = new UserCreateModel("test@example.com", "employee");

		userService.createUser(inputUser, userCreateModel);

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
		assertThat(outputUsers).extracting(UserEntity::getLastName).containsExactly("One", "Two");
	}

}
