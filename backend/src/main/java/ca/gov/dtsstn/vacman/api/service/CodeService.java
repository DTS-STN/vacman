package ca.gov.dtsstn.vacman.api.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.CacheConfig.CacheNames;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchFeedbackEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.data.repository.CityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ClassificationRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentEquityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentOpportunityRepository;
import ca.gov.dtsstn.vacman.api.data.repository.EmploymentTenureRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageReferralTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRequirementRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchFeedbackRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import io.micrometer.core.annotation.Counted;

/**
 * Service class for retrieving code table values.
 *
 * This service provides methods to access various code entities,
 * which represent lookup values used throughout the application.
 */
@Service
@Transactional(readOnly = true)
public class CodeService {

	private final CityRepository cityRepository;

	private final ClassificationRepository classificationRepository;

	private final EmploymentEquityRepository employmentEquityRepository;

	private final EmploymentOpportunityRepository employmentOpportunityRepository;

	private final EmploymentTenureRepository employmentTenureRepository;

	private final LanguageReferralTypeRepository languageReferralTypeRepository;

	private final LanguageRepository languageRepository;

	private final LanguageRequirementRepository languageRequirementRepository;

	private final MatchFeedbackRepository matchFeedbackRepository;

	private final MatchStatusRepository matchStatusRepository;

	private final NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;

	private final ProfileStatusRepository profileStatusRepository;

	private final ProvinceRepository provinceRepository;

	private final RequestStatusRepository requestStatusRepository;

	private final SecurityClearanceRepository securityClearanceRepository;

	private final SelectionProcessTypeRepository selectionProcessTypeRepository;

	private final UserTypeRepository userTypeRepository;

	private final WfaStatusRepository wfaStatusRepository;

	private final WorkScheduleRepository workScheduleRepository;

	private final WorkUnitRepository workUnitRepository;

	public CodeService(
			CityRepository cityRepository,
			ClassificationRepository classificationRepository,
			EmploymentEquityRepository employmentEquityRepository,
			EmploymentOpportunityRepository employmentOpportunityRepository,
			EmploymentTenureRepository employmentTenureRepository,
			LanguageRepository languageRepository,
			LanguageReferralTypeRepository languageReferralTypeRepository,
			LanguageRequirementRepository languageRequirementRepository,
			MatchFeedbackRepository matchFeedbackRepository,
			MatchStatusRepository matchStatusRepository,
			NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository,
			ProfileStatusRepository profileStatusRepository,
			ProvinceRepository provinceRepository,
			RequestStatusRepository requestStatusRepository,
			SecurityClearanceRepository securityClearanceRepository,
			SelectionProcessTypeRepository selectionProcessTypeRepository,
			UserTypeRepository userTypeRepository,
			WfaStatusRepository wfaStatusRepository,
			WorkScheduleRepository workScheduleRepository,
			WorkUnitRepository workUnitRepository) {
		this.cityRepository = cityRepository;
		this.classificationRepository = classificationRepository;
		this.employmentEquityRepository = employmentEquityRepository;
		this.employmentOpportunityRepository = employmentOpportunityRepository;
		this.employmentTenureRepository = employmentTenureRepository;
		this.languageRepository = languageRepository;
		this.languageReferralTypeRepository = languageReferralTypeRepository;
		this.languageRequirementRepository = languageRequirementRepository;
		this.nonAdvertisedAppointmentRepository = nonAdvertisedAppointmentRepository;
		this.matchFeedbackRepository = matchFeedbackRepository;
		this.matchStatusRepository = matchStatusRepository;
		this.profileStatusRepository = profileStatusRepository;
		this.provinceRepository = provinceRepository;
		this.requestStatusRepository = requestStatusRepository;
		this.securityClearanceRepository = securityClearanceRepository;
		this.selectionProcessTypeRepository = selectionProcessTypeRepository;
		this.userTypeRepository = userTypeRepository;
		this.wfaStatusRepository = wfaStatusRepository;
		this.workScheduleRepository = workScheduleRepository;
		this.workUnitRepository = workUnitRepository;
	}

	/**
	 * Retrieves a paginated list of cities.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link CityEntity} objects
	 */
	@Counted("service.code.getCities.count")
	@Cacheable(cacheNames = { CacheNames.CITIES })
	public Page<CityEntity> getCities(Pageable pageable) {
		return cityRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of classifications.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link ClassificationEntity} objects
	 */
	@Counted("service.code.getClassifications.count")
	@Cacheable(cacheNames = { CacheNames.CLASSIFICATIONS })
	public Page<ClassificationEntity> getClassifications(Pageable pageable) {
		return classificationRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of employment equities.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link EmploymentEquityEntity} objects
	 */
	@Counted("service.code.getEmploymentEquities.count")
	@Cacheable(cacheNames = { CacheNames.EMPLOYMENT_EQUITIES })
	public Page<EmploymentEquityEntity> getEmploymentEquities(Pageable pageable) {
		return employmentEquityRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of employment opportunities.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link EmploymentOpportunityEntity} objects
	 */
	@Counted("service.code.getEmploymentOpportunities.count")
	@Cacheable(cacheNames = { CacheNames.EMPLOYMENT_OPPORTUNITIES })
	public Page<EmploymentOpportunityEntity> getEmploymentOpportunities(Pageable pageable) {
		return employmentOpportunityRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of employment tenures.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link EmploymentTenureEntity} objects
	 */
	@Counted("service.code.getEmploymentTenures.count")
	@Cacheable(cacheNames = { CacheNames.EMPLOYMENT_TENURES })
	public Page<EmploymentTenureEntity> getEmploymentTenures(Pageable pageable) {
		return employmentTenureRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of language referral types.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link LanguageReferralTypeEntity} objects
	 */
	@Counted("service.code.getLanguageReferralTypes.count")
	@Cacheable(cacheNames = { CacheNames.LANGUAGE_REFERRAL_TYPES })
	public Page<LanguageReferralTypeEntity> getLanguageReferralTypes(Pageable pageable) {
		return languageReferralTypeRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of language requirements.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link LanguageRequirementEntity} objects
	 */
	@Counted("service.code.getLanguageRequirements.count")
	@Cacheable(cacheNames = { CacheNames.LANGUAGE_REQUIREMENTS })
	public Page<LanguageRequirementEntity> getLanguageRequirements(Pageable pageable) {
		return languageRequirementRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of languages.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link LanguageEntity} objects
	 */
	@Counted("service.code.getLanguages.count")
	@Cacheable(cacheNames = { CacheNames.LANGUAGES })
	public Page<LanguageEntity> getLanguages(Pageable pageable) {
		return languageRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of match feedback options.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link MatchFeedbackEntity} objects
	 */
	@Counted("service.code.getMatchFeedbacks.count")
	@Cacheable(cacheNames = { CacheNames.MATCH_FEEDBACKS })
	public Page<MatchFeedbackEntity> getMatchFeedbacks(Pageable pageable) {
		return matchFeedbackRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of match statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link MatchStatusEntity} objects
	 */
	@Counted("service.code.getMatchStatuses.count")
	@Cacheable(cacheNames = { CacheNames.MATCH_STATUSES })
	public Page<MatchStatusEntity> getMatchStatuses(Pageable pageable) {
		return matchStatusRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of non-advertised appointments.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link NonAdvertisedAppointmentEntity} objects
	 */
	@Counted("service.code.getNonAdvertisedAppointments.count")
	@Cacheable(cacheNames = { CacheNames.NON_ADVERTISED_APPOINTMENTS })
	public Page<NonAdvertisedAppointmentEntity> getNonAdvertisedAppointments(Pageable pageable) {
		return nonAdvertisedAppointmentRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of profile statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link ProfileStatusEntity} objects
	 */
	@Counted("service.code.getProfileStatuses.count")
	@Cacheable(cacheNames = { CacheNames.PROFILE_STATUSES })
	public Page<ProfileStatusEntity> getProfileStatuses(Pageable pageable) {
		return profileStatusRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of provinces.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link ProvinceEntity} objects
	 */
	@Counted("service.code.getProvinces.count")
	@Cacheable(cacheNames = { CacheNames.PROVINCES })
	public Page<ProvinceEntity> getProvinces(Pageable pageable) {
		return provinceRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of request statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link RequestStatusEntity} objects
	 */
	@Counted("service.code.getRequestStatuses.count")
	@Cacheable(cacheNames = { CacheNames.REQUEST_STATUSES })
	public Page<RequestStatusEntity> getRequestStatuses(Pageable pageable) {
		return requestStatusRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of security clearances.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link SecurityClearanceEntity} objects
	 */
	@Counted("service.code.getSecurityClearances.count")
	@Cacheable(cacheNames = { CacheNames.SECURITY_CLEARANCES })
	public Page<SecurityClearanceEntity> getSecurityClearances(Pageable pageable) {
		return securityClearanceRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of selection process types.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link SelectionProcessTypeEntity} objects
	 */
	@Counted("service.code.getSelectionProcessTypes.count")
	@Cacheable(cacheNames = { CacheNames.SELECTION_PROCESS_TYPES })
	public Page<SelectionProcessTypeEntity> getSelectionProcessTypes(Pageable pageable) {
		return selectionProcessTypeRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of user types.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link UserTypeEntity} objects
	 */
	@Counted("service.code.getUserTypes.count")
	@Cacheable(cacheNames = { CacheNames.USER_TYPES })
	public Page<UserTypeEntity> getUserTypes(Pageable pageable) {
		return userTypeRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of WFA statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link WfaStatusEntity} objects
	 */
	@Counted("service.code.getWfaStatuses.count")
	@Cacheable(cacheNames = { CacheNames.WFA_STATUSES })
	public Page<WfaStatusEntity> getWfaStatuses(Pageable pageable) {
		return wfaStatusRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of work schedules.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link WorkScheduleEntity} objects
	 */
	@Counted("service.code.getWorkSchedules.count")
	@Cacheable(cacheNames = { CacheNames.WORK_SCHEDULES })
	public Page<WorkScheduleEntity> getWorkSchedules(Pageable pageable) {
		return workScheduleRepository.findAll(pageable);
	}

	/**
	 * Retrieves a paginated list of work units.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link WorkUnitEntity} objects
	 */
	@Counted("service.code.getWorkUnits.count")
	@Cacheable(cacheNames = { CacheNames.WORK_UNITS })
	public Page<WorkUnitEntity> getWorkUnits(Pageable pageable) {
		return workUnitRepository.findAll(pageable);
	}

}
