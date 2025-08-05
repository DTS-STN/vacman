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
public class CacheConfig {

	private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

	@Bean
	@ConfigurationProperties("application.caching.caches.cities")
	public CaffeineCacheFactory cityCache() {
		log.info("Creating 'cityCache' bean");
		return new CaffeineCacheFactory("cities");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.classifications")
	public CaffeineCacheFactory classificationCache() {
		log.info("Creating 'classificationCache' bean");
		return new CaffeineCacheFactory("classifications");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.employment-equities")
	public CaffeineCacheFactory employmentEquityCache() {
		log.info("Creating 'employmentEquityCache' bean");
		return new CaffeineCacheFactory("employment-equities");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.employment-opportunities")
	public CaffeineCacheFactory employmentOpportunityCache() {
		log.info("Creating 'employmentOpportunityCache' bean");
		return new CaffeineCacheFactory("employment-opportunities");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.employment-tenures")
	public CaffeineCacheFactory employmentTenureCache() {
		log.info("Creating 'employmentTenureCache' bean");
		return new CaffeineCacheFactory("employment-tenures");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.languages")
	public CaffeineCacheFactory languageCache() {
		log.info("Creating 'languageCache' bean");
		return new CaffeineCacheFactory("languages");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.language-referral-types")
	public CaffeineCacheFactory languageReferralTypeCache() {
		log.info("Creating 'languageReferralTypeCache' bean");
		return new CaffeineCacheFactory("language-referral-types");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.language-requirements")
	public CaffeineCacheFactory languageRequirementCache() {
		log.info("Creating 'languageRequirementCache' bean");
		return new CaffeineCacheFactory("language-requirements");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.non-advertised-appointments")
	public CaffeineCacheFactory nonAdvertisedAppointmentCache() {
		log.info("Creating 'nonAdvertisedAppointmentCache' bean");
		return new CaffeineCacheFactory("non-advertised-appointments");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.priority-levels")
	public CaffeineCacheFactory priorityLevelCache() {
		log.info("Creating 'priorityLevelCache' bean");
		return new CaffeineCacheFactory("priority-levels");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.profile-statuses")
	public CaffeineCacheFactory profileStatusCache() {
		log.info("Creating 'profileStatusCache' bean");
		return new CaffeineCacheFactory("profile-statuses");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.provinces")
	public CaffeineCacheFactory provinceCache() {
		log.info("Creating 'provinceCache' bean");
		return new CaffeineCacheFactory("provinces");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.request-statuses")
	public CaffeineCacheFactory requestStatusCache() {
		log.info("Creating 'requestStatusCache' bean");
		return new CaffeineCacheFactory("request-statuses");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.security-clearances")
	public CaffeineCacheFactory securityClearanceCache() {
		log.info("Creating 'securityClearanceCache' bean");
		return new CaffeineCacheFactory("security-clearances");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.selection-process-types")
	public CaffeineCacheFactory selectionProcessTypeCache() {
		log.info("Creating 'selectionProcessTypeCache' bean");
		return new CaffeineCacheFactory("selection-process-types");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.user-types")
	public CaffeineCacheFactory userTypeCache() {
		log.info("Creating 'userTypeCache' bean");
		return new CaffeineCacheFactory("user-types");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.wfa-statuses")
	public CaffeineCacheFactory wfaStatusCache() {
		log.info("Creating 'wfaStatusCache' bean");
		return new CaffeineCacheFactory("wfa-statuses");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.work-schedules")
	public CaffeineCacheFactory workScheduleCache() {
		log.info("Creating 'workScheduleCache' bean");
		return new CaffeineCacheFactory("work-schedules");
	}

	@Bean
	@ConfigurationProperties("application.caching.caches.work-units")
	public CaffeineCacheFactory workUnitCache() {
		log.info("Creating 'workUnitCache' bean");
		return new CaffeineCacheFactory("work-units");
	}

}
