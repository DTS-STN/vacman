package ca.gov.dtsstn.vacman.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
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
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@ActiveProfiles("test")
@Import({ WebSecurityConfig.class })
@DisplayName("UsersController tests")
@WebMvcTest({ UsersController.class })
class UsersControllerTest {

	@Autowired MockMvc mockMvc;

	@Autowired ObjectMapper objectMapper;

	@MockitoBean UserService userService;

	UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	@BeforeEach
	void beforeEach() {
		MockitoAnnotations.openMocks(this);
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
				.networkName("a1b2c3d4-5678-9012-3456-789abcdef012")
				.businessEmailAddress("john.doe@example.com")
				.businessPhoneNumber("555-123-4567")
				.build(),
			new UserEntityBuilder()
				.firstName("Jane")
				.lastName("Smith")
				.middleName("B")
				.initial("JBS")
				.networkName("f0e1d2c3-b4a5-9687-1234-56789abcdef0")
				.businessEmailAddress("jane.smith@example.com")
				.businessPhoneNumber("555-987-6543")
				.build());

		final var pageable = PageRequest.of(0, 2);
		final var mockPage = new PageImpl<>(mockUsers, pageable, 4);

		when(userService.getUsers(any(Pageable.class))).thenReturn(mockPage);

		final var expectedResponse = mockPage.map(userModelMapper::toModel);

		mockMvc.perform(get("/api/v1/users"))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

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
			.networkName("9f8e7d6c-5b4a-3921-8765-4321098765dc")
			.businessEmailAddress("test@example.com")
			.businessPhoneNumber("555-123-4567")
			.build();

		final var userCreateModel = new UserCreateModel("test@example.com", "employee");

		when(userService.createUser(any(UserCreateModel.class))).thenReturn(mockUser);

		final var expectedResponse = userModelMapper.toModel(mockUser);

		mockMvc.perform(post("/api/v1/users")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userCreateModel)))
			.andExpect(status().isOk())
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).createUser(any(UserCreateModel.class));
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users?networkName=... - Should return user collection when networkName exists")
	void getUsers_givenNetworkNameExists_shouldReturnUserCollection() throws Exception {
		final var testNetworkName = "2ca209f5-7913-491e-af5a-1f488ce0613b";
		final var mockUser = new UserEntityBuilder()
			.firstName("Test")
			.lastName("User")
			.middleName("T")
			.initial("TTU")
			.networkName(testNetworkName)
			.businessEmailAddress("test.user@example.com")
			.businessPhoneNumber("555-123-4567")
			.build();

		when(userService.getUserByNetworkName(testNetworkName))
			.thenReturn(Optional.of(mockUser));

		final var expectedUserModel = userModelMapper.toModel(mockUser);
		final var expectedResponse = List.of(expectedUserModel);

		mockMvc.perform(get("/api/v1/users")
			.param("networkName", testNetworkName))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).getUserByNetworkName(testNetworkName);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users?networkName=... - Should return empty collection when user does not exist")
	void getUsers_givenNetworkNameDoesNotExist_shouldReturnEmptyCollection() throws Exception {
		final var testNetworkName = "12345678-1234-1234-1234-123456789abc";

		when(userService.getUserByNetworkName(testNetworkName))
			.thenReturn(Optional.empty());

		final var expectedResponse = List.of();

		mockMvc.perform(get("/api/v1/users")
			.param("networkName", testNetworkName))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).getUserByNetworkName(testNetworkName);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users?networkName= - Should return empty collection when networkName is blank")
	void getUsers_givenBlankNetworkName_shouldReturnPaginatedResults() throws Exception {
		final var mockUsers = List.of(
			new UserEntityBuilder()
				.firstName("John")
				.lastName("Doe")
				.middleName("A")
				.initial("JAD")
				.networkName("c4b3a2d1-e5f6-7890-1234-56789abcdef0")
				.businessEmailAddress("john.doe@example.com")
				.businessPhoneNumber("555-123-4567")
				.build());

		final var pageable = PageRequest.of(0, 20);
		final var mockPage = new PageImpl<>(mockUsers, pageable, 1);

		when(userService.getUsers(any(Pageable.class))).thenReturn(mockPage);

		final var expectedResponse = mockPage.map(userModelMapper::toModel);

		mockMvc.perform(get("/api/v1/users")
			.param("networkName", ""))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).getUsers(any(Pageable.class));
	}

	@Test
	@WithMockUser
	@DisplayName("PATCH /api/v1/users/{id} should update and return user when user exists")
	void patchUser_givenUserExists_shouldUpdateAndReturnUser() throws Exception {
		final var userId = 1L;
		final var userUpdate = new UserUpdateModel(
			userId, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com"
		);

		final var updatedUser = new UserEntityBuilder()
			.id(userId)
			.firstName("Jane")
			.lastName("Smith")
			.networkName("2ca209f5-7913-491e-af5a-1f488ce0613b")
			.build();

		when(userService.updateUser(any(UserUpdateModel.class))).thenReturn(Optional.of(updatedUser));

		mockMvc.perform(patch("/api/v1/users/" + userId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userUpdate)))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(userModelMapper.toModel(updatedUser))));

		verify(userService).updateUser(userUpdate);
	}

	@Test
	@WithMockUser
	@DisplayName("PATCH /api/v1/users/{id} should return 404 when user does not exist")
	void patchUser_givenUserDoesNotExist_shouldReturn404() throws Exception {
		final var userId = 999L;
		final var userUpdate = new UserUpdateModel(
			userId, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com"
		);

		when(userService.updateUser(any(UserUpdateModel.class))).thenReturn(Optional.empty());

		mockMvc.perform(patch("/api/v1/users/" + userId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userUpdate)))
			.andExpect(status().isNotFound());

		verify(userService).updateUser(userUpdate);
	}

	@Test
	@WithMockUser
	@DisplayName("PATCH /api/v1/users/{id} should return 400 when path ID does not match body ID")
	void patchUser_givenMismatchedIds_shouldReturn400() throws Exception {
		final var pathId = 1L;
		final var bodyId = 2L;
		final var userUpdate = new UserUpdateModel(
			bodyId, "admin", "2ca209f5-7913-491e-af5a-1f488ce0613b",
			"Jane", "M", "Smith", "JMS", "67890",
			"555-987-6543", "jane.smith@example.com"
		);

		mockMvc.perform(patch("/api/v1/users/" + pathId)
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(userUpdate)))
			.andExpect(status().isBadRequest());
	}

}
