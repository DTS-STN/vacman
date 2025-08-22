package ca.gov.dtsstn.vacman.api.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;

/**
 * Provides server-side security checks for access to various resources.
 * <p>
 * NOTE: all security check failures throw exceptions rather than returning
 * {@code false}, ensuring that server-side logging is performed by Spring
 * Security and that unauthorized access attempts are explicitly recorded.
 */
@Component(SecurityManager.NAME)
public class SecurityManager {

	private static final Logger log = LoggerFactory.getLogger(SecurityManager.class);

	/**
	 * The Spring bean name for this component, so it can
	 * be easily referenced in {@code @DependsOn} annotations.
	 */
	public static final String NAME = "securityManager";

	/**
	 * Validates that the provided profile status code is either
	 * {@code approved} or {@code archived}.
	 * <p>
	 * This is used to enforce server-side restrictions on allowed profile status
	 * transitions. If the code is invalid, an {@link AccessDeniedException} is thrown.
	 *
	 * @param code the profile status code to validate
	 * @return {@code true} if the code is approved or archived
	 * @throws AccessDeniedException if the code is not approved or archived
	 */
	public boolean targetProfileStatusIsApprovalOrArchived(String code) {
		if (!AppConstants.ProfileStatusCodes.APPROVED.equals(code) && !AppConstants.ProfileStatusCodes.ARCHIVED.equals(code)) {
			log.error("Access denied: Profile status can only be set to 'approved' or 'archived'");
			return false;
		}

		return true;
	}

	/**
	 * Validates that the provided profile status code is {@code pending}.
	 * <p>
	 * This is used to enforce server-side restrictions on allowed profile status
	 * transitions. If the code is invalid, an {@link AccessDeniedException} is thrown.
	 *
	 * @param code the profile status code to validate
	 * @return {@code true} if the code is pending
	 * @throws AccessDeniedException if the code is not pending
	 */
	public boolean targetProfileStatusIsPending(String code) {
		if (!AppConstants.ProfileStatusCodes.PENDING.equals(code)) {
			log.error("Access denied: Profile status can only be set to 'pending'");
			return false;
		}

		return true;
	}

}
