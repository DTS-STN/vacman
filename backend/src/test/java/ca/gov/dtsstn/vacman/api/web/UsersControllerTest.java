package ca.gov.dtsstn.vacman.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.gov.dtsstn.vacman.api.config.WebSecurityConfig;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.LanguageModelMapper;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserTypeModelMapper;

@ActiveProfiles("test")
@Import({ WebSecurityConfig.class })
@DisplayName("UsersController tests")
@WebMvcTest({ UsersController.class })
class UsersControllerTest {

	@Autowired MockMvc mockMvc;

	@Autowired ObjectMapper objectMapper;

	@MockitoBean UserService userService;

	@MockitoBean UserModelMapper userModelMapper;

	@MockitoBean UserTypeModelMapper userTypeModelMapper;

	@MockitoBean LanguageModelMapper languageModelMapper;

	@MockitoBean LanguageRepository languageRepository;

	@MockitoBean UserTypeRepository userTypeRepository;

	@BeforeEach
	void beforeEach() {
		MockitoAnnotations.openMocks(this);

		// Setup mock repositories for validation
		// Mock language repository for language code validation
		LanguageEntity englishLang = new LanguageEntity(1L, "EN", "English", "Anglais",
			Instant.parse("2000-01-01T00:00:00Z"), null, "test", Instant.now(), "test", Instant.now());
		LanguageEntity frenchLang = new LanguageEntity(2L, "FR", "French", "Français",
			Instant.parse("2000-01-01T00:00:00Z"), null, "test", Instant.now(), "test", Instant.now());

		when(languageRepository.findByCode("EN")).thenReturn(Optional.of(englishLang));
		when(languageRepository.findByCode("FR")).thenReturn(Optional.of(frenchLang));

		// Mock user type repository for user type code validation
		UserTypeEntity employeeType = new UserTypeEntity(1L, "employee", "Employee", "Employé",
			Instant.parse("2000-01-01T00:00:00Z"), null, "test", Instant.now(), "test", Instant.now());
		UserTypeEntity adminType = new UserTypeEntity(2L, "admin", "Administrator", "Administrateur",
			Instant.parse("2000-01-01T00:00:00Z"), null, "test", Instant.now(), "test", Instant.now());

		when(userTypeRepository.findByCode("employee")).thenReturn(Optional.of(employeeType));
		when(userTypeRepository.findByCode("admin")).thenReturn(Optional.of(adminType));
	}

	private UserReadModel createMockUserReadModel(String firstName, String lastName, String activeDirectoryId) {
		var userType = new UserTypeReadModel(1L, "EMPLOYEE", "Employee", "Employé",
			"Test User", Instant.parse("2000-01-01T00:00:00Z"), "Test User", Instant.parse("2000-01-01T00:00:00Z"));
		var language = new LanguageReadModel(1L, "EN", "English", "Anglais",
			"Test User", Instant.parse("2000-01-01T00:00:00Z"), "Test User", Instant.parse("2000-01-01T00:00:00Z"));

		return new UserReadModel(1L, userType, activeDirectoryId, activeDirectoryId, firstName, "A", lastName,
			firstName.substring(0,1) + "A" + lastName.substring(0,1), "12345", "555-123-4567",
			firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com", language,
			"vacman-api", Instant.parse("2000-01-01T00:00:00Z"), "vacman-api", Instant.parse("2000-01-01T00:00:00Z"));
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users - Should return paginated user collection")
	void getUsers_shouldReturnPaginatedUserCollection() throws Exception {
		final var mockUsers = List.of(
			new UserEntityBuilder()
				.firstName("John")
				.lastName("Doe")
				.middleName("A")
				.initial("JAD")
				.activeDirectoryId("a1b2c3d4-5678-9012-3456-789abcdef012")
				.businessEmailAddress("john.doe@example.com")
				.businessPhoneNumber("555-123-4567")
				.build(),
			new UserEntityBuilder()
				.firstName("Jane")
				.lastName("Smith")
				.middleName("B")
				.initial("JBS")
				.activeDirectoryId("f0e1d2c3-b4a5-9687-1234-56789abcdef0")
				.businessEmailAddress("jane.smith@example.com")
				.businessPhoneNumber("555-987-6543")
				.build());

		final var pageable = PageRequest.of(0, 2);
		final var mockPage = new PageImpl<>(mockUsers, pageable, 4);

		// Mock the mapper responses
		when(userModelMapper.toModel(mockUsers.get(0))).thenReturn(createMockUserReadModel("John", "Doe", "a1b2c3d4-5678-9012-3456-789abcdef012"));
		when(userModelMapper.toModel(mockUsers.get(1))).thenReturn(createMockUserReadModel("Jane", "Smith", "f0e1d2c3-b4a5-9687-1234-56789abcdef0"));
		when(userService.getUsers(any(Pageable.class))).thenReturn(mockPage);

		mockMvc.perform(get("/api/v1/users"))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON));

		verify(userService).getUsers(any(Pageable.class));
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("POST /api/v1/users - Should create and return new user")
	void createUser_shouldCreateUser() throws Exception {
		final var mockUser = new UserEntityBuilder()
			.firstName("John")
			.lastName("Doe")
			.middleName("A")
			.initial("JAD")
			.activeDirectoryId("9f8e7d6c-5b4a-3921-8765-4321098765dc")
			.businessEmailAddress("test@example.com")
			.businessPhoneNumber("555-123-4567")
			.build();

		final var userCreateModel = new UserCreateModel("test@example.com", "employee", "EN");
		final var expectedResponse = createMockUserReadModel("John", "Doe", "9f8e7d6c-5b4a-3921-8765-4321098765dc");

		when(userService.createUser(any(UserCreateModel.class))).thenReturn(mockUser);
		when(userModelMapper.toModel(mockUser)).thenReturn(expectedResponse);

		mockMvc.perform(post("/api/v1/users")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userCreateModel)))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).createUser(any(UserCreateModel.class));
		verify(userModelMapper).toModel(mockUser);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users?networkName=... - Should return user collection when networkName exists")
	void getUsers_givenActiveDirectoryIdExists_shouldReturnUserCollection() throws Exception {
		final var testActiveDirectoryId = "2ca209f5-7913-491e-af5a-1f488ce0613b";
		final var mockUser = new UserEntityBuilder()
			.firstName("Test")
			.lastName("User")
			.middleName("T")
			.initial("TTU")
			.activeDirectoryId(testActiveDirectoryId)
			.businessEmailAddress("test.user@example.com")
			.businessPhoneNumber("555-123-4567")
			.build();

		when(userService.getUserByActiveDirectoryId(testActiveDirectoryId))
			.thenReturn(Optional.of(mockUser));

		final var expectedUserModel = createMockUserReadModel("Test", "User", testActiveDirectoryId);
		when(userModelMapper.toModel(mockUser)).thenReturn(expectedUserModel);

		mockMvc.perform(get("/api/v1/users")
			.param("activeDirectoryId", testActiveDirectoryId))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON));

		verify(userService).getUserByActiveDirectoryId(testActiveDirectoryId);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users?networkName=... - Should return empty collection when user does not exist")
	void getUsers_givenActiveDirectoryIdDoesNotExist_shouldReturnEmptyCollection() throws Exception {
		final var testActiveDirectoryId = "12345678-1234-1234-1234-123456789abc";

		when(userService.getUserByActiveDirectoryId(testActiveDirectoryId))
			.thenReturn(Optional.empty());

		final var expectedResponse = List.of();

		mockMvc.perform(get("/api/v1/users")
			.param("activeDirectoryId", testActiveDirectoryId))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).getUserByActiveDirectoryId(testActiveDirectoryId);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users?networkName= - Should return empty collection when networkName is blank")
	void getUsers_givenBlankActiveDirectoryId_shouldReturnPaginatedResults() throws Exception {
		final var mockUsers = List.of(
			new UserEntityBuilder()
				.firstName("John")
				.lastName("Doe")
				.middleName("A")
				.initial("JAD")
				.activeDirectoryId("c4b3a2d1-e5f6-7890-1234-56789abcdef0")
				.businessEmailAddress("john.doe@example.com")
				.businessPhoneNumber("555-123-4567")
				.build());

		final var pageable = PageRequest.of(0, 20);
		final var mockPage = new PageImpl<>(mockUsers, pageable, 1);

		when(userService.getUsers(any(Pageable.class))).thenReturn(mockPage);
		when(userModelMapper.toModel(mockUsers.get(0))).thenReturn(createMockUserReadModel("John", "Doe", "c4b3a2d1-e5f6-7890-1234-56789abcdef0"));

		mockMvc.perform(get("/api/v1/users")
			.param("networkName", ""))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON));

		verify(userService).getUsers(any(Pageable.class));
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("PATCH /api/v1/users/{id} should update and return user when user exists")
	void patchUser_givenUserExists_shouldUpdateAndReturnUser() throws Exception {
		final var userId = 1L;
		final var userUpdate = new UserUpdateModel(
			userId, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com", "FR"
		);

		final var updatedUser = new UserEntityBuilder()
			.id(userId)
			.firstName("Jane")
			.lastName("Smith")
			.activeDirectoryId("2ca209f5-7913-491e-af5a-1f488ce0613b")
			.build();

		when(userService.getUserById(userId)).thenReturn(Optional.of(updatedUser));
		when(userService.updateUser(any(UserUpdateModel.class))).thenReturn(updatedUser);
		when(userModelMapper.toModel(updatedUser)).thenReturn(createMockUserReadModel("Jane", "Smith", "2ca209f5-7913-491e-af5a-1f488ce0613b"));

		mockMvc.perform(patch("/api/v1/users/" + userId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userUpdate)))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON));

		verify(userService).getUserById(userId);
		verify(userService).updateUser(userUpdate);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("PATCH /api/v1/users/{id} should return 404 when user does not exist")
	void patchUser_givenUserDoesNotExist_shouldReturn404() throws Exception {
		final var userId = 999L;
		final var userUpdate = new UserUpdateModel(
			userId, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com", "EN"
		);

		when(userService.getUserById(userId)).thenReturn(Optional.empty());

		mockMvc.perform(patch("/api/v1/users/" + userId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userUpdate)))
			.andExpect(status().isNotFound());

		verify(userService).getUserById(userId);
		verify(userService, never()).updateUser(any(UserUpdateModel.class));
	}

}
