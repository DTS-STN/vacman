package ca.gov.dtsstn.vacman.api.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
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

import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;

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

				assertFalse(securityManager.canAccessProfile(1L));
			}
		}

		@Test
		void testCanAccessProfileNotFound() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(profileService.getProfile(1L))
					.thenReturn(Optional.empty());

				assertFalse(securityManager.canAccessProfile(1L));
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

				assertFalse(securityManager.canAccessProfile(1L));
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

				assertFalse(securityManager.canAccessUser(1L));
			}
		}

		@Test
		void testCanAccessUserNotFound() {
			try (final var securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
				securityUtils.when(SecurityUtils::getCurrentUserEntraId)
					.thenReturn(Optional.of("00000000-0000-0000-0000-000000000000"));

				when(userService.getUserById(1L))
					.thenReturn(Optional.empty());

				assertFalse(securityManager.canAccessUser(1L));
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

				assertFalse(securityManager.canAccessUser(1L));
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
			assertFalse(securityManager.targetProfileStatusIsApprovalOrArchived("INVALID_STATUS"));
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
			assertFalse(securityManager.targetProfileStatusIsPending("INVALID_STATUS"));
		}

	}

}
