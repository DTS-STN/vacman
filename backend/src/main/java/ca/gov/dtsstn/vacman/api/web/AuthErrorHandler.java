package ca.gov.dtsstn.vacman.api.web;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * This class functions as both a {@code RestControllerAdvice}, as well as a
 * Spring Security {@code AccessDeniedHandler} and {@code AuthenticationEntryPoint}.
 * <p>
 * The reason for the dual-responsibility is because of how Spring Security handles rules configured in its
 * {@code SecurityFilterChain} vs {@code @PreAuthorize} annotated methods. The former are handled as
 * {@code AccessDeniedHandler} and {@code AuthenticationEntryPoint}, the latter as an {@code @ExceptionHandler}.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE) // this should fire before ApiErrorHandler
public class AuthErrorHandler implements AccessDeniedHandler, AuthenticationEntryPoint {

	private static final Logger log = LoggerFactory.getLogger(AuthErrorHandler.class);

	private final ObjectMapper objectMapper;

	public AuthErrorHandler(ObjectMapper objectMapper) {
		Assert.notNull(objectMapper, "objectMapper is required; it must not be null");
		this.objectMapper = objectMapper;
	}

	@Override
	@ExceptionHandler({ AuthenticationException.class })
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authenticationException) throws IOException {
		log.warn("Authentication Error: statusCode=401, remoteAddress={}", request.getRemoteAddr(), authenticationException);

		final var problemDetail = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
		problemDetail.setDetail("The request lacks valid authentication credentials for the requested resource.");

		sendResponse(response, HttpStatus.UNAUTHORIZED, problemDetail);
	}

	@Override
	@ExceptionHandler({ AccessDeniedException.class })
	public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
		if (isAnonymous()) {
			// Spring Security has this odd quirk whereby it will not throw an
			// AuthenticationCredentialsNotFoundException if the current user is an anonymous user. 🤷
			// see: AbstractSecurityInterceptor.beforeInvocation(..) for reference
			throw new AuthenticationCredentialsNotFoundException(accessDeniedException.getMessage());
		}

		log.warn("Authentication Error: statusCode=403, remoteAddress={}", request.getRemoteAddr(), accessDeniedException);

		final var problemDetail = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
		problemDetail.setDetail("The server understands the request but refuses to authorize it.");

		sendResponse(response, HttpStatus.FORBIDDEN, problemDetail);
	}

	protected void sendResponse(HttpServletResponse response, HttpStatus httpStatus, Object body) throws IOException {
		if (response.isCommitted()) {
			log.warn("Response already committed");
			return;
		}

		response.setStatus(httpStatus.value());
		response.addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		response.getWriter().write(objectMapper.writeValueAsString(body));
	}

	protected boolean isAnonymous() {
		return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
			.map(Authentication::getAuthorities).orElse(Collections.emptyList()).stream()
			.map(GrantedAuthority::getAuthority).anyMatch("ROLE_ANONYMOUS"::equals);
	}

}
