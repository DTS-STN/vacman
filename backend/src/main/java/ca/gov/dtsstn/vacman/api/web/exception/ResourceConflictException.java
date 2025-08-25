package ca.gov.dtsstn.vacman.api.web.exception;

import org.springframework.core.NestedRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.function.Supplier;

@SuppressWarnings({ "serial" })
@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceConflictException extends NestedRuntimeException {

	public ResourceConflictException(String message) {
		super(message);
	}

	public ResourceConflictException(String message, Throwable cause) {
		super(message, cause);
	}

	/**
	 * Constructs this object with an "entity with field value not found" message.
	 *
	 * @param entityName The name of the entity.
	 * @param fieldName The field that was searched on.
	 * @param fieldValue The value of the field that was searched on.
	 */
	public ResourceConflictException(String entityName, String fieldName, String fieldValue) {
		super("A(n) " + entityName + " with " + fieldName + "=[" + fieldValue + "] does not exist");
	}

	/**
	 * @param entityName The name of the entity.
	 * @param idValue The value of the ID that was searched for.
	 * @return A {@link Supplier} for a {@code ResourceConflictException} with a predetermined "entity with ID value
	 * not found" message.
	 */
	public static Supplier<ResourceConflictException> asResourceConflictException(String entityName, Long idValue) {
		return asResourceConflictException(entityName, "id", String.valueOf(idValue));
	}

	/**
	 * @param entityName The name of the entity.
	 * @param fieldName The field that was searched on.
	 * @param fieldValue The value of the field that was searched for.
	 * @return A {@link Supplier} for a {@code ResourceConflictException} with a predetermined "entity with field value
	 * not found" message.
	 */
	public static Supplier<ResourceConflictException> asResourceConflictException(String entityName, String fieldName, String fieldValue) {
		return () -> new ResourceConflictException(entityName, fieldName, fieldValue);
	}
}
