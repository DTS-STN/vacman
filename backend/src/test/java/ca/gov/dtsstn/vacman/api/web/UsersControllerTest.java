package ca.gov.dtsstn.vacman.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.gov.dtsstn.vacman.api.config.WebSecurityConfig;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.UserCollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@ActiveProfiles("test")
@Import({ WebSecurityConfig.class })
@WebMvcTest({ UsersController.class })
@DisplayName("UsersController tests")
class UsersControllerTest {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@MockitoBean
	UserService userService;

	UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	@BeforeEach
	void beforeEach() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("GET /api/v1/users - Should return user collection when users exist")
	void getAllUsers_shouldReturnUserCollection() throws Exception {
		final var mockUsers = List.of(
			UserEntity.builder()
				.id(UUID.randomUUID().toString())
				.name("User One")
				.build(),
			UserEntity.builder()
				.id(UUID.randomUUID().toString())
				.name("User Two")
				.build());

		when(userService.getAllUsers()).thenReturn(mockUsers);

		final var expectedResponse = new UserCollectionModel(mockUsers.stream()
			.map(userModelMapper::toModel)
			.toList());

		mockMvc.perform(get("/api/v1/users"))
			.andExpect(status().isOk())
			.andExpect(content().contentType(MediaType.APPLICATION_JSON))
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).getAllUsers();
	}

	@Test
	@WithMockUser(authorities = { "SCOPE_employee" })
	@DisplayName("POST /api/v1/users - Should create and return new user")
	void createUser_shouldCreateUser() throws Exception {
		final var mockUser = UserEntity.builder()
			.id("00000000-0000-0000-0000-00000000")
			.name("Test User")
			.build();

		when(userService.createUser(any(UserEntity.class))).thenReturn(mockUser);

		final var expectedResponse = userModelMapper.toModel(mockUser);

		mockMvc.perform(post("/api/v1/users")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(new UserCreateModel("Test User"))))
			.andExpect(status().isOk())
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).createUser(UserEntity.builder()
			.name("Test User")
			.build());
	}

}
