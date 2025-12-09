package ca.gov.dtsstn.vacman.api.json;

import org.jspecify.annotations.Nullable;
import org.springframework.core.NestedRuntimeException;

/**
 * Thrown by the JSON subsystem when a JSON processing error occurs.
 */
@SuppressWarnings({ "serial" })
public class JsonPatchException extends NestedRuntimeException {

	/**
	 * Constructs a new exception with the specified detail message.
	 * The cause is not initialized, and may subsequently be initialized by a
	 * call to {@link #initCause}.
	 *
	 * @param message the detail message. The detail message is saved for later
	 *        retrieval by the {@link #getMessage()} method.
	 */
	public JsonPatchException(String message) {
		this(message, null);
	}

	/**
	 * Constructs a new exception with the specified detail message and cause.
	 * <p>
	 * Note that the detail message associated with <code>cause</code> is
	 * <i>not</i> automatically incorporated in this exception's detail message.
	 *
	 * @param message the detail message (which is saved for later retrieval by
	 *        the {@link #getMessage()} method).
	 * @param cause the cause (which is saved for later retrieval by the
	 *        {@link #getCause()} method). (A <tt>null</tt> value is permitted,
	 *        and indicates that the cause is nonexistent or unknown.)
	 */
	public JsonPatchException(String message, @Nullable Throwable cause) {
		super(message, cause);
	}

}
