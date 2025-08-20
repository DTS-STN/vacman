package ca.gov.dtsstn.vacman.api.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;

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

	private final ProfileService profileService;

	private final UserService userService;

	public SecurityManager(ProfileService profileService, UserService userService) {
		this.profileService = profileService;
		this.userService = userService;
	}

	/**
	 * Checks whether the currently authenticated user can access the specified profile resource.
	 * <p>
	 * This method compares the Microsoft Entra ID of the authenticated user with
	 * the Entra ID associated with the profile. If they do not match, an
	 * {@link AccessDeniedException} is thrown.
	 *
	 * @param id the ID of the profile to check
	 * @return {@code true} if the authenticated user can access the profile
	 * @throws UnauthorizedException if no Entra ID is found in the current security context
	 * @throws AccessDeniedException if the profile does not exist or the IDs do not match
	 */
	public boolean canAccessProfile(long id) {
		final var currentEntraId = SecurityUtils.getCurrentUserEntraId();

		if (currentEntraId.isEmpty()) {
			log.error("Access denied: Entra ID not found in security context");
			return false;
		}

		final var profileEntraId = profileService.getProfile(id)
			.map(ProfileEntity::getUser)
			.map(UserEntity::getMicrosoftEntraId);

		if (profileEntraId.isEmpty()) {
			log.error("Access denied: Profile with id=[" + id + "] not found");
			return false;
		}

		if (!currentEntraId.get().equals(profileEntraId.get())) {
			log.error("Access denied: Current user's entraId [" + currentEntraId.get() + "] does not match target profile's entraId [" + profileEntraId.get() + "]");
			return false;
		}

		return true;
	}

	/**
	 * Checks whether the currently authenticated user can access the specified user resource.
	 * <p>
	 * This method compares the Microsoft Entra ID of the authenticated user with
	 * the Entra ID of the target user. If they do not match, an
	 * {@link AccessDeniedException} is thrown.
	 *
	 * @param id the ID of the user to check
	 * @return {@code true} if the authenticated user can access the user
	 * @throws UnauthorizedException if no Entra ID is found in the current security context
	 * @throws AccessDeniedException if the user does not exist or the IDs do not match
	 */
	public boolean canAccessUser(long id) {
		final var currentEntraId = SecurityUtils.getCurrentUserEntraId();

		if (currentEntraId.isEmpty()) {
			log.error("Access denied: Entra ID not found in security context");
			return false;
		}

		final var userEntraId = userService.getUserById(id)
			.map(UserEntity::getMicrosoftEntraId);

		if (userEntraId.isEmpty()) {
			log.error("Access denied: User with id=[" + id + "] not found");
			return false;
		}

		if (!currentEntraId.get().equals(userEntraId.get())) {
			log.error("Current user's entraId [" + currentEntraId.get() + "] does not match target user's entraId [" + userEntraId.get() + "]");
			return false;
		}

		return true;
}

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
