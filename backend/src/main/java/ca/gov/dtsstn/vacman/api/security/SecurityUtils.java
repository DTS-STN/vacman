package ca.gov.dtsstn.vacman.api.security;

import static java.util.Collections.emptySet;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity.UserTypeCodes;

/**
 * Utility class for Spring Security.
 * Provides a streamlined, static interface for common security operations.
 */
public final class SecurityUtils {

	public static class Role {
		public static final String HR_ADVISOR = "hr-advisor";
		public static final String HIRING_MANAGER = "hiring-manager";
		public static final String EMPLOYEE = "employee";
	}

	private static final List<String> ROLE_HIERARCHY = List.of(
		"hr-advisor",
		"hiring-manager",
		"employee"
	);

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
	 * Checks if the given role is a known/valid role.
	 *
	 * @param role the role to check
	 * @return true if the role is recognized, false otherwise
	 */
	public static boolean isKnownRole(String role) {
		return switch (role) {
			case Role.HR_ADVISOR, Role.HIRING_MANAGER, Role.EMPLOYEE -> true;
			default -> false;
		};
	}

	/**
	 * Checks if the current user has any of the specified authorities.
	 *
	 * @param authorities the authorities to check.
	 * @return {@code true} if the current user has at least one of the given authorities, {@code false} otherwise.
	 */
	public static boolean hasAnyAuthorities(String... authorities) {
		final var userAuthorities = getCurrentAuthentication()
			.map(Authentication::getAuthorities)
			.map(AuthorityUtils::authorityListToSet)
			.orElse(emptySet());

		return Arrays.stream(authorities).anyMatch(userAuthorities::contains);
	}

	/**
	 * Checks if the current user has none of the specified authorities.
	 *
	 * @param authorities the authorities to check.
	 * @return {@code true} if the current user has none of the given authorities, {@code false} otherwise.
	 */
	public static boolean hasNoAuthorities(String... authorities) {
		return !hasAnyAuthorities(authorities);
	}

	/**
	 * Checks if the current user has a specific authority.
	 *
	 * @param authority the authority to check.
	 * @return {@code true} if the current user has the authority, {@code false} otherwise.
	 */
	public static boolean hasAuthority(String authority) {
		return hasAnyAuthorities(authority);
	}

	/**
	 * Get the highest privilege role from the current user's authorities.
	 * Role hierarchy (highest to lowest): admin > hr-advisor > hiring-manager > employee
	 *
	 * @return the highest privilege role authority, or "employee" as fallback if no roles found
	 */
	public static String getHighestPrivilegeRole() {
		final var userAuthorities = getCurrentAuthentication()
			.map(Authentication::getAuthorities)
			.map(AuthorityUtils::authorityListToSet)
			.orElse(emptySet());

		return ROLE_HIERARCHY.stream()
			.filter(userAuthorities::contains).findFirst()
			.orElse(Role.EMPLOYEE);
	}

	/**
	 * Maps JWT role authorities to user type codes.
	 *
	 * @param role the role authority from JWT claims
	 * @return the corresponding user type code, defaults to EMPLOYEE for unknown roles
	 */
	public static String userTypeFromRole(String role) {
		return switch (role) {
			case Role.HR_ADVISOR -> UserTypeCodes.HR_ADVISOR;
			case Role.HIRING_MANAGER -> UserTypeCodes.HIRING_MANAGER;
			case Role.EMPLOYEE -> UserTypeCodes.EMPLOYEE;
			default -> UserTypeCodes.EMPLOYEE; // Default to employee for unknown roles
		};
	}

}
