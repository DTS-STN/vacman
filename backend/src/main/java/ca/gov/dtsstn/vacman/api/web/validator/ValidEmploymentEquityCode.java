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
@Constraint(validatedBy = EmploymentEquityCodeValidator.class)
public @interface ValidEmploymentEquityCode {

	String message() default "Employment equity code does not exist";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

}
