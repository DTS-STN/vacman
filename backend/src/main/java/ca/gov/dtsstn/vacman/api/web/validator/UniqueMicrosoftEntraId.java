package ca.gov.dtsstn.vacman.api.web.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Validation annotation to check if a user with the given Microsoft Entra ID already exists.
 * When validation fails, Spring Boot will automatically return a 400 Bad Request.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = UniqueMicrosoftEntraIdValidator.class)
public @interface UniqueMicrosoftEntraId {

	String message() default "User with this Microsoft Entra ID already exists";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
