package ca.gov.dtsstn.vacman.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import ca.gov.dtsstn.vacman.api.config.cache.CaffeineCacheFactory;

@EnableCaching
@Configuration
@ConditionalOnProperty(name = { "application.caching.enabled" })
class CacheConfig {

	private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

	@ConfigurationProperties("application.caching.caches.cities")
	@Bean CaffeineCacheFactory cityCache() {
		log.info("Creating 'cityCache' bean");
		return new CaffeineCacheFactory("cities");
	}

	@ConfigurationProperties("application.caching.caches.classifications")
	@Bean CaffeineCacheFactory classificationCache() {
		log.info("Creating 'classificationCache' bean");
		return new CaffeineCacheFactory("classifications");
	}

	@ConfigurationProperties("application.caching.caches.employment-equities")
	@Bean CaffeineCacheFactory employmentEquityCache() {
		log.info("Creating 'employmentEquityCache' bean");
		return new CaffeineCacheFactory("employment-equities");
	}

	@ConfigurationProperties("application.caching.caches.employment-opportunities")
	@Bean CaffeineCacheFactory employmentOpportunityCache() {
		log.info("Creating 'employmentOpportunityCache' bean");
		return new CaffeineCacheFactory("employment-opportunities");
	}

	@ConfigurationProperties("application.caching.caches.employment-tenures")
	@Bean CaffeineCacheFactory employmentTenureCache() {
		log.info("Creating 'employmentTenureCache' bean");
		return new CaffeineCacheFactory("employment-tenures");
	}

	@ConfigurationProperties("application.caching.caches.languages")
	@Bean CaffeineCacheFactory languageCache() {
		log.info("Creating 'languageCache' bean");
		return new CaffeineCacheFactory("languages");
	}

	@ConfigurationProperties("application.caching.caches.language-referral-types")
	@Bean CaffeineCacheFactory languageReferralTypeCache() {
		log.info("Creating 'languageReferralTypeCache' bean");
		return new CaffeineCacheFactory("language-referral-types");
	}

	@ConfigurationProperties("application.caching.caches.language-requirements")
	@Bean CaffeineCacheFactory languageRequirementCache() {
		log.info("Creating 'languageRequirementCache' bean");
		return new CaffeineCacheFactory("language-requirements");
	}

	@ConfigurationProperties("application.caching.caches.non-advertised-appointments")
	@Bean CaffeineCacheFactory nonAdvertisedAppointmentCache() {
		log.info("Creating 'nonAdvertisedAppointmentCache' bean");
		return new CaffeineCacheFactory("non-advertised-appointments");
	}

	@ConfigurationProperties("application.caching.caches.priority-levels")
	@Bean CaffeineCacheFactory priorityLevelCache() {
		log.info("Creating 'priorityLevelCache' bean");
		return new CaffeineCacheFactory("priority-levels");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.profile-statuses")
	CaffeineCacheFactory profileStatusCache() {
		log.info("Creating 'profileStatusCache' bean");
		return new CaffeineCacheFactory("profile-statuses");
	}

	@ConfigurationProperties("application.caching.caches.provinces")
	@Bean CaffeineCacheFactory provinceCache() {
		log.info("Creating 'provinceCache' bean");
		return new CaffeineCacheFactory("provinces");
	}

	@ConfigurationProperties("application.caching.caches.request-statuses")
	@Bean CaffeineCacheFactory requestStatusCache() {
		log.info("Creating 'requestStatusCache' bean");
		return new CaffeineCacheFactory("request-statuses");
	}

	@ConfigurationProperties("application.caching.caches.security-clearances")
	@Bean CaffeineCacheFactory securityClearanceCache() {
		log.info("Creating 'securityClearanceCache' bean");
		return new CaffeineCacheFactory("security-clearances");
	}

	@ConfigurationProperties("application.caching.caches.selection-process-types")
	@Bean CaffeineCacheFactory selectionProcessTypeCache() {
		log.info("Creating 'selectionProcessTypeCache' bean");
		return new CaffeineCacheFactory("selection-process-types");
	}

	@ConfigurationProperties("application.caching.caches.user-types")
	@Bean CaffeineCacheFactory userTypeCache() {
		log.info("Creating 'userTypeCache' bean");
		return new CaffeineCacheFactory("user-types");
	}

	@ConfigurationProperties("application.caching.caches.wfa-statuses")
	@Bean CaffeineCacheFactory wfaStatusCache() {
		log.info("Creating 'wfaStatusCache' bean");
		return new CaffeineCacheFactory("wfa-statuses");
	}

	@ConfigurationProperties("application.caching.caches.work-schedules")
	@Bean CaffeineCacheFactory workScheduleCache() {
		log.info("Creating 'workScheduleCache' bean");
		return new CaffeineCacheFactory("work-schedules");
	}

	@ConfigurationProperties("application.caching.caches.work-units")
	@Bean CaffeineCacheFactory workUnitCache() {
		log.info("Creating 'workUnitCache' bean");
		return new CaffeineCacheFactory("work-units");
	}

	@ConfigurationProperties("application.caching.caches.match-feedback")
	@Bean CaffeineCacheFactory matchFeedbackCache() {
		log.info("Creating 'matchFeedbackCache' bean");
		return new CaffeineCacheFactory("match-feedback");
	}

}
