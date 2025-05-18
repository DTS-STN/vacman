package ca.gov.dtsstn.vacman.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@DisplayName("SecurityAuditor tests")
@ExtendWith({ MockitoExtension.class })
class SecurityAuditorTest {

	@Mock
	Environment environment;

	SecurityAuditor securityAuditor;

	@BeforeEach
	void beforEach() {
		when(environment.getProperty("spring.application.name", "vacman-api")).thenReturn("test-app");
		this.securityAuditor = new SecurityAuditor(environment);
	}

	@Test
	@DisplayName("Should return application name when no authentication is present")
	void getCurrentAuditor_whenNoAuthentication_returnsApplicationName() {
		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(null);
		SecurityContextHolder.setContext(securityContext);

		assertThat(securityAuditor.getCurrentAuditor())
			.contains("test-app");
	}

	@Test
	@DisplayName("Should return application name when jwt token is null")
	void getCurrentAuditor_whenJwtTokenIsNull_returnsApplicationName() {
		final var authentication = mock(JwtAuthenticationToken.class);
		when(authentication.getToken()).thenReturn(null);

		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		assertThat(securityAuditor.getCurrentAuditor())
			.contains("test-app");
	}

	@Test
	@DisplayName("Should return application name when authentication is not JwtAuthenticationToken")
	void getCurrentAuditor_whenAuthenticationIsNotJwt_returnsApplicationName() {
		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn( mock(Authentication.class));
		SecurityContextHolder.setContext(securityContext);

		assertThat(securityAuditor.getCurrentAuditor())
			.contains("test-app");
	}

	@Test
	@DisplayName("Should return application name when jwt authenticated but name claim is missing")
	void getCurrentAuditor_whenJwtAuthenticatedWithoutNameClaim_returnsApplicationName() {
		final var jwt = mock(Jwt.class);
		when(jwt.getClaimAsString("name")).thenReturn(null);

		final var authentication = mock(JwtAuthenticationToken.class);
		when(authentication.getToken()).thenReturn(jwt);

		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		assertThat(securityAuditor.getCurrentAuditor())
			.contains("test-app");
	}

	@Test
	@DisplayName("Should return username from jwt when authenticated with jwt")
	void getCurrentAuditor_whenJwtAuthenticatedWithNameClaim_returnsUserName() {
		final var jwt = mock(Jwt.class);
		when(jwt.getClaimAsString("name")).thenReturn("User Name");

		final var authentication = mock(JwtAuthenticationToken.class);
		when(authentication.getToken()).thenReturn(jwt);

		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		assertThat(securityAuditor.getCurrentAuditor())
			.contains("User Name");
	}

}
