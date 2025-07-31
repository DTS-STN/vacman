package ca.gov.dtsstn.vacman.api.web.exception;

import org.springframework.core.NestedRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings({ "serial" })
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends NestedRuntimeException {

	public UnauthorizedException(String message) {
		super(message);
	}

	public UnauthorizedException(String message, Throwable cause) {
		super(message, cause);
	}

}
