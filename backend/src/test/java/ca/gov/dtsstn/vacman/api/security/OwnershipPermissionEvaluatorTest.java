package ca.gov.dtsstn.vacman.api.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;

@ExtendWith({ MockitoExtension.class })
class OwnershipPermissionEvaluatorTest {

	static final Long OWNER_USER_ID = 1L;

	static final Long OTHER_USER_ID = 2L;

	static final Long RESOURCE_ID = 1_000_000L;

	static final String OWNER_PRINCIPAL_ID = "00000000-0000-0000-0000-000000000000";

	static final String NON_OWNER_PRINCIPAL_ID = "11111111-1111-1111-1111-111111111111";

	@Mock
	UserService userService;

	@Mock
	ProfileService profileService;

	@Mock
	Authentication authentication;

	@InjectMocks
	OwnershipPermissionEvaluator permissionEvaluator;

	final UserEntity ownerUser = UserEntity.builder()
		.id(OWNER_USER_ID)
		.microsoftEntraId(OWNER_PRINCIPAL_ID)
		.build();

	final UserEntity otherUser = UserEntity.builder()
		.id(OTHER_USER_ID)
		.microsoftEntraId(NON_OWNER_PRINCIPAL_ID)
		.build();

	@Nested
	@DisplayName("hasPermission with ID, Type, and Permission")
	class HasPermissionByIdAndType {

		@Test
		@DisplayName("Should return TRUE when user is the owner of a USER resource")
		void hasPermission_UserIsOwnerOfUserResource_ShouldReturnTrue() {
			when(authentication.getName()).thenReturn(OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(ownerUser));
			when(userService.getUserById(RESOURCE_ID)).thenReturn(Optional.of(ownerUser));

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "USER", "UPDATE")).isTrue();
		}

		@Test
		@DisplayName("Should return TRUE when user is the owner of a PROFILE resource")
		void hasPermission_UserIsOwnerOfProfileResource_ShouldReturnTrue() {
			final var profile = ProfileEntity.builder()
				.id(RESOURCE_ID)
				.user(ownerUser)
				.build();

			when(authentication.getName()).thenReturn(OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(ownerUser));
			when(profileService.getProfileById(RESOURCE_ID)).thenReturn(Optional.of(profile));

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "PROFILE", "READ")).isTrue();
		}

		@Test
		@DisplayName("Should return TRUE for case-insensitive target type")
		void hasPermission_WithLowercaseTargetType_ShouldReturnTrue() {
			when(authentication.getName()).thenReturn(OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(ownerUser));
			when(userService.getUserById(RESOURCE_ID)).thenReturn(Optional.of(ownerUser));

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "user", "ANYTHING")).isTrue();
		}

		@Test
		@DisplayName("Should return FALSE when current user cannot be found")
		void hasPermission_CurrentUserNotFound_ShouldReturnFalse() {
			when(authentication.getName()).thenReturn("unknown-principal-id");
			when(userService.getUserByMicrosoftEntraId("unknown-principal-id")).thenReturn(Optional.empty());

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "USER", "READ")).isFalse();
		}

		@Test
		@DisplayName("Should return FALSE when target resource does not exist")
		void hasPermission_TargetResourceNotFound_ShouldReturnFalse() {
			when(authentication.getName()).thenReturn(OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(ownerUser));
			when(userService.getUserById(RESOURCE_ID)).thenReturn(Optional.empty());

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "USER", "READ")).isFalse();
		}

		@Test
		@DisplayName("Should return FALSE when user is not the owner of the resource")
		void hasPermission_UserIsNotOwnerOfResource_ShouldReturnFalse() {
			when(authentication.getName()).thenReturn(NON_OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(NON_OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(otherUser));
			when(userService.getUserById(RESOURCE_ID)).thenReturn(Optional.of(ownerUser));

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "USER", "UPDATE")).isFalse();
		}

		@Test
		@DisplayName("Should return FALSE when the target resource has no owner")
		void hasPermission_ResourceHasNoOwner_ShouldReturnFalse() {
			final var profileWithoutOwner = ProfileEntity.builder()
				.id(RESOURCE_ID)
				.user(null) // explicitly no owner
				.build();

			when(authentication.getName()).thenReturn(OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(ownerUser));
			when(profileService.getProfileById(RESOURCE_ID)).thenReturn(Optional.of(profileWithoutOwner));

			assertThat(permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "PROFILE", "READ")).isFalse();
		}

		@Test
		@DisplayName("Should throw IllegalArgumentException for an unsupported target type")
		void hasPermission_WithUnsupportedTargetType_ShouldThrowException() {
			when(authentication.getName()).thenReturn(OWNER_PRINCIPAL_ID);
			when(userService.getUserByMicrosoftEntraId(OWNER_PRINCIPAL_ID)).thenReturn(Optional.of(ownerUser));

			assertThatThrownBy(() -> permissionEvaluator.hasPermission(authentication, RESOURCE_ID, "ARCHIVE", "READ"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessage("Unsupported targetType: ARCHIVE");
		}

	}

	@Nested
	@DisplayName("hasPermission with Object target")
	class HasPermissionByObject {

		@Test
		@DisplayName("Should throw UnsupportedOperationException")
		void hasPermission_WithObjectTarget_ShouldThrowException() {
			assertThatThrownBy(() -> permissionEvaluator.hasPermission(authentication, new Object(), "READ"))
				.isInstanceOf(UnsupportedOperationException.class)
				.hasMessage("ID based permission evaluation is required. Use hasPermission(Authentication, Serializable, String, Object).");
		}

	}

}