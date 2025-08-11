package ca.gov.dtsstn.vacman.api.web.exception;

import org.springframework.core.NestedRuntimeException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings({ "serial" })
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends NestedRuntimeException {

	public ForbiddenException(String message) {
		super(message);
	}

	public ForbiddenException(String message, Throwable cause) {
		super(message, cause);
	}

}
