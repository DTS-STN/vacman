package ca.gov.dtsstn.vacman.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ca.gov.dtsstn.vacman.api.config.properties.SwaggerUiProperties;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityScheme.Type;

@Configuration
public class SpringDocConfig {

	private static final Logger log = LoggerFactory.getLogger(SpringDocConfig.class);

	public static final String AZURE_AD = "Azure AD";

	@Autowired GitProperties gitProperties;

	@Autowired SwaggerUiProperties swaggerUiProperties;

	final ObjectMapper objectMapper = new ObjectMapper()
		.enable(SerializationFeature.INDENT_OUTPUT)
		.findAndRegisterModules();

	/**
	 * Centralized constants for referencing example objects in the OpenAPI specification.
	 * <p>
	 * These constants are used as keys when registering reusable error examples (see
	 * {@link SpringDocConfig#openApiCustomizer()}). By defining them here, references remain consistent across the codebase and
	 * can be easily updated in a single place if naming conventions change.
	 * <p>
	 * Typical usage is to associate each constant with an {@link io.swagger.v3.oas.models.examples.Example} so that API
	 * responses in the generated documentation can reference a pre-defined example payload.
	 */
	public final class ExampleRefs {

		public static final String ACCESS_DENIED_ERROR = "AccessDeniedError";
		public static final String AUTHENTICATION_ERROR = "AuthenticationError";
		public static final String BAD_REQUEST_ERROR = "BadRequestError";
		public static final String CONFLICT_ERROR = "ConflictError";
		public static final String INTERNAL_SERVER_ERROR = "InternalServerError";
		public static final String RESOURCE_NOT_FOUND_ERROR = "ResourceNotFoundError";
		public static final String UNPROCESSABLE_ENTITY_ERROR = "UnprocessableEntityError";

	}

	@Bean OpenApiCustomizer openApiCustomizer() {
		log.info("Creating 'openApiCustomizer' bean");

		return openApi -> {
			openApi.getInfo()
				.title(swaggerUiProperties.applicationName())
				.contact(new Contact()
					.name(swaggerUiProperties.contactName())
					.url(swaggerUiProperties.contactUrl()))
				.description(swaggerUiProperties.description())
				.termsOfService(swaggerUiProperties.tosUrl())
				.version(gitProperties.get("build.version"));

			openApi.getComponents()
				.addSecuritySchemes(SpringDocConfig.AZURE_AD, new SecurityScheme()
					.type(Type.OAUTH2)
					.flows(new OAuthFlows()
						.authorizationCode(new OAuthFlow()
							.authorizationUrl(swaggerUiProperties.authentication().oauth().authorizationUrl())
							.tokenUrl(swaggerUiProperties.authentication().oauth().tokenUrl()))));

			openApi.getComponents()
				.addExamples(ExampleRefs.ACCESS_DENIED_ERROR, generateExample(HttpStatus.FORBIDDEN, "API-0403", "The server understands the request but refuses to authorize it."))
				.addExamples(ExampleRefs.AUTHENTICATION_ERROR, generateExample(HttpStatus.UNAUTHORIZED, "API-0401", "The request lacks valid authentication credentials for the requested resource."))
				.addExamples(ExampleRefs.BAD_REQUEST_ERROR, generateExample(HttpStatus.BAD_REQUEST, "API-0400", "The the server cannot or will not process the request due to something that is perceived to be a client error."))
				.addExamples(ExampleRefs.CONFLICT_ERROR, generateExample(HttpStatus.CONFLICT, "API-0400", "A request conflict with the current state of the target resource"))
				.addExamples(ExampleRefs.INTERNAL_SERVER_ERROR, generateExample(HttpStatus.INTERNAL_SERVER_ERROR, "API-0500", "An unexpected error has occurred."))
				.addExamples(ExampleRefs.RESOURCE_NOT_FOUND_ERROR, generateExample(HttpStatus.NOT_FOUND, "API-0404", "The requested resource was not found or the user does not have access to the resource."));
		};
	}

	Example generateExample(HttpStatusCode httpStatusCode, String errorCode, String detail) {
		try {
			final var problemDetail = ProblemDetail.forStatusAndDetail(httpStatusCode, detail);
			problemDetail.setProperty("correlationId", "00000000-0000-0000-0000-000000000000");
			problemDetail.setProperty("errorCode", errorCode);
			return new Example().value(objectMapper.writeValueAsString(problemDetail));
		}
		catch (final JsonProcessingException jsonProcessingException) {
			throw new RuntimeException(jsonProcessingException);
		}
	}

}
