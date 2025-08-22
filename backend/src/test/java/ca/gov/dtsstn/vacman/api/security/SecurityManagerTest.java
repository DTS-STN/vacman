package ca.gov.dtsstn.vacman.api.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;

@ExtendWith({ MockitoExtension.class })
class SecurityManagerTest {

	@InjectMocks
	SecurityManager securityManager;

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
