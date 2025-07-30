package ca.gov.dtsstn.vacman.api.service.notify;

import org.immutables.value.Value.Immutable;
import org.immutables.value.Value.Style;
import org.immutables.value.Value.Style.ValidationMethod;
import org.springframework.lang.Nullable;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

/**
 * Not sure if there is something already, could not find it.
 *  
 * Domain object that represents a user profile status.
 * 
 * Note: since this can be used as a search probe, all fields are {@code @Nullable}.
  *
 * @author based on code by Greg Baker
 */
@Immutable
@Style(validationMethod = ValidationMethod.NONE)
@JsonDeserialize(as = ImmutableUserProfileStatus.class)


public interface UserProfileStatus {

	@Nullable
	String getEmail();

	@Nullable
	String getProfileId();

	@Nullable
	String getUsername();

}


