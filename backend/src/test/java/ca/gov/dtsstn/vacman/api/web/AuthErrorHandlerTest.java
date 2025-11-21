package ca.gov.dtsstn.vacman.api.web;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthErrorHandler Tests")
class AuthErrorHandlerTest {

	@Mock
	ObjectMapper objectMapper;

	@InjectMocks
	AuthErrorHandler authErrorHandler;

	@Test
	@DisplayName("commence should set response status to 401 and write ProblemDetail")
	void commence_setsResponseStatusTo401AndWritesProblemDetail() throws IOException {
		final var request = mock(HttpServletRequest.class);
		final var response = mock(HttpServletResponse.class);
		final var authException = mock(AuthenticationException.class);

		when(request.getRemoteAddr()).thenReturn("127.0.0.1");
		when(authException.getMessage()).thenReturn("Authentication failed");
		when(response.isCommitted()).thenReturn(false);
		when(response.getWriter()).thenReturn(mock(PrintWriter.class));
		when(objectMapper.writeValueAsString(any(ProblemDetail.class))).thenReturn("{}");

		authErrorHandler.commence(request, response, authException);

		verify(response).setStatus(HttpStatus.UNAUTHORIZED.value());
		verify(response).addHeader("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		verify(objectMapper).writeValueAsString(any(ProblemDetail.class));
	}

	@Test
	@DisplayName("handle with non-anonymous user should set response status to 403 and write ProblemDetail")
	void handle_withNonAnonymousUser_setsResponseStatusTo403AndWritesProblemDetail() throws IOException {
		final var request = mock(HttpServletRequest.class);
		final var response = mock(HttpServletResponse.class);
		final var accessDeniedException = mock(AccessDeniedException.class);

		when(request.getRemoteAddr()).thenReturn("127.0.0.1");
		when(accessDeniedException.getMessage()).thenReturn("Access denied");
		when(response.isCommitted()).thenReturn(false);
		when(response.getWriter()).thenReturn(mock(PrintWriter.class));
		when(objectMapper.writeValueAsString(any(ProblemDetail.class))).thenReturn("{}");

		// Mock non-anonymous user
		final var authentication = mock(Authentication.class);
		when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		authErrorHandler.handle(request, response, accessDeniedException);

		verify(response).setStatus(HttpStatus.FORBIDDEN.value());
		verify(response).addHeader("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		verify(objectMapper).writeValueAsString(any(ProblemDetail.class));

		SecurityContextHolder.clearContext();
	}

	@Test
	@DisplayName("handle with anonymous user should throw AuthenticationCredentialsNotFoundException")
	void handle_withAnonymousUser_throwsAuthenticationCredentialsNotFoundException() {
		final var request = mock(HttpServletRequest.class);
		final var response = mock(HttpServletResponse.class);
		final var accessDeniedException = mock(AccessDeniedException.class);

		when(accessDeniedException.getMessage()).thenReturn("Access denied");

		// Mock anonymous user
		final var authentication = mock(Authentication.class);
		doReturn(List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))).when(authentication).getAuthorities();
		final var securityContext = mock(SecurityContext.class);
		when(securityContext.getAuthentication()).thenReturn(authentication);
		SecurityContextHolder.setContext(securityContext);

		assertThatThrownBy(() -> authErrorHandler.handle(request, response, accessDeniedException))
			.isInstanceOf(AuthenticationCredentialsNotFoundException.class)
			.hasMessage("Access denied");
	}

}