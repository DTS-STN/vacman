package ca.gov.dtsstn.vacman.api.exception;

import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;

/**
 * A utility class for creating consistent exceptions.
 */
public class ExceptionUtils {

	private ExceptionUtils() {
		// Prevents instantiation.
	}

	/**
	 * Returns a {@link ResourceNotFoundException} with a message explaining that entity does not exist with that ID.
	 *
	 * @param entity The name of the entity being searched for.
	 * @param id The value of the ID.
	 * @return An exception with the appropriate message.
	 */
	public static ResourceNotFoundException generateIdDoesNotExistException(String entity, Long id) {
		return generateEntityWithFieldDoesNotExistException(entity, "id", String.valueOf(id));
	}

	/**
	 * Returns a {@link ResourceNotFoundException} with a message explaining that the profile entity's provided field
	 * does not have a value matching the argument.
	 *
	 * @param field The name of the field being read.
	 * @param value The value of the field.
	 * @return An exception with the appropriate message.
	 */
	public static ResourceNotFoundException generateProfileWithFieldDoesNotExistException(String field, String value) {
		return generateEntityWithFieldDoesNotExistException("profile", field, value);
	}

	/**
	 * Returns a {@link ResourceNotFoundException} with a message explaining that the user entity's provided field
	 * does not have a value matching the argument.
	 *
	 * @param field The name of the field being read.
	 * @param value The value of the field.
	 * @return An exception with the appropriate message.
	 */
	public static ResourceNotFoundException generateUserWithFieldDoesNotExistException(String field, String value) {
		return generateEntityWithFieldDoesNotExistException("user", field, value);
	}

	private static ResourceNotFoundException generateEntityWithFieldDoesNotExistException(String entity, String field, String value) {
		return new ResourceNotFoundException(String.format("A(n) %s with %s=[%s] does not exist", entity, field, value));
	}

}
