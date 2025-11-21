package ca.gov.dtsstn.vacman.api.json;

import java.io.StringReader;
import java.util.Set;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import jakarta.json.Json;
import jakarta.json.JsonException;
import jakarta.json.JsonMergePatch;
import jakarta.json.JsonPatch;
import jakarta.json.JsonStructure;
import jakarta.json.JsonValue;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * A component that applies JSON Patch and JSON Merge Patch operations to Java objects.
 * This class ensures that the patch operations are applied to a copy of the original
 * object and that the resulting object is validated before being returned.
 *
 * This component uses Jackson for serialization/deserialization and Jakarta JSON for patch operations.
 *
 * @see <a href="https://tools.ietf.org/html/rfc6902">RFC 6902: JSON Patch</a>
 * @see <a href="https://tools.ietf.org/html/rfc7396">RFC 7396: JSON Merge Patch</a>
 */
@Component
public class JsonPatchProcessor {

	private static final Logger log = LoggerFactory.getLogger(JsonPatchProcessor.class);

	private final ObjectMapper objectMapper = JsonMapper.builder()
		.findAndAddModules()
		.build();

	private final Validator validator;

	public JsonPatchProcessor(Validator validator) {
		this.validator = validator;
	}

	/**
	 * Applies a JSON Merge Patch to the given object.
	 *
	 * @param <T> the type of the object to patch
	 * @param object the object to patch
	 * @param jsonMergePatch the JSON Merge Patch to apply
	 * @return the patched object
	 * @throws ConstraintViolationException if the patched object is not valid
	 */
	public <T> T patch(T object, JsonMergePatch jsonMergePatch) {
		return patch(object, target -> jsonMergePatch.apply(target));
	}

	/**
	 * Applies a JSON Patch to the given object.
	 *
	 * @param <T> the type of the object to patch
	 * @param object the object to patch
	 * @param jsonPatch the JSON Patch to apply
	 * @return the patched object
	 * @throws ConstraintViolationException if the patched object is not valid
	 */
	public <T> T patch(T object, JsonPatch jsonPatch) {
		return patch(object, target -> jsonPatch.apply(target));
	}

	/**
	 * Generic JSON patching method that delegates the actual patch application to a passed-in function.
	 * <p>
	 * This method first creates a deep copy of the input object. The patch function is then applied to this copy.
	 * Finally, the patched copy is validated. If validation is successful, the patched copy is returned.
	 *
	 * @param <T> the type of the object to patch
	 * @param object the object to patch
	 * @param patchFn a function that receives a {@link JsonStructure} representing the original object and returns the patched {@link JsonValue}
	 * @return the patched and validated object
	 * @throws ConstraintViolationException if the patched object does not pass validation
	 * @throws JsonPatchException if an error occurs during JSON processing
	 */
	@SuppressWarnings({ "unchecked" })
	protected <T> T patch(T object, Function<? super JsonStructure, ? extends JsonValue> patchFn) {
		Assert.notNull(object, "object is required; it must not be null");
		Assert.notNull(patchFn, "patchFn is required; it must not be null");

		try {
			log.debug("Patching object of type {}", object.getClass().getSimpleName());

			final var originalJsonString = objectMapper.writeValueAsString(object);

			try (final var jsonReader = Json.createReader(new StringReader(originalJsonString))) {
				final var originalJsonStructure = jsonReader.read();
				final var patchedJsonValue = patchFn.apply(originalJsonStructure);
				final var patchedJsonString = patchedJsonValue.toString();
				final var patchedObject = objectMapper.readValue(patchedJsonString, object.getClass());

				log.debug("Performing JSON patch validation");
				final Set<ConstraintViolation<Object>> violations = validator.validate(patchedObject);
				if (violations.isEmpty() == false) { throw new ConstraintViolationException(violations); }
				log.debug("No validation errors for {}", object.getClass().getSimpleName());

				return (T) patchedObject;
			}
		}
		// JsonException can be thrown by Johnzon
		// JsonProcessingException can be thrown by Jackson
		catch (final JsonException | JacksonException exception) {
			throw new JsonPatchException("An error occurred while JSON-Patching", exception);
		}
	}

}
