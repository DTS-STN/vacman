package ca.gov.dtsstn.vacman.api.web.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Validator annotation for match status codes.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE_USE })
@Constraint(validatedBy = MatchStatusCodeValidator.class)
public @interface ValidMatchStatusCode {

	String message() default "Match status does not exist";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
