package ca.gov.dtsstn.vacman.api.web.validator;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@DisplayName("HrAdvisorParamValidator tests")
@ExtendWith({ MockitoExtension.class })
class HrAdvisorParamValidatorTest {

    @InjectMocks
    HrAdvisorParamValidator hrAdvisorParamValidator;

    @Test
    @DisplayName("isValid() returns true when hr-advisor parameter is null")
    void isValidReturnsTrueWhenHrAdvisorParamIsNull() {
        assertTrue(hrAdvisorParamValidator.isValid(null, null));
    }

    @Test
    @DisplayName("isValid() returns true when hr-advisor parameter is 'me'")
    void isValidReturnsTrueWhenHrAdvisorParamIsMeLowercase() {
        assertTrue(hrAdvisorParamValidator.isValid("me", null));
    }

    @Test
    @DisplayName("isValid() returns true when hr-advisor parameter is 'ME'")
    void isValidReturnsTrueWhenHrAdvisorParamIsMeUppercase() {
        assertTrue(hrAdvisorParamValidator.isValid("ME", null));
    }

    @Test
    @DisplayName("isValid() returns true when hr-advisor parameter is a valid number")
    void isValidReturnsTrueWhenHrAdvisorParamIsValidNumber() {
        assertTrue(hrAdvisorParamValidator.isValid("123", null));
    }

    @Test
    @DisplayName("isValid() returns false when hr-advisor parameter is not 'me' or a valid number")
    void isValidReturnsFalseWhenHrAdvisorParamIsInvalid() {
        assertFalse(hrAdvisorParamValidator.isValid("invalid", null));
    }
}