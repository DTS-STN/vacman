package ca.gov.dtsstn.vacman.api.service.notify;

import org.springframework.lang.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;

public final class ImmutableUserProfileStatus implements UserProfileStatus {

  private final @Nullable String email;
  private final @Nullable String profileId;
  private final @Nullable String username;
    
  private ImmutableUserProfileStatus(
      @Nullable String email,
      @Nullable String profileId,
      @Nullable String username) {
    this.email = email;
    this.profileId = profileId;
    this.username = username;
  }

  /**
  * @return The value of the {@code email} attribute
  */
  @JsonProperty("email")
  @Override
  public @Nullable String getEmail() {
    return email;
  }

  /**
  * @return The value of the {@code profileId} attribute
  */
  @JsonProperty("profileId")
  @Override
  public @Nullable String getProfileId() {
    return profileId;
  }

  /**
  * @return The value of the {@code username} attribute
  */
  @JsonProperty("username")
  @Override
  public @Nullable String getUsername() {
    return username;
  }

}
