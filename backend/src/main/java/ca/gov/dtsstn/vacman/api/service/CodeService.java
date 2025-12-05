package ca.gov.dtsstn.vacman.api.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import ca.gov.dtsstn.vacman.api.data.repository.AbstractCodeRepository;
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
	@Cacheable(cacheNames = { "cities" })
	@Counted("service.code.getCities.count")
	public Page<CityEntity> getCities(Pageable pageable) {
		return getCities(pageable, true);
	}

	/**
	 * Retrieves a paginated list of cities.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link CityEntity} objects
	 */
	@Counted("service.code.getCities.count")
	@Cacheable(cacheNames = { "cities" }, key = "#pageable + '_' + #includeInactive")
	public Page<CityEntity> getCities(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? cityRepository.findAll(pageable)
			: cityRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of classifications.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link ClassificationEntity} objects
	 */
	@Cacheable(cacheNames = { "classifications" })
	@Counted("service.code.getClassifications.count")
	public Page<ClassificationEntity> getClassifications(Pageable pageable) {
		return getClassifications(pageable, true);
	}

	/**
	 * Retrieves a paginated list of classifications.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link ClassificationEntity} objects
	 */
	@Counted("service.code.getClassifications.count")
	@Cacheable(cacheNames = { "classifications" }, key = "#pageable + '_' + #includeInactive")
	public Page<ClassificationEntity> getClassifications(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? classificationRepository.findAll(pageable)
			: classificationRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of employment equities.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link EmploymentEquityEntity} objects
	 */
	@Cacheable(cacheNames = { "employment-equities" })
	@Counted("service.code.getEmploymentEquities.count")
	public Page<EmploymentEquityEntity> getEmploymentEquities(Pageable pageable) {
		return getEmploymentEquities(pageable, true);
	}

	/**
	 * Retrieves a paginated list of employment equities.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link EmploymentEquityEntity} objects
	 */
	@Counted("service.code.getEmploymentEquities.count")
	@Cacheable(cacheNames = { "employment-equities" }, key = "#pageable + '_' + #includeInactive")
	public Page<EmploymentEquityEntity> getEmploymentEquities(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? employmentEquityRepository.findAll(pageable)
			: employmentEquityRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of employment opportunities.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link EmploymentOpportunityEntity} objects
	 */
	@Cacheable(cacheNames = { "employment-opportunities" })
	@Counted("service.code.getEmploymentOpportunities.count")
	public Page<EmploymentOpportunityEntity> getEmploymentOpportunities(Pageable pageable) {
		return getEmploymentOpportunities(pageable, true);
	}

	/**
	 * Retrieves a paginated list of employment opportunities.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link EmploymentOpportunityEntity} objects
	 */
	@Counted("service.code.getEmploymentOpportunities.count")
	@Cacheable(cacheNames = { "employment-opportunities" }, key = "#pageable + '_' + #includeInactive")
	public Page<EmploymentOpportunityEntity> getEmploymentOpportunities(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? employmentOpportunityRepository.findAll(pageable)
			: employmentOpportunityRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of employment tenures.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link EmploymentTenureEntity} objects
	 */
	@Cacheable(cacheNames = { "employment-tenures" })
	@Counted("service.code.getEmploymentTenures.count")
	public Page<EmploymentTenureEntity> getEmploymentTenures(Pageable pageable) {
		return getEmploymentTenures(pageable, true);
	}

	/**
	 * Retrieves a paginated list of employment tenures.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link EmploymentTenureEntity} objects
	 */
	@Counted("service.code.getEmploymentTenures.count")
	@Cacheable(cacheNames = { "employment-tenures" }, key = "#pageable + '_' + #includeInactive")
	public Page<EmploymentTenureEntity> getEmploymentTenures(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? employmentTenureRepository.findAll(pageable)
			: employmentTenureRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of languages.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link LanguageEntity} objects
	 */
	@Cacheable(cacheNames = { "languages" })
	@Counted("service.code.getLanguages.count")
	public Page<LanguageEntity> getLanguages(Pageable pageable) {
		return getLanguages(pageable, true);
	}

	/**
	 * Retrieves a paginated list of languages.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link LanguageEntity} objects
	 */
	@Counted("service.code.getLanguages.count")
	@Cacheable(cacheNames = { "languages" }, key = "#pageable + '_' + #includeInactive")
	public Page<LanguageEntity> getLanguages(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? languageRepository.findAll(pageable)
			: languageRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of language referral types.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link LanguageReferralTypeEntity} objects
	 */
	@Cacheable(cacheNames = { "language-referral-types" })
	@Counted("service.code.getLanguageReferralTypes.count")
	public Page<LanguageReferralTypeEntity> getLanguageReferralTypes(Pageable pageable) {
		return getLanguageReferralTypes(pageable, true);
	}

	/**
	 * Retrieves a paginated list of language referral types.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link LanguageReferralTypeEntity} objects
	 */
	@Counted("service.code.getLanguageReferralTypes.count")
	@Cacheable(cacheNames = { "language-referral-types" }, key = "#pageable + '_' + #includeInactive")
	public Page<LanguageReferralTypeEntity> getLanguageReferralTypes(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? languageReferralTypeRepository.findAll(pageable)
			: languageReferralTypeRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of language requirements.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link LanguageRequirementEntity} objects
	 */
	@Cacheable(cacheNames = { "language-requirements" })
	@Counted("service.code.getLanguageRequirements.count")
	public Page<LanguageRequirementEntity> getLanguageRequirements(Pageable pageable) {
		return getLanguageRequirements(pageable, true);
	}

	/**
	 * Retrieves a paginated list of language requirements.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link LanguageRequirementEntity} objects
	 */
	@Counted("service.code.getLanguageRequirements.count")
	@Cacheable(cacheNames = { "language-requirements" }, key = "#pageable + '_' + #includeInactive")
	public Page<LanguageRequirementEntity> getLanguageRequirements(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? languageRequirementRepository.findAll(pageable)
			: languageRequirementRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of match feedback options.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link MatchFeedbackEntity} objects
	 */
	@Cacheable(cacheNames = { "match-feedbacks" })
	@Counted("service.code.getMatchFeedbacks.count")
	public Page<MatchFeedbackEntity> getMatchFeedbacks(Pageable pageable) {
		return getMatchFeedbacks(pageable, true);
	}

	/**
	 * Retrieves a paginated list of match feedback options.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link MatchFeedbackEntity} objects
	 */
	@Counted("service.code.getMatchFeedbacks.count")
	@Cacheable(cacheNames = { "match-feedbacks" }, key = "#pageable + '_' + #includeInactive")
	public Page<MatchFeedbackEntity> getMatchFeedbacks(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? matchFeedbackRepository.findAll(pageable)
			: matchFeedbackRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of match statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link MatchStatusEntity} objects
	 */
	@Cacheable(cacheNames = { "match-statuses" })
	@Counted("service.code.getMatchStatuses.count")
	public Page<MatchStatusEntity> getMatchStatuses(Pageable pageable) {
		return getMatchStatuses(pageable, true);
	}

	/**
	 * Retrieves a paginated list of match statuses.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link MatchStatusEntity} objects
	 */
	@Counted("service.code.getMatchStatuses.count")
	@Cacheable(cacheNames = { "match-statuses" }, key = "#pageable + '_' + #includeInactive")
	public Page<MatchStatusEntity> getMatchStatuses(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? matchStatusRepository.findAll(pageable)
			: matchStatusRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of non-advertised appointments.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link NonAdvertisedAppointmentEntity} objects
	 */
	@Cacheable(cacheNames = { "non-advertised-appointments" })
	@Counted("service.code.getNonAdvertisedAppointments.count")
	public Page<NonAdvertisedAppointmentEntity> getNonAdvertisedAppointments(Pageable pageable) {
		return getNonAdvertisedAppointments(pageable, true);
	}

	/**
	 * Retrieves a paginated list of non-advertised appointments.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link NonAdvertisedAppointmentEntity} objects
	 */
	@Counted("service.code.getNonAdvertisedAppointments.count")
	@Cacheable(cacheNames = { "non-advertised-appointments" }, key = "#pageable + '_' + #includeInactive")
	public Page<NonAdvertisedAppointmentEntity> getNonAdvertisedAppointments(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? nonAdvertisedAppointmentRepository.findAll(pageable)
			: nonAdvertisedAppointmentRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of profile statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link ProfileStatusEntity} objects
	 */
	@Cacheable(cacheNames = { "profile-statuses" })
	@Counted("service.code.getProfileStatuses.count")
	public Page<ProfileStatusEntity> getProfileStatuses(Pageable pageable) {
		return getProfileStatuses(pageable, true);
	}

	/**
	 * Retrieves a paginated list of profile statuses.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link ProfileStatusEntity} objects
	 */
	@Counted("service.code.getProfileStatuses.count")
	@Cacheable(cacheNames = { "profile-statuses" }, key = "#pageable + '_' + #includeInactive")
	public Page<ProfileStatusEntity> getProfileStatuses(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? profileStatusRepository.findAll(pageable)
			: profileStatusRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of provinces.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link ProvinceEntity} objects
	 */
	@Cacheable(cacheNames = { "provinces" })
	@Counted("service.code.getProvinces.count")
	public Page<ProvinceEntity> getProvinces(Pageable pageable) {
		return getProvinces(pageable, true);
	}

	/**
	 * Retrieves a paginated list of provinces.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link ProvinceEntity} objects
	 */
	@Counted("service.code.getProvinces.count")
	@Cacheable(cacheNames = { "provinces" }, key = "#pageable + '_' + #includeInactive")
	public Page<ProvinceEntity> getProvinces(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? provinceRepository.findAll(pageable)
			: provinceRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of request statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link RequestStatusEntity} objects
	 */
	@Cacheable(cacheNames = { "request-statuses" })
	@Counted("service.code.getRequestStatuses.count")
	public Page<RequestStatusEntity> getRequestStatuses(Pageable pageable) {
		return getRequestStatuses(pageable, true);
	}

	/**
	 * Retrieves a paginated list of request statuses.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link RequestStatusEntity} objects
	 */
	@Counted("service.code.getRequestStatuses.count")
	@Cacheable(cacheNames = { "request-statuses" }, key = "#pageable + '_' + #includeInactive")
	public Page<RequestStatusEntity> getRequestStatuses(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? requestStatusRepository.findAll(pageable)
			: requestStatusRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of security clearances.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link SecurityClearanceEntity} objects
	 */
	@Cacheable(cacheNames = { "security-clearances" })
	@Counted("service.code.getSecurityClearances.count")
	public Page<SecurityClearanceEntity> getSecurityClearances(Pageable pageable) {
		return getSecurityClearances(pageable, true);
	}

	/**
	 * Retrieves a paginated list of security clearances.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link SecurityClearanceEntity} objects
	 */
	@Counted("service.code.getSecurityClearances.count")
	@Cacheable(cacheNames = { "security-clearances" }, key = "#pageable + '_' + #includeInactive")
	public Page<SecurityClearanceEntity> getSecurityClearances(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? securityClearanceRepository.findAll(pageable)
			: securityClearanceRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of selection process types.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link SelectionProcessTypeEntity} objects
	 */
	@Cacheable(cacheNames = { "selection-process-types" })
	@Counted("service.code.getSelectionProcessTypes.count")
	public Page<SelectionProcessTypeEntity> getSelectionProcessTypes(Pageable pageable) {
		return getSelectionProcessTypes(pageable, true);
	}

	/**
	 * Retrieves a paginated list of selection process types.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link SelectionProcessTypeEntity} objects
	 */
	@Counted("service.code.getSelectionProcessTypes.count")
	@Cacheable(cacheNames = { "selection-process-types" }, key = "#pageable + '_' + #includeInactive")
	public Page<SelectionProcessTypeEntity> getSelectionProcessTypes(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? selectionProcessTypeRepository.findAll(pageable)
			: selectionProcessTypeRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of user types.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link UserTypeEntity} objects
	 */
	@Cacheable(cacheNames = { "user-types" })
	@Counted("service.code.getUserTypes.count")
	public Page<UserTypeEntity> getUserTypes(Pageable pageable) {
		return getUserTypes(pageable, true);
	}

	/**
	 * Retrieves a paginated list of user types.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link UserTypeEntity} objects
	 */
	@Counted("service.code.getUserTypes.count")
	@Cacheable(cacheNames = { "user-types" }, key = "#pageable + '_' + #includeInactive")
	public Page<UserTypeEntity> getUserTypes(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? userTypeRepository.findAll(pageable)
			: userTypeRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of WFA statuses.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link WfaStatusEntity} objects
	 */
	@Cacheable(cacheNames = { "wfa-statuses" })
	@Counted("service.code.getWfaStatuses.count")
	public Page<WfaStatusEntity> getWfaStatuses(Pageable pageable) {
		return getWfaStatuses(pageable, true);
	}

	/**
	 * Retrieves a paginated list of WFA statuses.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link WfaStatusEntity} objects
	 */
	@Counted("service.code.getWfaStatuses.count")
	@Cacheable(cacheNames = { "wfa-statuses" }, key = "#pageable + '_' + #includeInactive")
	public Page<WfaStatusEntity> getWfaStatuses(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? wfaStatusRepository.findAll(pageable)
			: wfaStatusRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of work schedules.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link WorkScheduleEntity} objects
	 */
	@Cacheable(cacheNames = { "work-schedules" })
	@Counted("service.code.getWorkSchedules.count")
	public Page<WorkScheduleEntity> getWorkSchedules(Pageable pageable) {
		return getWorkSchedules(pageable, true);
	}

	/**
	 * Retrieves a paginated list of work schedules.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link WorkScheduleEntity} objects
	 */
	@Counted("service.code.getWorkSchedules.count")
	@Cacheable(cacheNames = { "work-schedules" }, key = "#pageable + '_' + #includeInactive")
	public Page<WorkScheduleEntity> getWorkSchedules(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? workScheduleRepository.findAll(pageable)
			: workScheduleRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

	/**
	 * Retrieves a paginated list of work units.
	 *
	 * @param pageable pagination information
	 * @return a page of {@link WorkUnitEntity} objects
	 */
	@Cacheable(cacheNames = { "work-units" })
	@Counted("service.code.getWorkUnits.count")
	public Page<WorkUnitEntity> getWorkUnits(Pageable pageable) {
		return getWorkUnits(pageable, true);
	}

	/**
	 * Retrieves a paginated list of work units.
	 *
	 * @param pageable pagination information
	 * @param includeInactive whether to include inactive codes
	 * @return a page of {@link WorkUnitEntity} objects
	 */
	@Counted("service.code.getWorkUnits.count")
	@Cacheable(cacheNames = { "work-units" }, key = "#pageable + '_' + #includeInactive")
	public Page<WorkUnitEntity> getWorkUnits(Pageable pageable, boolean includeInactive) {
		return includeInactive
			? workUnitRepository.findAll(pageable)
			: workUnitRepository.findAll(AbstractCodeRepository.isActive(), pageable);
	}

}
