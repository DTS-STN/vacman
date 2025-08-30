package ca.gov.dtsstn.vacman.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import ca.gov.dtsstn.vacman.api.config.cache.CaffeineCacheFactory;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = { "application.caching.enabled" })
public class CacheConfig {

	private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

	public static class CacheNames {
		public static final String CITIES = "cities";
		public static final String CLASSIFICATIONS = "classifications";
		public static final String EMPLOYMENT_EQUITIES = "employment-equities";
		public static final String EMPLOYMENT_OPPORTUNITIES = "employment-opportunities";
		public static final String EMPLOYMENT_TENURES = "employment-tenures";
		public static final String LANGUAGES = "languages";
		public static final String LANGUAGE_REFERRAL_TYPES = "language-referral-types";
		public static final String LANGUAGE_REQUIREMENTS = "language-requirements";
		public static final String NON_ADVERTISED_APPOINTMENTS = "non-advertised-appointments";
		public static final String PRIORITY_LEVELS = "priority-levels";
		public static final String PROFILE_STATUSES = "profile-statuses";
		public static final String PROVINCES = "provinces";
		public static final String REQUEST_STATUSES = "request-statuses";
		public static final String SECURITY_CLEARANCES = "security-clearances";
		public static final String SELECTION_PROCESS_TYPES = "selection-process-types";
		public static final String USER_TYPES = "user-types";
		public static final String WFA_STATUSES = "wfa-statuses";
		public static final String WORK_SCHEDULES = "work-schedules";
		public static final String WORK_UNITS = "work-units";
	}

	@ConfigurationProperties("application.caching.caches.cities")
	@Bean CaffeineCacheFactory cityCache() {
		log.info("Creating 'cityCache' bean");
		return new CaffeineCacheFactory(CacheNames.CITIES);
	}

	@ConfigurationProperties("application.caching.caches.classifications")
	@Bean CaffeineCacheFactory classificationCache() {
		log.info("Creating 'classificationCache' bean");
		return new CaffeineCacheFactory(CacheNames.CLASSIFICATIONS);
	}

	@ConfigurationProperties("application.caching.caches.employment-equities")
	@Bean CaffeineCacheFactory employmentEquityCache() {
		log.info("Creating 'employmentEquityCache' bean");
		return new CaffeineCacheFactory(CacheNames.EMPLOYMENT_EQUITIES);
	}

	@ConfigurationProperties("application.caching.caches.employment-opportunities")
	@Bean CaffeineCacheFactory employmentOpportunityCache() {
		log.info("Creating 'employmentOpportunityCache' bean");
		return new CaffeineCacheFactory(CacheNames.EMPLOYMENT_OPPORTUNITIES);
	}

	@ConfigurationProperties("application.caching.caches.employment-tenures")
	@Bean CaffeineCacheFactory employmentTenureCache() {
		log.info("Creating 'employmentTenureCache' bean");
		return new CaffeineCacheFactory(CacheNames.EMPLOYMENT_TENURES);
	}

	@ConfigurationProperties("application.caching.caches.languages")
	@Bean CaffeineCacheFactory languageCache() {
		log.info("Creating 'languageCache' bean");
		return new CaffeineCacheFactory(CacheNames.LANGUAGES);
	}

	@ConfigurationProperties("application.caching.caches.language-referral-types")
	@Bean CaffeineCacheFactory languageReferralTypeCache() {
		log.info("Creating 'languageReferralTypeCache' bean");
		return new CaffeineCacheFactory(CacheNames.LANGUAGE_REFERRAL_TYPES);
	}

	@ConfigurationProperties("application.caching.caches.language-requirements")
	@Bean CaffeineCacheFactory languageRequirementCache() {
		log.info("Creating 'languageRequirementCache' bean");
		return new CaffeineCacheFactory(CacheNames.LANGUAGE_REQUIREMENTS);
	}

	@ConfigurationProperties("application.caching.caches.non-advertised-appointments")
	@Bean CaffeineCacheFactory nonAdvertisedAppointmentCache() {
		log.info("Creating 'nonAdvertisedAppointmentCache' bean");
		return new CaffeineCacheFactory(CacheNames.NON_ADVERTISED_APPOINTMENTS);
	}

	@ConfigurationProperties("application.caching.caches.priority-levels")
	@Bean CaffeineCacheFactory priorityLevelCache() {
		log.info("Creating 'priorityLevelCache' bean");
		return new CaffeineCacheFactory(CacheNames.PRIORITY_LEVELS);
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.profile-statuses")
	CaffeineCacheFactory profileStatusCache() {
		log.info("Creating 'profileStatusCache' bean");
		return new CaffeineCacheFactory(CacheNames.PROFILE_STATUSES);
	}

	@ConfigurationProperties("application.caching.caches.provinces")
	@Bean CaffeineCacheFactory provinceCache() {
		log.info("Creating 'provinceCache' bean");
		return new CaffeineCacheFactory(CacheNames.PROVINCES);
	}

	@ConfigurationProperties("application.caching.caches.request-statuses")
	@Bean CaffeineCacheFactory requestStatusCache() {
		log.info("Creating 'requestStatusCache' bean");
		return new CaffeineCacheFactory(CacheNames.REQUEST_STATUSES);
	}

	@ConfigurationProperties("application.caching.caches.security-clearances")
	@Bean CaffeineCacheFactory securityClearanceCache() {
		log.info("Creating 'securityClearanceCache' bean");
		return new CaffeineCacheFactory(CacheNames.SECURITY_CLEARANCES);
	}

	@ConfigurationProperties("application.caching.caches.selection-process-types")
	@Bean CaffeineCacheFactory selectionProcessTypeCache() {
		log.info("Creating 'selectionProcessTypeCache' bean");
		return new CaffeineCacheFactory(CacheNames.SELECTION_PROCESS_TYPES);
	}

	@ConfigurationProperties("application.caching.caches.user-types")
	@Bean CaffeineCacheFactory userTypeCache() {
		log.info("Creating 'userTypeCache' bean");
		return new CaffeineCacheFactory(CacheNames.USER_TYPES);
	}

	@ConfigurationProperties("application.caching.caches.wfa-statuses")
	@Bean CaffeineCacheFactory wfaStatusCache() {
		log.info("Creating 'wfaStatusCache' bean");
		return new CaffeineCacheFactory(CacheNames.WFA_STATUSES);
	}

	@ConfigurationProperties("application.caching.caches.work-schedules")
	@Bean CaffeineCacheFactory workScheduleCache() {
		log.info("Creating 'workScheduleCache' bean");
		return new CaffeineCacheFactory(CacheNames.WORK_SCHEDULES);
	}

	@ConfigurationProperties("application.caching.caches.work-units")
	@Bean CaffeineCacheFactory workUnitCache() {
		log.info("Creating 'workUnitCache' bean");
		return new CaffeineCacheFactory(CacheNames.WORK_UNITS);
	}

}
