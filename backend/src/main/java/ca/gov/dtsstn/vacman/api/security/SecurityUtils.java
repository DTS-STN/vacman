package ca.gov.dtsstn.vacman.api.security;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class for Spring Security.
 * Provides a streamlined, static interface for common security operations.
 */
public final class SecurityUtils {

	private SecurityUtils() { }

	/**
	 * Get the current {@link Authentication} object from the security context.
	 *
	 * @return an {@link Optional} containing the current authentication, or empty if none is present.
	 */
	public static Optional<Authentication> getCurrentAuthentication() {
		return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
	}

	/**
	 * Get the Entra ID (Object ID) of the current user from the JWT claims.
	 *
	 * @return an {@link Optional} containing the user's Entra ID as a String if found, otherwise empty.
	 */
	public static Optional<String> getCurrentUserEntraId() {
		return getCurrentAuthentication().map(Authentication::getName);
	}

	/**
	 * Checks the {@code roles} claim for the presence of the {@code hr-advisor} role.
	 */
	public static boolean hasHrAdvisorId() {
		return getCurrentAuthentication().stream()
			.map(Authentication::getAuthorities)
			.flatMap(Collection::stream)
			.map(GrantedAuthority::getAuthority)
			.anyMatch(authority -> authority.equals("hr-advisor"));
	}

	/**
	 * Check if a user is currently authenticated.
	 *
	 * A user is considered authenticated if an authentication object exists in the
	 * security context and its {@code isAuthenticated()} method returns true.
	 *
	 * @return {@code true} if the user is authenticated, {@code false} otherwise.
	 */
	public static boolean isAuthenticated() {
		return getCurrentAuthentication()
			.map(Authentication::isAuthenticated)
			.orElse(false);
	}

	/**
	 * Checks if the current user has any of the specified authorities.
	 *
	 * @param authorities the authorities to check.
	 * @return {@code true} if the current user has at least one of the given authorities, {@code false} otherwise.
	 */
	public static boolean hasCurrentUserAnyOfAuthorities(String... authorities) {
		return getCurrentAuthentication().stream()
			.map(Authentication::getAuthorities)
			.flatMap(Collection::stream)
			.map(GrantedAuthority::getAuthority)
			.anyMatch(Set.of(authorities)::contains);
	}

	/**
	 * Checks if the current user has none of the specified authorities.
	 *
	 * @param authorities the authorities to check.
	 * @return {@code true} if the current user has none of the given authorities, {@code false} otherwise.
	 */
	public static boolean hasCurrentUserNoneOfAuthorities(String... authorities) {
		return !hasCurrentUserAnyOfAuthorities(authorities);
	}

	/**
	 * Checks if the current user has a specific authority.
	 *
	 * @param authority the authority to check.
	 * @return {@code true} if the current user has the authority, {@code false} otherwise.
	 */
	public static boolean hasCurrentUserThisAuthority(String authority) {
		return hasCurrentUserAnyOfAuthorities(authority);
	}

	/**
	 * Get the highest privilege role from the current user's authorities.
	 * Role hierarchy (highest to lowest): admin > hr-advisor > hiring-manager > employee
	 *
	 * @return the highest privilege role authority, or "employee" as fallback if no roles found
	 */
	public static String getHighestPrivilegeRole() {
		final var roleHierarchy = new String[]{"admin", "hr-advisor", "hiring-manager", "employee"};

		final var userRoles = getCurrentAuthentication().stream()
			.map(Authentication::getAuthorities)
			.flatMap(Collection::stream)
			.map(GrantedAuthority::getAuthority)
			.filter(authority -> Set.of(roleHierarchy).contains(authority))
			.toList();

		// Find the highest privilege role according to hierarchy
		for (String role : roleHierarchy) {
			if (userRoles.contains(role)) {
				return role;
			}
		}

		// Fallback to employee if no recognized roles found
		return "employee";
	}

}
