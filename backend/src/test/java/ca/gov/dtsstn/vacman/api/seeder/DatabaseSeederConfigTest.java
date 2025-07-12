package ca.gov.dtsstn.vacman.api.seeder;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import ca.gov.dtsstn.vacman.api.config.DatabaseSeederConfig;

@DisplayName("DatabaseSeederConfig Tests")
class DatabaseSeederConfigTest {

    @Test
    @DisplayName("Should validate profile percentage configuration sums to 100%")
    void shouldValidateProfilePercentageConfigurationSumsTo100Percent() {
        // Given
        DatabaseSeederConfig config = new DatabaseSeederConfig();
        config.setUsersWithZeroProfilesPercentage(0.3);
        config.setUsersWithOneProfilePercentage(0.4);
        config.setUsersWithMultipleProfilesPercentage(0.2); // Total = 90%

        // When/Then
        try {
            config.validate();
            assertThat(false).withFailMessage("Expected validation to fail for percentages that don't sum to 100%").isTrue();
        } catch (IllegalArgumentException e) {
            assertThat(e.getMessage()).contains("Profile distribution percentages must sum to 1.0");
        }
    }

    @Test
    @DisplayName("Should accept valid profile percentage configuration")
    void shouldAcceptValidProfilePercentageConfiguration() {
        // Given
        DatabaseSeederConfig config = new DatabaseSeederConfig();
        config.setUsersWithZeroProfilesPercentage(0.1);
        config.setUsersWithOneProfilePercentage(0.7);
        config.setUsersWithMultipleProfilesPercentage(0.2); // Total = 100%

        // When/Then - should not throw exception
        config.validate();
    }

    @Test
    @DisplayName("Should validate min profiles is less than or equal to max profiles")
    void shouldValidateMinProfilesIsLessThanOrEqualToMaxProfiles() {
        // Given
        DatabaseSeederConfig config = new DatabaseSeederConfig();
        config.setUsersWithZeroProfilesPercentage(0.0);
        config.setUsersWithOneProfilePercentage(0.0);
        config.setUsersWithMultipleProfilesPercentage(1.0);
        config.setMinProfilesPerUserWithMultiple(5);
        config.setMaxProfilesPerUserWithMultiple(3); // min > max

        // When/Then
        try {
            config.validate();
            assertThat(false).withFailMessage("Expected validation to fail when min > max profiles").isTrue();
        } catch (IllegalArgumentException e) {
            assertThat(e.getMessage()).contains("Maximum profiles per user with multiple must be >= minimum");
        }
    }

    @Test
    @DisplayName("Should validate percentages are not negative")
    void shouldValidatePercentagesAreNotNegative() {
        // Given
        DatabaseSeederConfig config = new DatabaseSeederConfig();
        config.setUsersWithZeroProfilesPercentage(-0.1); // negative
        config.setUsersWithOneProfilePercentage(0.7);
        config.setUsersWithMultipleProfilesPercentage(0.4);

        // When/Then
        try {
            config.validate();
            assertThat(false).withFailMessage("Expected validation to fail for negative percentages").isTrue();
        } catch (IllegalArgumentException e) {
            assertThat(e.getMessage()).contains("Profile percentages must be non-negative");
        }
    }

    @Test
    @DisplayName("Should validate min profiles per user with multiple is positive")
    void shouldValidateMinProfilesPerUserWithMultipleIsPositive() {
        // Given
        DatabaseSeederConfig config = new DatabaseSeederConfig();
        config.setUsersWithZeroProfilesPercentage(0.0);
        config.setUsersWithOneProfilePercentage(0.0);
        config.setUsersWithMultipleProfilesPercentage(1.0);
        config.setMinProfilesPerUserWithMultiple(1); // should be >= 2 for "multiple"
        config.setMaxProfilesPerUserWithMultiple(3);

        // When/Then
        try {
            config.validate();
            assertThat(false).withFailMessage("Expected validation to fail when min profiles < 2").isTrue();
        } catch (IllegalArgumentException e) {
            assertThat(e.getMessage()).contains("Minimum profiles per user with multiple must be at least 2");
        }
    }

    @Test
    @DisplayName("Should get and set new profile configuration properties")
    void shouldGetAndSetNewProfileConfigurationProperties() {
        // Given
        DatabaseSeederConfig config = new DatabaseSeederConfig();

        // When
        config.setUsersWithZeroProfilesPercentage(0.2);
        config.setUsersWithOneProfilePercentage(0.5);
        config.setUsersWithMultipleProfilesPercentage(0.3);
        config.setMinProfilesPerUserWithMultiple(2);
        config.setMaxProfilesPerUserWithMultiple(5);
        config.setEnsureOneActiveProfilePerUser(true);

        // Then
        assertThat(config.getUsersWithZeroProfilesPercentage()).isEqualTo(0.2);
        assertThat(config.getUsersWithOneProfilePercentage()).isEqualTo(0.5);
        assertThat(config.getUsersWithMultipleProfilesPercentage()).isEqualTo(0.3);
        assertThat(config.getMinProfilesPerUserWithMultiple()).isEqualTo(2);
        assertThat(config.getMaxProfilesPerUserWithMultiple()).isEqualTo(5);
        assertThat(config.isEnsureOneActiveProfilePerUser()).isTrue();
    }
}
