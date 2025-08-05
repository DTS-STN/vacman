package ca.gov.dtsstn.vacman.api.security;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Utility class for Spring Security.
 * Provides a streamlined, static interface for common security operations.
 */
public final class SecurityUtils {

	/**
	 * The name of the claim within the JWT that holds the user's unique identifier.
	 * In Azure AD, this is typically the "oid" (Object ID) claim.
	 */
	public static final String USER_ID_CLAIM = "oid";

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
	 * This method safely extracts the claim specified by {@link #USER_ID_CLAIM} ("oid").
	 *
	 * @return an {@link Optional} containing the user's Entra ID as a String if found, otherwise empty.
	 */
	public static Optional<String> getCurrentUserEntraId() {
		return getCurrentAuthentication()
			.filter(JwtAuthenticationToken.class::isInstance)
			.map(JwtAuthenticationToken.class::cast)
			.map(JwtAuthenticationToken::getToken)
			.map(jwt -> jwt.getClaimAsString(USER_ID_CLAIM));
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
		var authoritiesToFind = new HashSet<>(Arrays.asList(authorities));
		return getCurrentAuthentication()
			.map(SecurityUtils::getAuthorities)
			.map(authoritiesStream -> authoritiesStream.anyMatch(authoritiesToFind::contains))
			.orElse(false);
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
	 * Extracts the authority strings from an {@link Authentication} object.
	 *
	 * @param authentication the authentication object.
	 * @return a {@link Stream} of authority strings.
	 */
	private static Stream<String> getAuthorities(Authentication authentication) {
		return authentication.getAuthorities().stream()
			.map(GrantedAuthority::getAuthority);
	}
}
