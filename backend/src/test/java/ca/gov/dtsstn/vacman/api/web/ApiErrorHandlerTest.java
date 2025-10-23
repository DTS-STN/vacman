package ca.gov.dtsstn.vacman.api.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.type;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import ca.gov.dtsstn.vacman.api.web.exception.UnauthorizedException;

@ExtendWith(MockitoExtension.class)
@DisplayName("ApiErrorHandler Tests")
class ApiErrorHandlerTest {

	ApiErrorHandler apiErrorHandler;

	@BeforeEach
	void beforeEach() {
		this.apiErrorHandler = new ApiErrorHandler();
	}

	@Test
	@SuppressWarnings({ "unchecked" })
	@DisplayName("handleMethodArgumentNotValid with field errors should return BadRequest with detailed ProblemDetail")
	void handleMethodArgumentNotValid_withFieldErrors_returnsBadRequestWithProblemDetail() {
		final var fieldErrors = List.of(
			new FieldError("objectName", "field1", "Error message for field1"),
			new FieldError("objectName", "field2", "Error message for field2"));

		final var bindingResult = mock(BindingResult.class);
		when(bindingResult.getFieldErrors()).thenReturn(fieldErrors);

		final var methodArgumentNotValidException = mock(MethodArgumentNotValidException.class);
		when(methodArgumentNotValidException.getBindingResult()).thenReturn(bindingResult);

		final var responseEntity = apiErrorHandler.handleMethodArgumentNotValid(methodArgumentNotValidException, new HttpHeaders(), HttpStatus.BAD_REQUEST, mock(WebRequest.class));

		assertThat(responseEntity)
			.extracting(ResponseEntity::getStatusCode)
			.isEqualTo(HttpStatus.BAD_REQUEST);

		assertThat(responseEntity)
			.extracting(ResponseEntity::getBody, type(ProblemDetail.class))
			.satisfies(problemDetail -> {
				assertThat(problemDetail)
					.extracting(ProblemDetail::getStatus)
					.isEqualTo(HttpStatus.BAD_REQUEST.value());

				assertThat(problemDetail)
					.extracting(ProblemDetail::getDetail)
					.isEqualTo("One or more fields have invalid values");

				assertThat(problemDetail)
					.extracting(ProblemDetail::getProperties)
					.extracting("errors", type(Map.class))
					.satisfies(errors -> {

						assertThat((Map<String, String>) errors)
							.containsEntry("field1", "Error message for field1")
							.containsEntry("field2", "Error message for field2");
					});
			});
	}

	@Test
	@SuppressWarnings({ "unchecked" })
	@DisplayName("handleMethodArgumentNotValid with no field errors should return BadRequest with empty errors map in ProblemDetail")
	void handleMethodArgumentNotValid_whenNoFieldErrors_returnsBadRequestWithEmptyErrorsMap() {
		final var bindingResult = mock(BindingResult.class);
		when(bindingResult.getFieldErrors()).thenReturn(Collections.emptyList());

		final var methodArgumentNotValidException = mock(MethodArgumentNotValidException.class);
		when(methodArgumentNotValidException.getBindingResult()).thenReturn(bindingResult);

		final var responseEntity = apiErrorHandler.handleMethodArgumentNotValid(methodArgumentNotValidException, new HttpHeaders(), HttpStatus.BAD_REQUEST, mock(WebRequest.class));

		assertThat(responseEntity)
			.extracting(ResponseEntity::getStatusCode)
			.isEqualTo(HttpStatus.BAD_REQUEST);

		assertThat(responseEntity)
			.extracting(ResponseEntity::getStatusCode)
			.isEqualTo(HttpStatus.BAD_REQUEST);

		assertThat(responseEntity)
			.extracting(ResponseEntity::getBody, type(ProblemDetail.class))
			.satisfies(problemDetail -> {
				assertThat(problemDetail)
					.extracting(ProblemDetail::getStatus)
					.isEqualTo(HttpStatus.BAD_REQUEST.value());

				assertThat(problemDetail)
					.extracting(ProblemDetail::getDetail)
					.isEqualTo("One or more fields have invalid values");

				assertThat(problemDetail)
					.extracting(ProblemDetail::getProperties)
					.extracting("errors", type(Map.class))
					.satisfies(errors -> {
						assertThat(errors).isEmpty();
					});
			});
	}

	@Test
	@DisplayName("handleUnauthorizedException should return Unauthorized with ProblemDetail")
	void handleUnauthorizedException_returnsUnauthorizedWithProblemDetail() {
		final var unauthorizedException = mock(UnauthorizedException.class);
		when(unauthorizedException.getMessage()).thenReturn("Only HR advisors can pick up requests");

		final var responseEntity = apiErrorHandler.handleUnauthorizedException(unauthorizedException, mock(WebRequest.class));

		assertThat(responseEntity)
			.extracting(ResponseEntity::getStatusCode)
			.isEqualTo(HttpStatus.UNAUTHORIZED);

		assertThat(responseEntity)
			.extracting(ResponseEntity::getBody, type(ProblemDetail.class))
			.satisfies(problemDetail -> {
				assertThat(problemDetail)
					.extracting(ProblemDetail::getStatus)
					.isEqualTo(HttpStatus.UNAUTHORIZED.value());

				assertThat(problemDetail)
					.extracting(ProblemDetail::getDetail)
					.isEqualTo("Only HR advisors can pick up requests");

				assertThat(problemDetail)
					.extracting(ProblemDetail::getProperties)
					.satisfies(properties -> {
						assertThat(properties)
							.containsKey("correlationId")
							.containsKey("errorCode");

						assertThat(properties.get("errorCode")).isEqualTo("API-0401");
					});
			});
	}

}
