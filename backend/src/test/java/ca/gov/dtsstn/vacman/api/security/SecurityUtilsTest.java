package ca.gov.dtsstn.vacman.api.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collection;
import java.util.List;

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
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@DisplayName("SecurityUtils tests")
class SecurityUtilsTest {

	SecurityContext securityContextMock;
	MockedStatic<SecurityContextHolder> securityContextHolderMock;

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
		final var authentication = mock(Authentication.class);
		when(securityContextMock.getAuthentication()).thenReturn(authentication);
		final var result = SecurityUtils.getCurrentAuthentication();
		assertTrue(result.isPresent());
		assertEquals(authentication, result.get());
	}

	@Test
	void getCurrentUserEntraIdReturnsEmptyWhenNotJwtAuthenticationToken() {
		final var authentication = mock(Authentication.class);
		when(securityContextMock.getAuthentication()).thenReturn(authentication);
		assertTrue(SecurityUtils.getCurrentUserEntraId().isEmpty());
	}

	@Test
	void getCurrentUserEntraIdReturnsOidWhenPresent() {
		final var jwtAuth = mock(JwtAuthenticationToken.class);
		when(jwtAuth.getName()).thenReturn("test-oid");
		when(securityContextMock.getAuthentication()).thenReturn(jwtAuth);

		final var result = SecurityUtils.getCurrentUserEntraId();
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
		final var authentication = mock(Authentication.class);
		when(authentication.isAuthenticated()).thenReturn(true);
		when(securityContextMock.getAuthentication()).thenReturn(authentication);
		assertTrue(SecurityUtils.isAuthenticated());

		when(authentication.isAuthenticated()).thenReturn(false);
		assertFalse(SecurityUtils.isAuthenticated());
	}

	@Test
	void hasCurrentUserAnyOfAuthoritiesReturnsFalseWhenNoAuthentication() {
		when(securityContextMock.getAuthentication()).thenReturn(null);
		assertFalse(SecurityUtils.hasAnyAuthorities("ROLE_USER"));
	}

	@Test
	void hasCurrentUserAnyOfAuthoritiesReturnsTrueIfAnyAuthorityMatches() {
		final var authentication = mock(Authentication.class);
		final GrantedAuthority authority1 = () -> "ROLE_USER";
		final GrantedAuthority authority2 = () -> "ROLE_ADMIN";
		final Collection<GrantedAuthority> authorities = List.of(authority1, authority2);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertTrue(SecurityUtils.hasAnyAuthorities("ROLE_USER", "ROLE_OTHER"));
		assertTrue(SecurityUtils.hasAnyAuthorities("ROLE_ADMIN"));
		assertFalse(SecurityUtils.hasAnyAuthorities("ROLE_OTHER"));
	}

	@Test
	void hasCurrentUserNoneOfAuthoritiesReturnsTrueIfNoAuthoritiesMatch() {
		final var authentication = mock(Authentication.class);
		final GrantedAuthority authority = () -> "ROLE_USER";
		final Collection<GrantedAuthority> authorities = List.of(authority);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertTrue(SecurityUtils.hasNoAuthorities("ROLE_ADMIN"));
		assertFalse(SecurityUtils.hasNoAuthorities("ROLE_USER"));
	}

	@Test
	void hasCurrentUserThisAuthorityReturnsTrueIfAuthorityPresent() {
		final var authentication = mock(Authentication.class);
		final GrantedAuthority authority = () -> "ROLE_USER";
		final Collection<GrantedAuthority> authorities = List.of(authority);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertTrue(SecurityUtils.hasAuthority("ROLE_USER"));
		assertFalse(SecurityUtils.hasAuthority("ROLE_ADMIN"));
	}

	@Test
	void getHighestPrivilegeRoleReturnsAdminWhenPresent() {
		final var authentication = mock(Authentication.class);
		final GrantedAuthority authority1 = () -> "admin";
		final GrantedAuthority authority2 = () -> "employee";
		final Collection<GrantedAuthority> authorities = List.of(authority1, authority2);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertEquals("admin", SecurityUtils.getHighestPrivilegeRole());
	}

	@Test
	void getHighestPrivilegeRoleReturnsHrAdvisorWhenAdminNotPresent() {
		final var authentication = mock(Authentication.class);
		final GrantedAuthority authority1 = () -> "hr-advisor";
		final GrantedAuthority authority2 = () -> "employee";
		final Collection<GrantedAuthority> authorities = List.of(authority1, authority2);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertEquals("hr-advisor", SecurityUtils.getHighestPrivilegeRole());
	}

	@Test
	void getHighestPrivilegeRoleReturnsEmployeeWhenNoRolesFound() {
		final var authentication = mock(Authentication.class);
		final GrantedAuthority authority = () -> "some-other-role";
		final Collection<GrantedAuthority> authorities = List.of(authority);
		doReturn(authorities).when(authentication).getAuthorities();
		when(securityContextMock.getAuthentication()).thenReturn(authentication);

		assertEquals("employee", SecurityUtils.getHighestPrivilegeRole());
	}

	@Test
	void getHighestPrivilegeRoleReturnsEmployeeWhenNoAuthentication() {
		when(securityContextMock.getAuthentication()).thenReturn(null);

		assertEquals("employee", SecurityUtils.getHighestPrivilegeRole());
	}

}
