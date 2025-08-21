package ca.gov.dtsstn.vacman.api.web;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.http.ProblemDetail;

import ca.gov.dtsstn.vacman.api.config.SpringDocConfig.ExampleRefs;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

/**
 * Holder for common {@link ApiResponse} meta-annotations.
 */
public class ApiResponses {

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "200", description = "Returned if the request has succeeded.")
	public @interface Ok {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "202", description = "Returned if the request has succeeded.")
	public @interface Created {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "202", description = "Returned if the request has succeeded.")
	public @interface Accepted {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "204", description = "Returned if the request has succeeded.")
	public @interface NoContent {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "400", description = "Returned if any of the request parameters are not valid.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.BAD_REQUEST_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface BadRequestError {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "401", description = "Returned if the request lacks valid authentication credentials for the requested resource.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.AUTHENTICATION_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface AuthenticationError {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "403", description = "Returned if the the server understands the request but refuses to authorize it.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.ACCESS_DENIED_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface AccessDeniedError {}

	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@Retention(RetentionPolicy.RUNTIME)
	@ApiResponse(responseCode = "404", description = "Returned if resource was not found or the user does not have access to the resource.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.RESOURCE_NOT_FOUND_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface ResourceNotFoundError {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "409", description = "Returned if there is a request conflict with the current state of the target resource", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.CONFLICT_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface ConflictError {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "422", description = "Returned if the server understands the content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.UNPROCESSABLE_ENTITY_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface UnprocessableEntityError {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "429", description = "Returned if the user has sent too many requests in a given amount of time.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.TOO_MANY_REQUESTS_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface TooManyRequestsError {}

	@Retention(RetentionPolicy.RUNTIME)
	@Target({ ElementType.METHOD, ElementType.TYPE, ElementType.ANNOTATION_TYPE })
	@ApiResponse(responseCode = "500", description = "Returned when an unexpected error has occurred.", content = { @Content(examples = { @ExampleObject(name = "Default", ref = ExampleRefs.INTERNAL_SERVER_ERROR) }, schema = @Schema(implementation = ProblemDetail.class)) })
	public @interface InternalServerError {}

}
