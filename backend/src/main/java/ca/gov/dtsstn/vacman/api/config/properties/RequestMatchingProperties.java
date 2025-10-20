package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("application.matches")
public record RequestMatchingProperties(
	/**
	 * Grace period for mandatory inclusion of profiles in matching when their WFA end date is within this duration.
	 *
	 * Profiles whose WFA end date falls within this period from the current date will always be selected
	 * for matching, bypassing the random selection process used for other candidates.
	 *
	 * For example, if set to 30 days, a profile with a WFA end date 15 days from now would be automatically
	 * included in matching results rather than being part of the random selection pool.
	 */
	Duration wfaEndDateGracePeriod,
	int maxMatchesPerRequest
) {}
