package ca.gov.dtsstn.vacman.api.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@DisplayName("SecurityUtils tests")
class SecurityUtilsTest {

	private SecurityContext securityContextMock;
	private MockedStatic<SecurityContextHolder> securityContextHolderMock;

	@BeforeEach
	void setUp() {
		securityContextMock = mock(SecurityContext.class);
		securityContextHolderMock = Mockito.mockStatic(SecurityContextHolder.class);
		securityContextHolderMock.when(SecurityContextHolder::getContext).thenReturn(securityContextMock);
	}

	@AfterEach
	void tearDown() {
		securityContextHolderMock.close();
	}

	@Test
	void getCurrentAuthenticationReturnsEmptyWhenNoAuthentication() {
		when(securityContextMock.getAuthentication()).thenReturn(null);
		assertTrue(SecurityUtils.getCurrentAuthentication().isEmpty());
	}

	@Test
	void getCurrentAuthenticationReturnsAuthenticationWhenPresent() {
		Authentication authentication = mock(Authentication.class);
		when(securityContextMock.getAuthentication()).thenReturn(authentication);
		Optional<Authentication> result = SecurityUtils.getCurrentAuthentication();
		assertTrue(result.isPresent());
		assertEquals(authentication, result.get());
	}

	@Test
	void getCurrentUserEntraIdReturnsEmptyWhenNotJwtAuthenticationToken() {
		Authentication authentication = mock(Authentication.class);
		when(securityContextMock.getAuthentication()).thenReturn(authentication);
		assertTrue(SecurityUtils.getCurrentUserEntraId().isEmpty());
	}

	@Test
	void getCurrentUserEntraIdReturnsOidWhenPresent() {
		Jwt jwt = mock(Jwt.class);
		when(jwt.getClaimAsString(SecurityUtils.USER_ID_CLAIM)).thenReturn("test-oid");
		JwtAuthenticationToken jwtAuth = mock(JwtAuthenticationToken.class);
		when(jwtAuth.getToken()).thenReturn(jwt);
		when(securityContextMock.getAuthentication()).thenReturn(jwtAuth);

		Optional<String> result = SecurityUtils.getCurrentUserEntraId();
		assertTrue(result.isPresent());
		assertEquals("test-oid", result.get());
	}

	@Test
	void isAuthenticatedReturnsFalseWhenNoAuthentication() {
		when(securityContextMock.getAuthentication()).thenReturn(null);
		assertFalse(SecurityUtils.isAuthenticated());
	}

	@Test
	void isAuthenticatedReturnsAuthenticationStatus() {
		Authentication authentication = mock(Authentication.class);
		when(authentication.isAuthenticated()).thenReturn(true);
		when(securityContextMock.getAuthentication()).thenReturn(authentication);
		assertTrue(SecurityUtils.isAuthenticated());

		when(authentication.isAuthenticated()).thenReturn(false);
		assertFalse(SecurityUtils.isAuthenticated());
	}

	@Test
	void hasCurrentUserAnyOfAuthoritiesReturnsFalseWhenNoAuthentication() {
		when(securityContextMock.getAuthentication()).thenReturn(null);
		assertFalse(SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_USER"));
	}

	@Test
	void hasCurrentUserAnyOfAuthoritiesReturnsTrueIfAnyAuthorityMatches() {
		Authentication authentication = mock(Authentication.class);
		GrantedAuthority authority1 = () -> "ROLE_USER";
		GrantedAuthority authority2 = () -> "ROLE_ADMIN";
		Collection<GrantedAuthority> authorities = List.of(authority1, authority2);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertTrue(SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_USER", "ROLE_OTHER"));
		assertTrue(SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_ADMIN"));
		assertFalse(SecurityUtils.hasCurrentUserAnyOfAuthorities("ROLE_OTHER"));
	}

	@Test
	void hasCurrentUserNoneOfAuthoritiesReturnsTrueIfNoAuthoritiesMatch() {
		Authentication authentication = mock(Authentication.class);
		GrantedAuthority authority = () -> "ROLE_USER";
		Collection<GrantedAuthority> authorities = List.of(authority);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertTrue(SecurityUtils.hasCurrentUserNoneOfAuthorities("ROLE_ADMIN"));
		assertFalse(SecurityUtils.hasCurrentUserNoneOfAuthorities("ROLE_USER"));
	}

	@Test
	void hasCurrentUserThisAuthorityReturnsTrueIfAuthorityPresent() {
		Authentication authentication = mock(Authentication.class);
		GrantedAuthority authority = () -> "ROLE_USER";
		Collection<GrantedAuthority> authorities = List.of(authority);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertTrue(SecurityUtils.hasCurrentUserThisAuthority("ROLE_USER"));
		assertFalse(SecurityUtils.hasCurrentUserThisAuthority("ROLE_ADMIN"));
	}
}
