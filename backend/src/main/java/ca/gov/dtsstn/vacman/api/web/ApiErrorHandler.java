package ca.gov.dtsstn.vacman.api.web;

import java.util.UUID;
import java.util.stream.Collectors;

import javax.json.JsonException;

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

import ca.gov.dtsstn.vacman.api.web.exception.ForbiddenException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceConflictException;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class ApiErrorHandler extends ResponseEntityExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(ApiErrorHandler.class);

	@ExceptionHandler({ AccessDeniedException.class })
	public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "The server understands the request but refuses to authorize it.");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0403");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.FORBIDDEN, request);
	}

	@ExceptionHandler({ ConstraintViolationException.class })
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
	public ResponseEntity<Object> handleForbiddenException(ForbiddenException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0403");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.FORBIDDEN, request);
	}

	@ExceptionHandler({ JsonException.class })
	public ResponseEntity<Object> handleJsonException(JsonException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "The JSON Patch request is malformed or contains an invalid path. Please check the patch document syntax and ensure all paths are correct.");
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0400");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}

	@Override
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
	public ResponseEntity<Object> handleResourceConflictException(ResourceConflictException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();
		log.error("[correlationId: {}] Request processing failed; nested exception is {}: {}", correlationId, exception.getClass().getName(), exception.getMessage(), exception);

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0409");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.CONFLICT, request);
	}

	@ExceptionHandler({ ResourceNotFoundException.class })
	public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException exception, WebRequest request) {
		final var correlationId = generateCorrelationId();

		final var problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
		problemDetail.setProperty("correlationId", correlationId);
		problemDetail.setProperty("errorCode", "API-0404");

		return super.handleExceptionInternal(exception, problemDetail, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
	}

	@ExceptionHandler({ Exception.class })
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
