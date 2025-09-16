package ca.gov.dtsstn.vacman.api.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Example;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.service.MSGraphService;
import ca.gov.dtsstn.vacman.api.service.dto.MSGraphUserBuilder;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModelBuilder;

@Transactional
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({ "test" })
@DisplayName("UsersController API endpoints")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UsersControllerTest {

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@Autowired
	ProfileRepository profileRepository;

	@Autowired
	ProfileStatusRepository profileStatusRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@Autowired
	UserRepository userRepository;

	@MockitoBean
	MSGraphService msGraphService;

	@Nested
	@DisplayName("POST /api/v1/users/me")
	class CreateCurrentUser {

		@Test
		@DisplayName("Should create and return user")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testCreateCurrentUser() throws Exception {
			when(msGraphService.getUserById(any()))
				.thenReturn(Optional.of(MSGraphUserBuilder.builder()
					.id("00000000-0000-0000-0000-000000000000")
					.givenName("Test")
					.surname("User")
					.mail("test.user@example.com")
					.build()));

			final var request = UserCreateModelBuilder.builder()
				.languageId(1L)
				.build();

			mockMvc.perform(post("/api/v1/users/me")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", notNullValue()))
				.andExpect(jsonPath("$.firstName", is("Test")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.businessEmailAddress", is("test.user@example.com")))
				.andExpect(jsonPath("$.microsoftEntraId", is("00000000-0000-0000-0000-000000000000")))
				.andExpect(jsonPath("$.language.id", is(1)))
				.andExpect(jsonPath("$.userType.code", is("employee")));

			final var userInDb = userRepository.findOne(Example.of(new UserEntityBuilder()
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.build()));

			assertThat(userInDb).isPresent()
				.hasValueSatisfying(user -> assertThat(user)
					.extracting(UserEntity::getFirstName)
					.isEqualTo("Test"));
		}

		@Test
		@DisplayName("Should return 409 Conflict if user already exists")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testCreateCurrentUserConflict() throws Exception {
			userRepository.save(new UserEntityBuilder()
				.businessEmailAddress("existing.user@example.com")
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.firstName("Existing")
				.lastName("User")
				.language(languageRepository.getReferenceById(1L))
				.userType(userTypeRepository.getReferenceById(1L))
				.build());

			final var request = UserCreateModelBuilder.builder()
				.languageId(1L)
				.build();

			mockMvc.perform(post("/api/v1/users/me")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isConflict());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized if not authenticated")
		void testCreateCurrentUserUnauthorized() throws Exception {
			final var request = UserCreateModelBuilder.builder()
				.languageId(1L)
				.build();

			mockMvc.perform(post("/api/v1/users/me")
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("GET /api/v1/users/me")
	class GetCurrentUser {

		@Test
		@WithMockUser
		@Disabled("not yet implemented")
		@DisplayName("Should return current user")
		void testGetCurrentUser() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should return 404 Not Found if user does not exist in DB")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testGetCurrentUserNotFound() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

	}

	@Nested
	@DisplayName("GET /api/v1/users")
	class GetUsers {

		@Test
		@Disabled("not yet implemented")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "hr-advisor", "employee" })
		@DisplayName("Should return paged users for hr-advisor")
		void testGetUsersAsHrAdvisor() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should return 403 Forbidden for regular user")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testGetUsersAsRegularUser() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

	}

	@Nested
	@DisplayName("GET /api/v1/users/{id}")
	class GetUserById {

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should return user for hr-advisor")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "hr-advisor", "employee" })
		void testGetUserByIdAsHrAdvisor() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should return user if owner")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testGetUserByIdAsOwner() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should return 403 Forbidden if not owner")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testGetUserByIdAsOtherUser() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

	}

	@Nested
	@DisplayName("PATCH /api/v1/users/{id}")
	class UpdateUser {

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should update user")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testUpdateUser() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

	}

	@Nested
	@DisplayName("PUT /api/v1/users/{id}")
	class OverwriteUser {

		@Test
		@Disabled("not yet implemented")
		@DisplayName("Should overwrite user")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testOverwriteUser() throws Exception {
			throw new UnsupportedOperationException("not yet implemented");
		}

	}

	@Nested
	@DisplayName("POST /api/v1/users/{id}/profiles")
	class CreateProfileForUser {

		@Test
		@DisplayName("Should create and return profile for user as hr-advisor")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "hr-advisor" })
		void testCreateProfileAsHrAdvisor() throws Exception {
			// create the HR advisor in the database
			final var hrAdvisor = userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			// create the employee in the database
			final var employee = userRepository.save(UserEntity.builder()
				.firstName("Employee").lastName("User")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/users/{id}/profiles", employee.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.profileStatus.code", is("INCOMPLETE")))
				.andExpect(jsonPath("$.profileUser.id", is(employee.getId().intValue())))
				.andExpect(jsonPath("$.hrAdvisorId", is(hrAdvisor.getId().intValue())));
		}

		@Test
		@DisplayName("Should return 409 Conflict if user already has an active profile")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "hr-advisor" })
		void testCreateProfileConflict() throws Exception {
			// create the HR advisor in the database
			final var hrAdvisor = userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			// create the employee in the database
			final var employee = userRepository.save(UserEntity.builder()
				.firstName("Employee").lastName("User")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			// create an existing active profile for the employee
			profileRepository.save(ProfileEntity.builder()
				.profileStatus(profileStatusRepository.findByCode("INCOMPLETE").orElseThrow())
				.hrAdvisor(hrAdvisor)
				.user(employee)
				.build());

			mockMvc.perform(post("/api/v1/users/{id}/profiles", employee.getId()))
				.andExpect(status().isConflict());
		}

		@Test
		@DisplayName("Should return 409 Conflict if an HR advisor creates a profile for himself")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "hr-advisor" })
		void testCreateProfileHRAConflict() throws Exception {
			// create the HR advisor in the database
			final var hrAdvisor = userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/users/{id}/profiles", hrAdvisor.getId()))
				.andExpect(status().isConflict());
		}

		@Test
		@DisplayName("Should return 404 Not Found if user does not exist")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "hr-advisor" })
		void testCreateProfileForNonExistentUser() throws Exception {
			// create the HR advisor in the database
			userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			//
			// Note: do not create a user in the database 😉
			//

			mockMvc.perform(post("/api/v1/users/{id}/profiles", 31415926))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 403 Forbidden for regular user trying to create for another user")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testCreateProfileForbidden() throws Exception {
			mockMvc.perform(post("/api/v1/users/{id}/profiles", 16180339))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should allow user to create their own profile")
		@WithMockUser(username = "00000000-0000-0000-0000-000000000000", authorities = { "employee" })
		void testCreateProfileForSelf() throws Exception {
			// create the employee in the database
			final var employee = userRepository.save(UserEntity.builder()
				.firstName("Employee").lastName("User")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("00000000-0000-0000-0000-000000000000")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/users/{id}/profiles", employee.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.profileStatus.code", is("INCOMPLETE")))
				.andExpect(jsonPath("$.profileUser.id", is(employee.getId().intValue())))
				.andExpect(jsonPath("$.hrAdvisorId").doesNotExist()); // ← no HR advisor set
		}

		@Test
		@WithAnonymousUser
		@DisplayName("Should return 401 Unauthorized if not authenticated")
		void testCreateProfileUnauthorized() throws Exception {
			mockMvc.perform(post("/api/v1/users/{id}/profiles", 27182818))
				.andExpect(status().isUnauthorized());
		}

	}

}
