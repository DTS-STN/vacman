package ca.gov.dtsstn.vacman.api.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.CoreMatchers.hasItem;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

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
import ca.gov.dtsstn.vacman.api.web.model.UserPatchModel;

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
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testCreateCurrentUser() throws Exception {
			when(msGraphService.getUserById(any()))
				.thenReturn(Optional.of(MSGraphUserBuilder.builder()
					.id("01010101-0101-0101-0101-010101010101")
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
				.andExpect(jsonPath("$.microsoftEntraId", is("01010101-0101-0101-0101-010101010101")))
				.andExpect(jsonPath("$.language.id", is(1)))
				.andExpect(jsonPath("$.userType.code", is("employee")));

			final var userInDb = userRepository.findOne(Example.of(new UserEntityBuilder()
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.build()));

			assertThat(userInDb).isPresent()
				.hasValueSatisfying(user -> assertThat(user)
					.extracting(UserEntity::getFirstName)
					.isEqualTo("Test"));
		}

		@Test
		@DisplayName("Should return 409 Conflict if user already exists")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testCreateCurrentUserConflict() throws Exception {
			userRepository.save(new UserEntityBuilder()
				.businessEmailAddress("existing.user@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
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
		@DisplayName("Should return 40 Unauthorized if not authenticated")
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
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		@DisplayName("Should return current user")
		void testGetCurrentUser() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Current").lastName("User")
				.businessEmailAddress("current.user@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/users/me"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("Current")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.businessEmailAddress", is("current.user@example.com")))
				.andExpect(jsonPath("$.microsoftEntraId", is("01010101-0101-0101-0101-010101010101")))
				.andExpect(jsonPath("$.userType.code", is("employee")));
		}

		@Test
		@DisplayName("Should return 404 Not Found if user does not exist in DB")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testGetCurrentUserNotFound() throws Exception {
			mockMvc.perform(get("/api/v1/users/me"))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized if not authenticated")
		@WithAnonymousUser
		void testGetCurrentUserUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/users/me"))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("GET /api/v1/users")
	class GetUsers {

		@Test
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		@DisplayName("Should return paged users for hr-advisor")
		void testGetUsersAsHrAdvisor() throws Exception {
			userRepository.save(UserEntity.builder()
				.firstName("HR").lastName("Advisor")
				.businessEmailAddress("hr.advisor@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			userRepository.save(UserEntity.builder()
				.firstName("Regular").lastName("Employee")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/users"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[*].firstName", hasItem("HR")))
				.andExpect(jsonPath("$.content[*].firstName", hasItem("Regular")))
				.andExpect(jsonPath("$.content[*].businessEmailAddress", hasItem("hr.advisor@example.com")))
				.andExpect(jsonPath("$.content[*].businessEmailAddress", hasItem("employee@example.com")));
		}

		@Test
		@DisplayName("Should allow regular user to view users list")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testGetUsersAsRegularUser() throws Exception {
			mockMvc.perform(get("/api/v1/users"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content").isArray());
		}

		@Test
		@DisplayName("Should filter users by email")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testGetUsersFilteredByEmail() throws Exception {
			userRepository.save(UserEntity.builder()
				.firstName("Test").lastName("User")
				.businessEmailAddress("test@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			when(msGraphService.getUserByEmail(any()))
				.thenReturn(Optional.of(MSGraphUserBuilder.builder()
					.id("new-user-id")
					.givenName("New")
					.surname("User")
					.mail("new@example.com")
					.build()));

			mockMvc.perform(get("/api/v1/users").param("email", "new@example.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()", is(1)))
				.andExpect(jsonPath("$.content[0].firstName", is("New")))
				.andExpect(jsonPath("$.content[0].lastName", is("User")))
				.andExpect(jsonPath("$.content[0].businessEmailAddress", is("new@example.com")));
		}

		@Test
		@DisplayName("Should filter users by userType hr-advisor")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testGetUsersFilteredByUserType() throws Exception {
			userRepository.save(UserEntity.builder()
				.firstName("HR").lastName("Advisor")
				.businessEmailAddress("hr@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			userRepository.save(UserEntity.builder()
				.firstName("Regular").lastName("Employee")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/users").param("userType", "hr-advisor"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[*].firstName", hasItem("HR")))
				.andExpect(jsonPath("$.content[*].lastName", hasItem("Advisor")))
				.andExpect(jsonPath("$.content[*].businessEmailAddress", hasItem("hr@example.com")))
				.andExpect(jsonPath("$.content[*].userType.code", hasItem("HRA")));
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void testGetUsersUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/users"))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("GET /api/v1/users/{id}")
	class GetUserById {

		@Test
		@DisplayName("Should return user for hr-advisor")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testGetUserByIdAsHrAdvisor() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Test").lastName("User")
				.businessEmailAddress("test@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/users/{id}", user.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("Test")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.businessEmailAddress", is("test@example.com")));
		}

		@Test
		@DisplayName("Should return user if owner")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testGetUserByIdAsOwner() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Current").lastName("User")
				.businessEmailAddress("current@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/users/{id}", user.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("Current")))
				.andExpect(jsonPath("$.lastName", is("User")));
		}

		@Test
		@DisplayName("Should return 403 Forbidden if not owner")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testGetUserByIdAsOtherUser() throws Exception {
			final var otherUser = userRepository.save(UserEntity.builder()
				.firstName("Other").lastName("User")
				.businessEmailAddress("other@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(get("/api/v1/users/{id}", otherUser.getId()))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should return 404 Not Found if user does not exist")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testGetUserByIdNotFound() throws Exception {
			mockMvc.perform(get("/api/v1/users/{id}", 999999L))
				.andExpect(status().isNotFound());
		}

		@Test
		@WithAnonymousUser
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		void testGetUserByIdUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/users/{id}", 1L))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("PATCH /api/v1/users/{id}")
	class UpdateUser {

		@Test
		@DisplayName("Should update user")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testUpdateUser() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Original").lastName("Name")
				.businessEmailAddress("original@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			final var updateModel = UserPatchModel.builder()
				.firstName("Updated")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("updated@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(patch("/api/v1/users/{id}", user.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("Updated")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.businessEmailAddress", is("updated@example.com")))
				.andExpect(jsonPath("$.lastModifiedDate", notNullValue()));

			final var updatedUser = userRepository.findById(user.getId()).orElseThrow();
			assertThat(updatedUser.getFirstName()).isEqualTo("Updated");
			assertThat(updatedUser.getLastName()).isEqualTo("User");
			assertThat(updatedUser.getBusinessEmailAddress()).isEqualTo("updated@example.com");
		}

		@Test
		@DisplayName("Should return 404 Not Found if user does not exist")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testUpdateUserNotFound() throws Exception {
			final var updateModel = UserPatchModel.builder()
				.firstName("Updated")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("updated@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(patch("/api/v1/users/{id}", 999999L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should allow user to update their own profile")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testUpdateUserAsSelf() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Self").lastName("User")
				.businessEmailAddress("self@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			final var updateModel = UserPatchModel.builder()
				.firstName("UpdatedSelf")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("updatedself@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(patch("/api/v1/users/{id}", user.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("UpdatedSelf")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.businessEmailAddress", is("updatedself@example.com")))
				.andExpect(jsonPath("$.lastModifiedDate", notNullValue()));

			final var updatedUser = userRepository.findById(user.getId()).orElseThrow();
			assertThat(updatedUser.getFirstName()).isEqualTo("UpdatedSelf");
			assertThat(updatedUser.getLastName()).isEqualTo("User");
			assertThat(updatedUser.getBusinessEmailAddress()).isEqualTo("updatedself@example.com");
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void testUpdateUserUnauthorized() throws Exception {
			final var updateModel = UserPatchModel.builder()
				.firstName("Updated")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("updated@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(patch("/api/v1/users/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("PUT /api/v1/users/{id}")
	class OverwriteUser {

		@Test
		@DisplayName("Should overwrite user")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testOverwriteUser() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Original").lastName("Name")
				.businessEmailAddress("original@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			final var updateModel = UserPatchModel.builder()
				.firstName("Overwritten")
				.middleName("Middle")
				.lastName("User")
				.initials("OMU")
				.personalRecordIdentifier("12345")
				.businessPhone("555-123-4567")
				.businessEmail("overwritten@example.com")
				.languageId(1L)
				.build();

			mockMvc.perform(put("/api/v1/users/{id}", user.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("Overwritten")))
				.andExpect(jsonPath("$.middleName", is("Middle")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.initial", is("OMU")))
				.andExpect(jsonPath("$.personalRecordIdentifier", is("12345")))
				.andExpect(jsonPath("$.businessPhoneNumber", is("555-123-4567")))
				.andExpect(jsonPath("$.businessEmailAddress", is("overwritten@example.com")))
				.andExpect(jsonPath("$.lastModifiedDate", notNullValue()));

			final var updatedUser = userRepository.findById(user.getId()).orElseThrow();
			assertThat(updatedUser.getFirstName()).isEqualTo("Overwritten");
			assertThat(updatedUser.getMiddleName()).isEqualTo("Middle");
			assertThat(updatedUser.getLastName()).isEqualTo("User");
			assertThat(updatedUser.getInitial()).isEqualTo("OMU");
			assertThat(updatedUser.getPersonalRecordIdentifier()).isEqualTo("12345");
			assertThat(updatedUser.getBusinessPhoneNumber()).isEqualTo("555-123-4567");
			assertThat(updatedUser.getBusinessEmailAddress()).isEqualTo("overwritten@example.com");
		}

		@Test
		@DisplayName("Should return 404 Not Found if user does not exist")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testOverwriteUserNotFound() throws Exception {
			final var updateModel = UserPatchModel.builder()
				.firstName("Overwritten")
				.middleName("Middle")
				.lastName("User")
				.initials("OMU")
				.personalRecordIdentifier("12345")
				.businessPhone("555-123-4567")
				.businessEmail("overwritten@example.com")
				.languageId(1L)
				.build();

			mockMvc.perform(put("/api/v1/users/{id}", 999999L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should allow user to update their own profile")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testUpdateUserAsSelf() throws Exception {
			final var user = userRepository.save(UserEntity.builder()
				.firstName("Self").lastName("User")
				.businessEmailAddress("self@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			final var updateModel = UserPatchModel.builder()
				.firstName("UpdatedSelf")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("updatedself@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(patch("/api/v1/users/{id}", user.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id", is(user.getId().intValue())))
				.andExpect(jsonPath("$.firstName", is("UpdatedSelf")))
				.andExpect(jsonPath("$.lastName", is("User")))
				.andExpect(jsonPath("$.businessEmailAddress", is("updatedself@example.com")))
				.andExpect(jsonPath("$.lastModifiedDate", notNullValue()));

			final var updatedUser = userRepository.findById(user.getId()).orElseThrow();
			assertThat(updatedUser.getFirstName()).isEqualTo("UpdatedSelf");
			assertThat(updatedUser.getLastName()).isEqualTo("User");
			assertThat(updatedUser.getBusinessEmailAddress()).isEqualTo("updatedself@example.com");
		}

		@Test
		@DisplayName("Should return 403 Forbidden when user lacks UPDATE permission")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testOverwriteUserForbidden() throws Exception {
			final var otherUser = userRepository.save(UserEntity.builder()
				.firstName("Other").lastName("User")
				.businessEmailAddress("other@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			final var updateModel = UserPatchModel.builder()
				.firstName("Overwritten")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("overwritten@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(put("/api/v1/users/{id}", otherUser.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void testOverwriteUserUnauthorized() throws Exception {
			final var updateModel = UserPatchModel.builder()
				.firstName("Overwritten")
				.middleName(null)
				.lastName("User")
				.initials(null)
				.personalRecordIdentifier(null)
				.businessPhone(null)
				.businessEmail("overwritten@example.com")
				.languageId(null)
				.build();

			mockMvc.perform(put("/api/v1/users/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updateModel)))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("POST /api/v1/users/{id}/profiles")
	class CreateProfileForUser {

		@Test
		@DisplayName("Should create and return profile for user as hr-advisor")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testCreateProfileAsHrAdvisor() throws Exception {
			final var hrAdvisor = userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

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
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testCreateProfileConflict() throws Exception {
			final var hrAdvisor = userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			final var employee = userRepository.save(UserEntity.builder()
				.firstName("Employee").lastName("User")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("99999999-9999-9999-9999-999999999999")
				.userType(userTypeRepository.findByCode("employee").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

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
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testCreateProfileHRAConflict() throws Exception {
			final var hrAdvisor = userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/users/{id}/profiles", hrAdvisor.getId()))
				.andExpect(status().isConflict());
		}

		@Test
		@DisplayName("Should return 404 Not Found if user does not exist")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "hr-advisor" })
		void testCreateProfileForNonExistentUser() throws Exception {
			userRepository.save(UserEntity.builder()
				.firstName("HR Advisor").lastName("User")
				.businessEmailAddress("hr-advisor@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
				.userType(userTypeRepository.findByCode("HRA").orElseThrow())
				.language(languageRepository.getReferenceById(1L))
				.build());

			mockMvc.perform(post("/api/v1/users/{id}/profiles", 31415926))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 403 Forbidden for regular user trying to create for another user")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testCreateProfileForbidden() throws Exception {
			mockMvc.perform(post("/api/v1/users/{id}/profiles", 16180339))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should allow user to create their own profile")
		@WithMockUser(username = "01010101-0101-0101-0101-010101010101", authorities = { "employee" })
		void testCreateProfileForSelf() throws Exception {
			final var employee = userRepository.save(UserEntity.builder()
				.firstName("Employee").lastName("User")
				.businessEmailAddress("employee@example.com")
				.microsoftEntraId("01010101-0101-0101-0101-010101010101")
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
