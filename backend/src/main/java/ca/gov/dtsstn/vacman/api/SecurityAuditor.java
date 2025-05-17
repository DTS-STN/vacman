package ca.gov.dtsstn.vacman.api;

import java.util.Optional;

import org.springframework.core.env.Environment;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Implements Spring Data's {@link AuditorAware} interface to provide the
 * current auditor (typically a user's name) for entity auditing purposes.
 * <p>
 * This implementation attempts to retrieve the username from the "name" claim
 * of a JWT present in the current security context. If a JWT is not available,
 * or if the "name" claim is not present in the token, it falls back to using
 * the configured application name.
 */
@Component
public class SecurityAuditor implements AuditorAware<String> {

	private final String applicationName;

	public SecurityAuditor(Environment environment) {
		this.applicationName = environment.getProperty("spring.application.name", "vacman-api");
	}

	@Override
	public Optional<String> getCurrentAuditor() {
		final var securityContext = SecurityContextHolder.getContext();

		return Optional.ofNullable(securityContext.getAuthentication())
			.filter(JwtAuthenticationToken.class::isInstance)
			.map(JwtAuthenticationToken.class::cast)
			.map(JwtAuthenticationToken::getToken)
			.map(jwt -> jwt.getClaimAsString("name"))
			.or(() -> Optional.of(this.applicationName));
	}

}