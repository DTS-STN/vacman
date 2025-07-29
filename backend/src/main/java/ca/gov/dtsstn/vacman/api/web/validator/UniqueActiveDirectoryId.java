package ca.gov.dtsstn.vacman.api.web.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Validation annotation to check if a user with the given Active Directory ID already exists.
 * When validation fails, Spring Boot will automatically return a 400 Bad Request.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = UniqueActiveDirectoryIdValidator.class)
public @interface UniqueActiveDirectoryId {

    String message() default "User with this Active Directory ID already exists";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}