package ca.gov.dtsstn.vacman.api.web.exception;

import org.springframework.core.NestedRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.function.Supplier;

@SuppressWarnings({ "serial" })
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends NestedRuntimeException {

	public UnauthorizedException(String message) {
		super(message);
	}

	/**
	 * @return A {@link Supplier} for an {@code UnauthorizedException} with a predetermined Entra ID not found message.
	 */
	public static Supplier<UnauthorizedException> asEntraIdUnauthorizedException() {
		return () -> new UnauthorizedException("Entra ID not found in security context");
	}
}
