package ca.gov.dtsstn.vacman.api.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.UserService;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;

@Component
public class SecurityManager {

	private final ProfileService profileService;

	private final UserService userService;

	public SecurityManager(ProfileService profileService, UserService userService) {
		this.profileService = profileService;
		this.userService = userService;
	}

	public boolean canAccessProfile(long id) {
		final var currentEntraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

		return profileService.getProfile(id)
			.map(ProfileEntity::getUser)
			.map(UserEntity::getMicrosoftEntraId)
			.map(currentEntraId::equals)
			.orElseThrow(() -> new AccessDeniedException("Profile with id=[" + id + "] not found"));
	}

	public boolean canAccessUser(long id) {
		final var currentEntraId = SecurityUtils.getCurrentUserEntraId()
			.orElseThrow(() -> new UnauthorizedException("Entra ID not found in security context"));

		return userService.getUserById(id)
			.map(UserEntity::getMicrosoftEntraId)
			.map(currentEntraId::equals)
			.orElseThrow(() -> new AccessDeniedException("User with id=[" + id + "] not found"));
	}

}
