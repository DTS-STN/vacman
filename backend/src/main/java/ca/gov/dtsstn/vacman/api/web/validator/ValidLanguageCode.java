package ca.gov.dtsstn.vacman.api.web.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Validation annotation to check if a language code exists in the database.
 * When validation fails, Spring Boot will automatically return a 400 Bad Request.
 */
@Documented
@Constraint(validatedBy = LanguageCodeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidLanguageCode {

    String message() default "Language code does not exist";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
