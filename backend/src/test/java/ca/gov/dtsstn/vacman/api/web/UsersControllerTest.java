package ca.gov.dtsstn.vacman.api.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

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
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
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
				.name("User One")
				.build(),
			new UserEntityBuilder()
				.name("User Two")
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
			.name("Test User")
			.build();

		when(userService.createUser(any(UserEntity.class))).thenReturn(mockUser);

		final var expectedResponse = userModelMapper.toModel(mockUser);

		mockMvc.perform(post("/api/v1/users")
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(new UserCreateModel("Test User"))))
			.andExpect(status().isOk())
			.andExpect(content().json(objectMapper.writeValueAsString(expectedResponse)));

		verify(userService).createUser(new UserEntityBuilder()
			.name("Test User")
			.build());
	}

}
