package ca.gov.dtsstn.vacman.api.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;

@ExtendWith({ MockitoExtension.class })
class SecurityManagerTest {

	@Mock
	ProfileService profileService;

	@Mock
	UserService userService;

	@InjectMocks
	SecurityManager securityManager;

	@Nested
	@DisplayName("canAccessProfile tests")
	class CanAccessProfileTests {

		@Test
		void testCanAccessProfileSuccess() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(profileService.getProfile(1L))
					.thenReturn(Optional.of(new ProfileEntityBuilder()
						.user(new UserEntityBuilder()
							.microsoftEntraId("00000000-0000-0000-0000-000000000000")
							.build())
						.build()));

				assertTrue(securityManager.canAccessProfile(1L));
			}
		}

		@Test
		void testCanAccessProfileUnauthorized() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.empty());

				assertThrows(UnauthorizedException.class, () -> securityManager.canAccessProfile(1L));
			}
		}

		@Test
		void testCanAccessProfileNotFound() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(profileService.getProfile(1L))
					.thenReturn(Optional.empty());

				assertThrows(AccessDeniedException.class, () -> securityManager.canAccessProfile(1L));
			}
		}

		@Test
		void testCanAccessProfileMismatch() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(profileService.getProfile(1L))
					.thenReturn(Optional.of(new ProfileEntityBuilder()
						.user(new UserEntityBuilder()
							.microsoftEntraId("11111111-2222-3333-4444-555555555555")
							.build())
						.build()));

				final var exception = assertThrows(AccessDeniedException.class, () -> securityManager.canAccessProfile(1L));
				assertEquals("Current user's entraId [00000000-0000-0000-0000-000000000000] does not match target profile's entraId [11111111-2222-3333-4444-555555555555]", exception.getMessage());
			}
		}

	}

	@Nested
	@DisplayName("canAccessUser tests")
	class CanAccessUserTests {

		@Test
		void testCanAccessUserSuccess() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(userService.getUserById(1L))
					.thenReturn(Optional.of(new UserEntityBuilder()
						.microsoftEntraId("00000000-0000-0000-0000-000000000000")
						.build()));

				assertTrue(securityManager.canAccessUser(1L));
			}
		}

		@Test
		void testCanAccessUserUnauthorized() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.empty());

				assertThrows(UnauthorizedException.class, () -> securityManager.canAccessUser(1L));
			}
		}

		@Test
		void testCanAccessUserNotFound() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(userService.getUserById(1L))
					.thenReturn(Optional.empty());

				assertThrows(AccessDeniedException.class, () -> securityManager.canAccessUser(1L));
			}
		}

		@Test
		void testCanAccessUserMismatch() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(userService.getUserById(1L))
					.thenReturn(Optional.of(new UserEntityBuilder()
						.microsoftEntraId("11111111-2222-3333-4444-555555555555")
						.build()));

				final var exception = assertThrows(AccessDeniedException.class, () -> securityManager.canAccessUser(1L));
				assertEquals("Current user's entraId [00000000-0000-0000-0000-000000000000] does not match target user's entraId [11111111-2222-3333-4444-555555555555]", exception.getMessage());
			}
		}

	}

	@Nested
	@DisplayName("targetProfileStatusIsApprovalOrArchived tests")
	class TargetProfileStatusIsApprovalOrArchivedTests {

		@Test
		void testApprovedStatus() {
			assertTrue(securityManager.targetProfileStatusIsApprovalOrArchived(AppConstants.ProfileStatusCodes.APPROVED));
		}

		@Test
		void testArchivedStatus() {
			assertTrue(securityManager.targetProfileStatusIsApprovalOrArchived(AppConstants.ProfileStatusCodes.ARCHIVED));
		}

		@Test
		void testInvalidStatus() {
			final var exception = assertThrows(AccessDeniedException.class, () -> securityManager.targetProfileStatusIsApprovalOrArchived("INVALID_STATUS"));
			assertEquals("Profile status can only be set to 'approved' or 'archived", exception.getMessage());
		}

	}

	@Nested
	@DisplayName("targetProfileStatusIsPending tests")
	class TargetProfileStatusIsPendingTests {

		@Test
		void testPendingStatus() {
			assertTrue(securityManager.targetProfileStatusIsPending(AppConstants.ProfileStatusCodes.PENDING));
		}

		@Test
		void testInvalidStatus() {
			final var exception = assertThrows(AccessDeniedException.class, () -> securityManager.targetProfileStatusIsPending("INVALID_STATUS"));
			assertEquals("Profile status can only be set to 'pending'", exception.getMessage());
		}

	}

}
