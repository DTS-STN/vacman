package ca.gov.dtsstn.vacman.api.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;

@Component(SecurityManager.NAME)
public class SecurityManager {

	public static final String NAME = "securityManager";

	private final ProfileService profileService;

	private final UserService userService;

	public SecurityManager(ProfileService profileService, UserService userService) {
		this.profileService = profileService;
		this.userService = userService;
	}

	public boolean canAccessProfile(long id) {
		final var currentEntraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

		final var profileEntraId = profileService.getProfile(id)
			.map(ProfileEntity::getUser)
			.map(UserEntity::getMicrosoftEntraId)
			.orElseThrow(() -> new AccessDeniedException("Profile with id=[" + id + "] not found"));

		if (!currentEntraId.equals(profileEntraId)) {
			throw new AccessDeniedException("Current user's entraId [" + currentEntraId + "] does not match target profile's entraId [" + profileEntraId + "]");
		}

		return true;
	}

	public boolean canAccessUser(long id) {
		final var currentEntraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

		final var userEntraId = userService.getUserById(id)
			.map(UserEntity::getMicrosoftEntraId)
			.orElseThrow(() -> new AccessDeniedException("User with id=[" + id + "] not found"));

		if (!currentEntraId.equals(userEntraId)) {
			throw new AccessDeniedException("Current user's entraId [" + currentEntraId + "] does not match target user's entraId [" + userEntraId + "]");
		}

		return true;
}

	public boolean targetProfileStatusIsApprovalOrArchived(String code) {
		if (!AppConstants.ProfileStatusCodes.APPROVED.equals(code) && !AppConstants.ProfileStatusCodes.ARCHIVED.equals(code)) {
			throw new AccessDeniedException("Profile status can only be set to 'approved' or 'archived");
		}

		return true;
	}

	public boolean targetProfileStatusIsPending(String code) {
		if (!AppConstants.ProfileStatusCodes.PENDING.equals(code)) {
			throw new AccessDeniedException("Profile status can only be set to 'pending'");
		}

		return true;
	}

}
