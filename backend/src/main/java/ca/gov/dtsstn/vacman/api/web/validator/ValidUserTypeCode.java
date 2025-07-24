package ca.gov.dtsstn.vacman.api.web.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Validation annotation to check if a user type code (role) exists in the database.
 * When validation fails, Spring Boot will automatically return a 400 Bad Request.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = UserTypeCodeValidator.class)
public @interface ValidUserTypeCode {

	String message() default "User type code does not exist";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
