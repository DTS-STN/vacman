package ca.gov.dtsstn.vacman.api.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.model.ProfilePutModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileStatusUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;

@Transactional
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({ "test" })
@DisplayName("ProfilesController API endpoints")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class ProfilesControllerTest {

	final ProfileModelMapper profileModelMapper = Mappers.getMapper(ProfileModelMapper.class);

	@Autowired
	MockMvc mockMvc;

	@Autowired
	ObjectMapper objectMapper;

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	ProfileRepository profileRepository;

	@Autowired
	ProfileStatusRepository profileStatusRepository;

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@Autowired
	LookupCodes lookupCodes;

	@MockitoBean
	ProfileService profileService;

	@MockitoBean
	UserService userService;

	UserEntity hrAdvisor;

	UserEntity employee;

	ProfileEntity profile;

	@BeforeEach
	void setUp() {
		this.hrAdvisor = userRepository.save(UserEntity.builder()
			.firstName("HR").lastName("Advisor")
			.businessEmailAddress("hr.advisor@example.com")
			.microsoftEntraId("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
			.userType(userTypeRepository.findByCode(lookupCodes.userTypes().hrAdvisor()).orElseThrow())
			.language(languageRepository.getReferenceById(1L))
			.build());

		this.employee = userRepository.save(UserEntity.builder()
			.firstName("Test").lastName("Employee")
			.businessEmailAddress("employee@example.com")
			.microsoftEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
			.userType(userTypeRepository.findByCode(lookupCodes.userTypes().employee()).orElseThrow())
			.language(languageRepository.getReferenceById(1L))
			.build());

		this.profile = profileRepository.save(ProfileEntity.builder()
			.user(employee)
			.profileStatus(profileStatusRepository.findByCode(lookupCodes.profileStatuses().incomplete()).orElseThrow())
			.createdBy("TestUser")
			.createdDate(Instant.EPOCH)
			.lastModifiedBy("TestUser")
			.lastModifiedDate(Instant.EPOCH)
			.build());
	}

	@Nested
	@DisplayName("GET /api/v1/profiles")
	class GetProfiles {

		@Test
		@DisplayName("Should return 200 OK with a page of profiles")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void getProfiles_shouldReturnOk() throws Exception {
			final var profile = ProfileEntity.builder().id(1L).build();

			when(profileService.findProfiles(any(), any())).thenReturn(new PageImpl<>(List.of(profile)));

			mockMvc.perform(get("/api/v1/profiles"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)))
				.andExpect(jsonPath("$.content[0].id").value(1L));
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void getProfiles_shouldReturnUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/profiles"))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when user lacks hr-advisor authority")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void getProfiles_shouldReturnForbidden() throws Exception {
			mockMvc.perform(get("/api/v1/profiles"))
				.andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("GET /api/v1/profiles/me")
	class GetProfileMe {

		@Test
		@DisplayName("Should return 200 OK with profiles for current user")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void getProfileMe_shouldReturnOk() throws Exception {
			final var profile = ProfileEntity.builder().id(1L).build();

			when(profileService.getProfilesByEntraId(eq("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), any())).thenReturn(List.of(profile));

			mockMvc.perform(get("/api/v1/profiles/me"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)))
				.andExpect(jsonPath("$.content[0].id").value(1L));
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void getProfileMe_shouldReturnUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/profiles/me"))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("GET /api/v1/profiles/{id}")
	class GetProfileById {

		@Test
		@DisplayName("Should return 200 OK with profile by ID")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void getProfileById_shouldReturnOk() throws Exception {
			final var profile = ProfileEntity.builder().id(1L).build();

			when(profileService.getProfileById(1L)).thenReturn(Optional.of(profile));

			mockMvc.perform(get("/api/v1/profiles/{id}", 1L))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1L));
		}

		@Test
		@DisplayName("Should return 404 Not Found when profile does not exist")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void getProfileById_shouldReturnNotFound() throws Exception {
			when(profileService.getProfileById(1L)).thenReturn(Optional.empty());

			mockMvc.perform(get("/api/v1/profiles/{id}", 1L))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void getProfileById_shouldReturnUnauthorized() throws Exception {
			mockMvc.perform(get("/api/v1/profiles/{id}", 1L))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when user lacks permission")
		@WithMockUser(username = "cccccccc-cccc-cccc-cccc-cccccccccccc", authorities = { "employee" })
		void getProfileById_shouldReturnForbidden() throws Exception {
			mockMvc.perform(get("/api/v1/profiles/{id}", 1L))
				.andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("POST /api/v1/profiles/me")
	class CreateCurrentUserProfile {

		@Test
		@DisplayName("Should create and return profile for current user")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void createCurrentUserProfile_shouldReturnOk() throws Exception {
			final var profile = ProfileEntity.builder().id(1L).build();

			when(userService.getUserByMicrosoftEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")).thenReturn(Optional.of(employee));
			when(profileService.getProfilesByEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", true)).thenReturn(List.of());
			when(profileService.createProfile(any())).thenReturn(profile);

			mockMvc.perform(post("/api/v1/profiles/me"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1L));
		}

		@Test
		@DisplayName("Should return 409 Conflict if user has active profile")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void createCurrentUserProfile_shouldReturnConflict() throws Exception {
			when(userService.getUserByMicrosoftEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")).thenReturn(Optional.of(employee));
			when(profileService.getProfilesByEntraId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", true)).thenReturn(List.of(profile));

			mockMvc.perform(post("/api/v1/profiles/me"))
				.andExpect(status().isConflict());
		}

		@Test
		@WithAnonymousUser
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		void createCurrentUserProfile_shouldReturnUnauthorized() throws Exception {
			mockMvc.perform(post("/api/v1/profiles/me"))
				.andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("PUT /api/v1/profiles/{id}")
	class UpdateProfileById {

		@Test
		@DisplayName("Should update and return profile")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void updateProfileById_shouldReturnOk() throws Exception {
			final var updatedEntity = ProfileEntity.builder().id(1L).build();
			final var updatedProfile = ProfilePutModel.builder().build();

			when(profileService.getProfileById(1L)).thenReturn(Optional.of(profile));
			when(profileService.updateProfile(any(), any())).thenReturn(updatedEntity);

			mockMvc.perform(put("/api/v1/profiles/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updatedProfile)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1L));
		}

		@Test
		@DisplayName("Should return 404 Not Found when profile does not exist")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void updateProfileById_shouldReturnNotFound() throws Exception {
			final var updatedProfile = ProfilePutModel.builder().build();

			when(profileService.getProfileById(1L)).thenReturn(Optional.empty());

			mockMvc.perform(put("/api/v1/profiles/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updatedProfile)))
				.andExpect(status().isNotFound());
		}

		@Test
		@WithAnonymousUser
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		void updateProfileById_shouldReturnUnauthorized() throws Exception {
			final var updatedProfile = ProfilePutModel.builder().build();

			mockMvc.perform(put("/api/v1/profiles/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updatedProfile)))
				.andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when user lacks permission")
		@WithMockUser(username = "cccccccc-cccc-cccc-cccc-cccccccccccc", authorities = { "employee" })
		void updateProfileById_shouldReturnForbidden() throws Exception {
			final var updatedProfile = ProfilePutModel.builder().build();

			mockMvc.perform(put("/api/v1/profiles/{id}", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(updatedProfile)))
				.andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("PUT /api/v1/profiles/{id}/status")
	class UpdateProfileStatusById {

		@Test
		@DisplayName("Should update profile status")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void updateProfileStatusById_shouldReturnAccepted() throws Exception {
			final var statusUpdate = ProfileStatusUpdateModel.builder().code("APPROVED").build();

			when(profileService.getProfileById(1L)).thenReturn(Optional.of(profile));

			mockMvc.perform(put("/api/v1/profiles/{id}/status", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isAccepted());
		}

		@Test
		@DisplayName("Should return 404 Not Found when profile does not exist")
		@WithMockUser(username = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", authorities = { "hr-advisor" })
		void updateProfileStatusById_shouldReturnNotFound() throws Exception {
			final var statusUpdate = ProfileStatusUpdateModel.builder().code("APPROVED").build();

			when(profileService.getProfileById(1L)).thenReturn(Optional.empty());

			mockMvc.perform(put("/api/v1/profiles/{id}/status", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Should return 403 Forbidden when non-HR tries to set approved")
		@WithMockUser(username = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", authorities = { "employee" })
		void updateProfileStatusById_shouldReturnForbiddenForNonHr() throws Exception {
			final var statusUpdate = ProfileStatusUpdateModel.builder().code("APPROVED").build();

			when(profileService.getProfileById(1L)).thenReturn(Optional.of(profile));

			mockMvc.perform(put("/api/v1/profiles/{id}/status", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Should return 401 Unauthorized when not authenticated")
		@WithAnonymousUser
		void updateProfileStatusById_shouldReturnUnauthorized() throws Exception {
			final var statusUpdate = ProfileStatusUpdateModel.builder().code("PENDING").build();

			mockMvc.perform(put("/api/v1/profiles/{id}/status", 1L)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(statusUpdate)))
				.andExpect(status().isUnauthorized());
		}

	}

}