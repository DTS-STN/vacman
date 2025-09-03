package ca.gov.dtsstn.vacman.api.json;

import java.util.Set;
import java.util.function.Function;

import javax.json.JsonException;
import javax.json.JsonMergePatch;
import javax.json.JsonPatch;
import javax.json.JsonStructure;
import javax.json.JsonValue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;

/**
 * A component that applies JSON Patch and JSON Merge Patch operations to Java objects.
 * This class ensures that the patch operations are applied to a copy of the original
 * object and that the resulting object is validated before being returned.
 *
 * @see <a href="https://tools.ietf.org/html/rfc6902">RFC 6902: JSON Patch</a>
 * @see <a href="https://tools.ietf.org/html/rfc7396">RFC 7396: JSON Merge Patch</a>
 */
@Component
public class JsonPatchProcessor {

	private static final Logger log = LoggerFactory.getLogger(JsonPatchProcessor.class);

	private final ObjectMapper objectMapper = new ObjectMapper()
		.findAndRegisterModules();

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
		return patch(object, value -> jsonMergePatch.apply(objectMapper.convertValue(value, JsonValue.class)));
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
		return patch(object, value -> jsonPatch.apply(objectMapper.convertValue(value, JsonStructure.class)));
	}

	/**
	 * Generic JSON patching method that delegates the actual patch application to a passed-in function.
	 * <p>
	 * This method first creates a deep copy of the input object. The patch function is then applied to this copy.
	 * Finally, the patched copy is validated. If validation is successful, the patched copy is returned.
	 *
	 * @param <T> the type of the object to patch
	 * @param object the object to patch
	 * @param patchFn a function that applies the patch to a {@link JsonValue} representation of the object
	 * @return the patched and validated object
	 * @throws ConstraintViolationException if the patched object does not pass validation
	 */
	protected <T> T patch(T object, Function<? super Object, ? extends JsonValue> patchFn) {
		Assert.notNull(object, "object is required; it must not be null");
		Assert.notNull(patchFn, "patchFn is required; it must not be null");

		try {
			log.debug("Patching object of type {}", object.getClass().getSimpleName());
			final var copy = objectMapper.convertValue(object, object.getClass());
			final var json = objectMapper.writeValueAsString(patchFn.apply(copy));
			final var patched = objectMapper.readValue(json, object.getClass());

			log.debug("Performing JSON patch validation");
			final Set<ConstraintViolation<Object>> constraintViolations = validator.validate(patched);
			if (constraintViolations.isEmpty() == false) { throw new ConstraintViolationException(constraintViolations); }
			log.debug("No validation errors for {}", object.getClass().getSimpleName());

			return (T) patched;
		}
		// JsonException can be thrown by Johnzon
		// JsonProcessingException can be thrown by Jackson
		catch (final JsonException | JsonProcessingException exception) {
			throw new JsonPatchException("An error occurred while JSON-Patching", exception);
		}
	}

}
