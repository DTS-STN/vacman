package ca.gov.dtsstn.vacman.api.web.validator;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Constraint(validatedBy = SelectionProcessTypeCodeValidator.class)
public @interface ValidSelectionProcessTypeCode {

	String message() default "Selection process type does not exist";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
