package ca.gov.dtsstn.vacman.api.web.exception;

import java.util.function.Supplier;

import org.springframework.core.NestedRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings({ "serial" })
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends NestedRuntimeException {

	public ResourceNotFoundException(String message) {
		super(message);
	}

	/**
	 * Constructs this object with an "entity with field value not found" message.
	 *
	 * @param entityName The name of the entity.
	 * @param fieldName The field that was searched on.
	 * @param fieldValue The value of the field that was searched on.
	 */
	public ResourceNotFoundException(String entityName, String fieldName, String fieldValue) {
		super("A(n) " + entityName + " with " + fieldName + "=[" + fieldValue + "] does not exist");
	}

	/**
	 * @param entityName The name of the entity.
	 * @param fieldName The field that was searched on.
	 * @param fieldValue The value of the field that was searched for.
	 * @return A {@link Supplier} for a {@code ResourceNotFoundException} with a predetermined "entity with field value
	 * not found" message.
	 */
	public static Supplier<ResourceNotFoundException> asResourceNotFoundException(String entityName, String fieldName, String fieldValue) {
		return () -> new ResourceNotFoundException(entityName, fieldName, fieldValue);
	}

	/**
	 * @param entityName The name of the entity.
	 * @param idValue The value of the ID that was searched for.
	 * @return A {@link Supplier} for a {@code ResourceNotFoundException} with a predetermined "entity with ID value
	 * not found" message.
	 */
	public static Supplier<ResourceNotFoundException> asResourceNotFoundException(String entityName, Long idValue) {
		return asResourceNotFoundException(entityName, "id", String.valueOf(idValue));
	}

	/**
	 * @param fieldName The field that was searched on.
	 * @param fieldValue The value of the field that was searched for.
	 * @return A {@link Supplier} for a {@code ResourceNotFoundException} with a predetermined "user with field value
	 * not found" message.
	 */
	public static Supplier<ResourceNotFoundException> asUserResourceNotFoundException(String fieldName, String fieldValue) {
		return asResourceNotFoundException("user", fieldName, fieldValue);
	}

}
