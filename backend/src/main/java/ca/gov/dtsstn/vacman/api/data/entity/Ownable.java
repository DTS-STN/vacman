package ca.gov.dtsstn.vacman.api.data.entity;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

/**
 * Represents an entity that has a single owner and potentially multiple delegates.
 * <p>
 * Implement this interface on any entity or resource that should be subject to
 * ownership-based security checks. Security frameworks (such as a custom
 * {@link org.springframework.security.access.PermissionEvaluator}) can use this
 * interface to determine whether the currently authenticated user has permission
 * to perform certain actions on the resource.
 */
public interface Ownable {

	/**
	 * Returns the ID of the primary owner of this entity.
	 */
	Optional<Long> getOwnerId();

	/**
	 * Returns a set of user IDs that are effectively owners for certain operations.
	 */
	default Set<Long> getDelegateIds() {
		return Collections.emptySet();
	}

	/**
	 * Checks if the given user ID is the owner of this entity.
	 * 
	 * @param userId The user ID to check
	 * @return true if the user is the owner, false otherwise
	 */
	default boolean isOwnedBy(Long userId) {
		return getOwnerId().map(ownerId -> ownerId.equals(userId)).orElse(false);
	}

}
