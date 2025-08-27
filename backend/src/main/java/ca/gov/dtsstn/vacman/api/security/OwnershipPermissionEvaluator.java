package ca.gov.dtsstn.vacman.api.security;

import java.io.Serializable;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.ClassUtils;

import ca.gov.dtsstn.vacman.api.data.entity.AbstractBaseEntity;
import ca.gov.dtsstn.vacman.api.data.entity.Ownable;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.service.ProfileService;
import ca.gov.dtsstn.vacman.api.service.RequestService;
import ca.gov.dtsstn.vacman.api.service.UserService;

/**
 * A custom permission evaluator that checks if the current user is the owner of a given domain object.
 * This is used in conjunction with Spring Security's @PreAuthorize and @PostAuthorize annotations.
 * <p>
 * It primarily evaluates permissions based on the target object's ID and type.
 */
@Component
public class OwnershipPermissionEvaluator implements PermissionEvaluator {

	private static final Logger log = LoggerFactory.getLogger(OwnershipPermissionEvaluator.class);

	private final ProfileService profileService;

	private final RequestService requestService;

	private final UserService userService;

	public OwnershipPermissionEvaluator(ProfileService profileService, RequestService requestService, UserService userService) {
		this.profileService = profileService;
		this.requestService = requestService;
		this.userService = userService;
	}

	/**
	 * This implementation is not supported as we favor checking permissions before the object is fetched,
	 * using {@link #hasPermission(Authentication, Serializable, String, Object)}.
	 */
	@Override
	public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
		throw new UnsupportedOperationException("ID based permission evaluation is required. Use hasPermission(Authentication, Serializable, String, Object).");
	}

	/**
	 * Determines if a user has a given permission for a target resource, identified by its id and type.
	 * The primary check is to verify if the authenticated user is the owner of the target entity.
	 */
	@Override
	public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
		final var currentUserId = userService.getUserByMicrosoftEntraId(authentication.getName()).map(UserEntity::getId);

		if (currentUserId.isEmpty()) {
			log.warn("Access denied: user not found; permission=[{}], targetType=[{}], targetId=[{}]", permission, targetType, targetId);
			return false;
		}

		// Special case for 'READ' permission on 'REQUEST' type since "owner" in this case is one of:
		// - submitter
		// - hiring manager
		// - sub-delegated manager
		if ("READ".equals(permission.toString()) && "REQUEST".equalsIgnoreCase(targetType)) {
			boolean isAssociated = requestService.isUserAssociatedWithRequest((Long) targetId, currentUserId.get());

			if (!isAssociated) {
				log.warn("Access denied: user is not associated with request; targetId=[{}], currentUserId=[{}]", targetId, currentUserId.get());
			}

			return isAssociated;
		}

		final var targetResource = getTargetResource((Long) targetId, targetType);

		if (targetResource.isEmpty()) {
			log.warn("Access denied: resource does not exist; permission=[{}], targetType=[{}], targetId=[{}], currentUserId=[{}]", permission, targetType, targetId, currentUserId.get());
			return false;
		}

		if (ClassUtils.isAssignableValue(Ownable.class, targetResource.get())) {
			final var ownable = (Ownable) targetResource.get();
			final var owner = ownable.getOwnerId();

			if (owner == null) {
				log.warn("Access denied: resource does not have an owner; permission=[{}], targetType=[{}], targetId=[{}], currentUserId=[{}]", permission, targetType, targetId, currentUserId.get());
				return false;
			}

			final var isOwner = currentUserId.map(owner::equals).orElse(false);

			if (isOwner) {
				//
				// currently, ownership grants all permissions
				// (this switch is a placeholder for future checks)
				//
				return switch (permission) {
					default -> true;
				};
			}
		}

		log.warn("Access denied: permission=[{}], targetType=[{}], targetId=[{}], currentUserId=[{}]", permission, targetType, targetId, currentUserId.get());
		return false;
	}

	private Optional<? extends AbstractBaseEntity> getTargetResource(Long id, String type) {
		return switch (type.toUpperCase()) {
			case "PROFILE" -> profileService.getProfileById(id);
			case "REQUEST" -> requestService.getRequestById(id);
			case "USER" -> userService.getUserById(id);
			default -> throw new IllegalArgumentException("Unsupported targetType: " + type);
		};
	}

}
