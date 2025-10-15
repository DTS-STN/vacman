package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredCityCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredClassificationCode;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasPreferredLanguageCodeIn;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasProfileStatusCode;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasWfaEndDateNullOrAfter;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.hasWfaStartDateNullOrBefore;
import static ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository.isAvailableForReferral;
import static java.util.Comparator.comparing;
import static java.util.Comparator.reverseOrder;
import static org.springframework.data.jpa.domain.Specification.allOf;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.LanguageReferralTypes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.LanguageRequirements;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.MatchStatuses;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.ProfileStatuses;
import ca.gov.dtsstn.vacman.api.config.properties.RequestMatchingProperties;
import ca.gov.dtsstn.vacman.api.data.entity.AbstractBaseEntity;
import ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;

@Service
public class RequestMatchingService {

	private static final Logger log = LoggerFactory.getLogger(RequestMatchingService.class);

	private final LanguageReferralTypes languageReferralTypes;

	private final LanguageRequirements languageRequirements;

	private final MatchRepository matchRepository;

	private final MatchStatuses matchStatuses;

	private final MatchStatusRepository matchStatusRepository;

	private final ProfileRepository profileRepository;

	private final RequestMatchingProperties requestMatchingProperties;

	private final RequestRepository requestRepository;

	private final ProfileStatuses profileStatuses;

	public RequestMatchingService(
			ApplicationProperties applicationProperties,
			LookupCodes lookupCodes,
			MatchRepository matchRepository,
			MatchStatusRepository matchStatusRepository,
			ProfileRepository profileRepository,
			RequestRepository requestRepository) {
		Assert.notNull(applicationProperties, "applicationProperties is required; it must not be null");
		Assert.notNull(lookupCodes, "lookupCodes is required; it must not be null");
		Assert.notNull(matchRepository, "matchRepository is required; it must not be null");
		Assert.notNull(matchStatusRepository, "matchStatusRepository is required; it must not be null");
		Assert.notNull(profileRepository, "profileRepository is required; it must not be null");
		Assert.notNull(requestRepository, "requestRepository is required; it must not be null");

		this.requestMatchingProperties = applicationProperties.matches();
		this.languageReferralTypes = lookupCodes.languageReferralTypes();
		this.languageRequirements = lookupCodes.languageRequirements();
		this.matchStatuses = lookupCodes.matchStatuses();
		this.profileStatuses = lookupCodes.profileStatuses();

		this.matchRepository = matchRepository;
		this.matchStatusRepository = matchStatusRepository;
		this.profileRepository = profileRepository;
		this.requestRepository = requestRepository;
	}

	/**
	 * Finds matching profiles for a staffing request using a hierarchical prioritization strategy.
	 *
	 * The matching algorithm works as follows:
	 *
	 *   - Filter: Find all profiles that meet the request's basic criteria.
	 *     A profile must satisfy ALL of the following conditions:
	 *       - Profile is marked as available for referral
	 *       - Profile's language preference matches the request's language requirement
	 *       - Profile's preferred classification matches the request's classification
	 *       - Profile's preferred city matches one of the request's cities
	 *       - Profile has an approved status
	 *       - Profile's WFA start date is in the past or null (assignment has started)
	 *       - Profile's WFA end date is in the future or null (assignment hasn't ended)
	 *
	 *   - Randomize: Shuffle profiles randomly to establish a fair baseline ordering.
	 *     This ensures that profiles with identical priority will be selected randomly rather than
	 *     in a predictable order (such as database insertion order).
	 *
	 *   - Sort: Apply hierarchical prioritization using a stable sort, which preserves
	 *     the random order for profiles that are equal on the priority criteria:
	 *       - Primary: WFA status sort order (lower values = higher priority)
	 *       - Secondary: Grace period status (profiles with WFA ending soon = higher priority)
	 *       - Tertiary: Random order from step 2 (for profiles equal on both criteria)
	 *
	 *   - Limit: Select up to `max` profiles from the sorted list.
	 */
	public List<MatchEntity> findMatches(long requestId, int max) {
		Assert.isTrue(max > 0, "max must be positive");

		log.info("Finding maximum {} matches for request ID: {}", max, requestId);

		final var request = requestRepository.findById(requestId)
			.orElseThrow(() -> new IllegalArgumentException("Invalid request ID: " + requestId));

		// Extract the matching criteria from the request -- these criteria will be used to filter the candidate pool of profiles
		final var approvedStatus = profileStatuses.approved();
		final var cities = request.getCities().stream().map(AbstractCodeEntity::getCode).toList();
		final var classification = request.getClassification().getCode();
		final var languageRequirement = request.getLanguageRequirement().getCode();
		final var today = LocalDate.now();

		log.debug("Request {} found -- classification: {}; language requirement: {}; eligible cities: {}", requestId, classification, languageRequirement, cities);

		// Map the language requirement to the matching profile language referral types
		final var preferredLanguages = getMatchingLanguageReferralTypeCodes(languageRequirement);
		log.debug("Language requirement [{}] mapped to referral types: {}", languageRequirement, preferredLanguages);

		// Query for profiles that satisfy ALL of the request's criteria
		// This uses JPA Specifications to build a dynamic query with AND logic
		// A profile must match every single criterion to be included in the results
		final var matchingProfiles = profileRepository.findAll(allOf(
			isAvailableForReferral(true),                   // Profile is marked as available
			hasPreferredLanguageCodeIn(preferredLanguages), // Language preference compatible with request
			hasPreferredClassificationCode(classification), // Classification matches request
			hasPreferredCityCodeIn(cities),                 // Preferred location matches one of request's cities
			hasProfileStatusCode(approvedStatus),           // Profile status is approved
			hasWfaStartDateNullOrBefore(today),             // WFA has started or no start date set
			hasWfaEndDateNullOrAfter(today)                 // WFA has not ended or no end date set
		));

		log.debug("Found {} matching profiles before prioritization", matchingProfiles.size());
		log.trace("Matching profile ids: {}", matchingProfiles.stream().map(AbstractBaseEntity::getId).toList());

		// Apply two-stage sorting followed by limiting:
		//   1. Random shuffle: establishes baseline fairness
		//   2. Stable priority sort: orders by WFA status and urgency, preserving random order for ties
		//   3. Limit: take only the top 'max' profiles from the prioritized list

		log.debug("Shuffling profiles to ensure selection fairness");
		final var shuffledProfiles = shuffle(matchingProfiles);
		log.trace("Shuffled profile ids: {}", shuffledProfiles.stream().map(AbstractBaseEntity::getId).toList());

		final var prioritizedProfiles = shuffledProfiles.stream()
			// Sort by WFA status, then urgency
			// this is a stable sort that will ensure profiles with identical
			// sort order AND urgency retain their relative shuffled order
			.sorted(byPriority())
			// Select top 'max' profiles
			.limit(max).toList();

		log.info("Returning {} prioritized matches for request ID: [{}]", prioritizedProfiles.size(), requestId);
		log.trace("Final prioritized profile ids: {}", prioritizedProfiles.stream().map(AbstractBaseEntity::getId).toList());

		final var pendingMatchStatus = matchStatusRepository.findByCode(matchStatuses.pendingApproval())
			.orElseThrow(() -> new IllegalStateException("Match status 'pending approval' not found"));

		return matchRepository.saveAll(
			prioritizedProfiles.stream()
				.map(profile -> MatchEntity.builder()
					.matchStatus(pendingMatchStatus)
					.profile(profile)
					.request(request)
					.build())
				.toList());
	}

	/**
	 * Maps a request's language requirement code to the profile language referral type codes
	 * that are eligible to be matched with that requirement.
	 *
	 * This implements the language compatibility decision table:
	 *   - BI (Bilingual Imperative): matches only BILINGUAL profiles
	 *   - BNI (Bilingual Non-imperative): matches only BILINGUAL profiles
	 *   - EE-AE (English Essential): matches only ENGLISH profiles
	 *   - FE (French Essential): matches only FRENCH profiles
	 *   - EF-AF (Either/or): matches both ENGLISH and FRENCH profiles
	 *   - VAR (Various): matches all profiles regardless of language preference
	 */
	private List<String> getMatchingLanguageReferralTypeCodes(String languageRequirementCode) {
		if (languageRequirementCode.equals(languageRequirements.bilingualImperative())) {
			return List.of(languageReferralTypes.bilingual());
		}

		if (languageRequirementCode.equals(languageRequirements.bilingualNonImperative())) {
			return List.of(languageReferralTypes.bilingual());
		}

		if (languageRequirementCode.equals(languageRequirements.englishEssential())) {
			return List.of(languageReferralTypes.english());
		}

		if (languageRequirementCode.equals(languageRequirements.frenchEssential())) {
			return List.of(languageReferralTypes.french());
		}

		if (languageRequirementCode.equals(languageRequirements.eitherOr())) {
			return List.of(languageReferralTypes.english(), languageReferralTypes.french());
		}

		if (languageRequirementCode.equals(languageRequirements.various())) {
			// For "various", we return an empty list. The hasPreferredLanguageCodeIn() specification in ProfileRepository
			// is designed to interpret an empty list as a wildcard, effectively disabling the language filter.
			return List.of();
		}

		throw new IllegalArgumentException("Unknown language requirement code: " + languageRequirementCode);
	}

	/**
	 * Creates a comparator that sorts profiles by priority using a hierarchical ordering.
	 *
	 * The comparator applies the following sort criteria in order:
	 *   - WFA status sort order (ascending): Profiles with a lower WFA status
	 *     sort order value are prioritized. If a profile has no WFA status, it is treated
	 *     as having the lowest priority (Integer.MAX_VALUE).
	 *   - Grace period urgency (descending): Among profiles with the same WFA status,
	 *     profiles within the grace period (WFA ending soon) are prioritized higher to ensure
	 *     they receive matches before their assignment expires.
	 *
	 * This comparator is designed to be used as a stable sort after an initial random shuffle,
	 * ensuring that profiles equal on both criteria retain their random ordering.
	 */
	private Comparator<ProfileEntity> byPriority() {
		final Function<ProfileEntity, Integer> bySortOrder = this::getWfaSortOrder;
		final Function<ProfileEntity, Boolean> byUrgency = this::isUrgent;
		// note: isUrgent comparison is reversed because urgent=true must come before urgent=false
		return comparing(bySortOrder).thenComparing(byUrgency, reverseOrder());
	}

	/**
	 * Extracts the WFA status sort order from a profile, returning Integer.MAX_VALUE
	 * if the profile has no WFA status (lowest priority).
	 */
	private int getWfaSortOrder(ProfileEntity profile) {
		final var wfaStatus = profile.getWfaStatus();
		final var wfaStatusCode = wfaStatus != null ? wfaStatus.getCode() : "N/A";
		final var sortOrder = wfaStatus != null ? wfaStatus.getSortOrder() : Integer.MAX_VALUE;
		log.trace("Profile {}: WFA staus: {}; sort order: {}", profile.getId(), wfaStatusCode, sortOrder);
		return sortOrder;
	}

	/**
	 * Determines if a profile is within the grace period for WFA end date urgency.
	 *
	 * Returns `true` if the profile is within the grace period (ending soon, higher urgency),
	 * or `false` if the profile is not within the grace period (lower urgency).
	 *
	 * The grace period is calculated from the current date plus the configured duration
	 * (e.g., if grace period is 30 days, the cutoff date is 30 days from today).
	 * Profiles whose WFA end date is on or before the cutoff date are considered within
	 * the grace period and should be prioritized for matching to help them find new
	 * assignments before their current WFA expires.
	 *
	 * If a profile has no WFA end date (null), it is not considered within the grace period
	 * since there is no imminent expiration.
	 */
	private boolean isUrgent(ProfileEntity profile) {
		final var gracePeriod = requestMatchingProperties.wfaEndDateGracePeriod();
		final var cutoffDate = LocalDate.now().plusDays(gracePeriod.toDays());
		final var wfaEndDate = profile.getWfaEndDate();
		final var isUrgent = wfaEndDate != null && !wfaEndDate.isAfter(cutoffDate);
		log.trace("Profile {}: urgent: {} (end date: {}, cutoff: {})", profile.getId(), isUrgent, wfaEndDate, cutoffDate);
		return isUrgent;
	}

	/**
	 * Returns an immutable shuffled copy of the given list without mutating the original.
	 */
	private <T> List<T> shuffle(List<T> list) {
		final var shuffled = new ArrayList<>(list);
		Collections.shuffle(shuffled);
		return List.copyOf(shuffled);
	}

}
