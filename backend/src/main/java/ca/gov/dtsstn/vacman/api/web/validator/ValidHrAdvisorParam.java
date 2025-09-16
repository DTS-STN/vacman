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
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE_USE })
@Constraint(validatedBy = HrAdvisorParamValidator.class)
public @interface ValidHrAdvisorParam {

    String message() default "Invalid hr-advisor parameter. Must be 'me' or a valid user ID.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}