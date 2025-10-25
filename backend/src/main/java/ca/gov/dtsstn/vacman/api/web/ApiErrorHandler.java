package ca.gov.dtsstn.vacman.api.web;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;

import ca.gov.dtsstn.vacman.api.json.JsonPatchException;
import ca.gov.dtsstn.vacman.api.web.exception.ForbiddenException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;
import io.micrometer.core.annotation.Counted;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class ApiErrorHandler extends ResponseEntityExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(ApiErrorHandler.class);

	@ExceptionHandler({ AccessDeniedException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "access_denied", "status", "403" })
	public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "The server understands the request but refuses to authorize it.");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0403");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.FORBIDDEN, request);
	}

	@ExceptionHandler({ ConstraintViolationException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "validation", "status", "400" })
	public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var errors = exception.getConstraintViolations().stream()
			.collect(Collectors.toMap(ConstraintViolation::getPropertyPath, ConstraintViolation::getMessage));

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for the patched resource.");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errors", errors);
		problemDetail.setProperty("errorCode", "API-0400");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	@ExceptionHandler({ ForbiddenException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "forbidden", "status", "403" })
	public ResponseEntity<Object> handleForbiddenException(ForbiddenException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0403");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.FORBIDDEN, request);
	}

	@ExceptionHandler({ JsonPatchException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "json_patch", "status", "400" })
	public ResponseEntity<Object> handleJsonPatchException(JsonPatchException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for the patched resource.");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0400");

		if (exception.getCause() instanceof final UnrecognizedPropertyException unrecognizedPropertyException) {
			problemDetail.setProperty("errors", Map.of(unrecognizedPropertyException.getPropertyName(), "Unrecognized field name"));
		}

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	@Override
	@Counted(value = "errors.handled", extraTags = { "type", "validation", "status", "400" })
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var errors = ex.getBindingResult().getFieldErrors().stream()
			.collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "One or more fields have invalid values");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errors", errors);
		problemDetail.setProperty("errorCode", "API-0400"); // Changed to 400 from 409 for consistency

		return handleExceptionInternal(ex, problemDetail, headers, status, request);
	}

	@ExceptionHandler({ ResourceConflictException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "conflict", "status", "409" })
	public ResponseEntity<Object> handleResourceConflictException(ResourceConflictException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();
		log.error("[correlationId: {}] Request processing failed; nested exception is {}: {}", correlationId, exception.getClass().getName(), exception.getMessage(), exception);

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0409");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.CONFLICT, request);
	}

	@ExceptionHandler({ ResourceNotFoundException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "not_found", "status", "404" })
	public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0404");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
	}

	@ExceptionHandler({ UnauthorizedException.class })
	@Counted(value = "errors.handled", extraTags = { "type", "unauthorized", "status", "401" })
	public ResponseEntity<Object> handleUnauthorizedException(UnauthorizedException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0401");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.UNAUTHORIZED, request);
	}

	@ExceptionHandler({ Exception.class })
	@Counted(value = "errors.handled", extraTags = { "type", "internal_server", "status", "500" })
	public ResponseEntity<Object> handleGenericException(Exception exception, WebRequest request) {
		final var correlationId = generateCorrelationId();
		log.error("[correlationId: {}] Request processing failed; nested exception is {}: {}", correlationId, exception.getClass().getName(), exception.getMessage(), exception);

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error has occurred.");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0500");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
	}

	protected String generateCorrelationId() {
		return UUID.randomUUID().toString();
	}

}
