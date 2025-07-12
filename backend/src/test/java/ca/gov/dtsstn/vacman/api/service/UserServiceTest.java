package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
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

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@DisplayName("UserService Tests")
@ExtendWith({ MockitoExtension.class })
class UserServiceTest {

	@Mock
	UserRepository userRepository;

	@Mock
	UserTypeRepository userTypeRepository;

	@Mock
	LanguageRepository languageRepository;

	@Mock
	UserModelMapper userModelMapper;

	UserService userService;

	@BeforeEach
	void beforeEach() {
		this.userService = new UserService(
			userRepository,
			userTypeRepository,
			languageRepository,
			userModelMapper
		);
	}

	@Test
	@DisplayName("createUser should save and return a new user with a generated id")
	void createUser_shouldSaveAndReturnNewUser() {
		when(userRepository.save(any(UserEntity.class)))
			.thenAnswer(invocation -> invocation.getArgument(0));
		when(userTypeRepository.findByCode("employee"))
			.thenReturn(Optional.of(new UserTypeEntity()));
		when(languageRepository.findByCode("EN"))
			.thenReturn(Optional.of(createMockLanguageEntity(1L, "EN", "English", "Anglais")));
		when(userModelMapper.toEntity(any(UserCreateModel.class)))
			.thenReturn(new UserEntityBuilder()
				.firstName("Test")
				.lastName("User")
				.profiles(List.of(new ProfileEntity()))
				.build());

		final var userCreateModel = new UserCreateModel("test@example.com", "employee", "EN");

		userService.createUser(userCreateModel);

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

	@Test
	@DisplayName("getUserByNetworkName should return empty Optional when user does not exist")
	void getUserByNetworkName_givenUserDoesNotExist_shouldReturnEmptyOptional() {
		when(userRepository.findByNetworkName("12345678-1234-1234-1234-123456789abc"))
			.thenReturn(Optional.empty());

		final var result = userService.getUserByNetworkName("12345678-1234-1234-1234-123456789abc");

		assertThat(result).isNotPresent();
		verify(userRepository).findByNetworkName("12345678-1234-1234-1234-123456789abc");
	}

	@Test
	@DisplayName("getUserByNetworkName should return user when networkName exists")
	void getUserByNetworkName_givenUserExists_shouldReturnUser() {
		final var testNetworkName = "2ca209f5-7913-491e-af5a-1f488ce0613b";
		final var mockUser = new UserEntityBuilder()
			.firstName("Test")
			.lastName("User")
			.networkName(testNetworkName)
			.build();

		when(userRepository.findByNetworkName(testNetworkName))
			.thenReturn(Optional.of(mockUser));

		final var result = userService.getUserByNetworkName(testNetworkName);

		assertThat(result).isPresent();
		assertThat(result.get().getNetworkName()).isEqualTo(testNetworkName);
		assertThat(result.get().getFirstName()).isEqualTo("Test");
		assertThat(result.get().getLastName()).isEqualTo("User");
		verify(userRepository).findByNetworkName(testNetworkName);
	}

	@Test
	@DisplayName("updateUser should return empty Optional when user does not exist")
	void updateUser_givenUserDoesNotExist_shouldReturnEmptyOptional() {
		final var updateModel = new UserUpdateModel(
			999L, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com", "FR"
		);

		when(userRepository.findById(999L)).thenReturn(Optional.empty());

		final var result = userService.updateUser(updateModel);

		assertThat(result).isNotPresent();
		verify(userRepository).findById(999L);
	}

	@Test
	@DisplayName("updateUser should update and return user when user exists")
	void updateUser_givenUserExists_shouldUpdateAndReturnUser() {
		final var userId = 1L;
		final var existingUser = new UserEntityBuilder()
			.id(userId)
			.firstName("John")
			.lastName("Doe")
			.networkName("12345678-1234-1234-1234-123456789abc")
			.build();

		final var updateModel = new UserUpdateModel(
			userId, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com", "BOTH"
		);

		final var mockUserType = new UserTypeEntity();
		mockUserType.setCode("admin");

		when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
		when(userTypeRepository.findByCode("admin")).thenReturn(Optional.of(mockUserType));
		when(languageRepository.findByCode("BOTH"))
			.thenReturn(Optional.of(createMockLanguageEntity(2L, "BOTH", "Both Official Languages", "Les deux langues officielles")));
		when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// Configure the mock mapper to simulate the mapping behavior
		doAnswer(invocation -> {
			UserUpdateModel model = invocation.getArgument(0);
			UserEntity entity = invocation.getArgument(1);
			// Simulate the mapping by updating the entity fields
			entity.setFirstName(model.firstName());
			entity.setLastName(model.lastName());
			entity.setNetworkName(model.networkName());
			entity.setBusinessPhoneNumber(model.businessPhone());
			entity.setBusinessEmailAddress(model.businessEmail());
			entity.setMiddleName(model.middleName());
			entity.setInitial(model.initials());
			entity.setPersonalRecordIdentifier(model.personalRecordIdentifier());
			return null; // void method
		}).when(userModelMapper).updateEntityFromModel(any(UserUpdateModel.class), any(UserEntity.class));

		final var result = userService.updateUser(updateModel);

		assertThat(result).isPresent();
		// Check that the existing user object was modified
		assertThat(existingUser.getFirstName()).isEqualTo("Jane");
		assertThat(existingUser.getLastName()).isEqualTo("Smith");
		assertThat(result.get().getFirstName()).isEqualTo("Jane");
		assertThat(result.get().getLastName()).isEqualTo("Smith");
		assertThat(result.get().getUserType().getCode()).isEqualTo("admin");
		verify(userRepository).findById(userId);
		verify(userRepository).save(any(UserEntity.class));
		verify(userTypeRepository).findByCode("admin");
	}

	@Test
	@DisplayName("updateUser should update user without changing role when role is null")
	void updateUser_givenNullRole_shouldUpdateUserWithoutChangingRole() {
		final var userId = 1L;
		final var existingUserType = new UserTypeEntity();
		existingUserType.setCode("employee");

		final var existingUser = new UserEntityBuilder()
			.id(userId)
			.firstName("John")
			.lastName("Doe")
			.userType(existingUserType)
			.networkName("12345678-1234-1234-1234-123456789abc")
			.build();

		final var updateModel = new UserUpdateModel(
			userId, null, "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com", null
		);

		when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
		when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// Configure the mock mapper to simulate the mapping behavior
		doAnswer(invocation -> {
			UserUpdateModel model = invocation.getArgument(0);
			UserEntity entity = invocation.getArgument(1);
			// Simulate the mapping by updating the entity fields
			entity.setFirstName(model.firstName());
			entity.setLastName(model.lastName());
			entity.setNetworkName(model.networkName());
			entity.setBusinessPhoneNumber(model.businessPhone());
			entity.setBusinessEmailAddress(model.businessEmail());
			entity.setMiddleName(model.middleName());
			entity.setInitial(model.initials());
			entity.setPersonalRecordIdentifier(model.personalRecordIdentifier());
			return null; // void method
		}).when(userModelMapper).updateEntityFromModel(any(UserUpdateModel.class), any(UserEntity.class));

		final var result = userService.updateUser(updateModel);

		assertThat(result).isPresent();
		// Check that the existing user object was modified
		assertThat(existingUser.getFirstName()).isEqualTo("Jane");
		assertThat(existingUser.getLastName()).isEqualTo("Smith");
		assertThat(result.get().getFirstName()).isEqualTo("Jane");
		assertThat(result.get().getLastName()).isEqualTo("Smith");
		assertThat(result.get().getUserType().getCode()).isEqualTo("employee"); // Should remain unchanged
		verify(userRepository).findById(userId);
		verify(userRepository).save(any(UserEntity.class));
		verify(userTypeRepository, never()).findByCode(any());
	}

	private LanguageEntity createMockLanguageEntity(Long id, String code, String nameEn, String nameFr) {
		LanguageEntity language = new LanguageEntity();
		language.setId(id);
		language.setCode(code);
		language.setNameEn(nameEn);
		language.setNameFr(nameFr);
		return language;
	}

}
