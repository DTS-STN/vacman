package ca.gov.dtsstn.vacman.api.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntity;
import ca.gov.dtsstn.vacman.api.data.entity.PriorityLevelEntity;
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
import ca.gov.dtsstn.vacman.api.data.repository.NonAdvertisedAppointmentRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProvinceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SecurityClearanceRepository;
import ca.gov.dtsstn.vacman.api.data.repository.SelectionProcessTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WfaStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkScheduleRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;

@Service
public class CodeService {

	private final CityRepository cityRepository;

	private final ClassificationRepository classificationRepository;

	private final EmploymentEquityRepository employmentEquityRepository;

	private final EmploymentOpportunityRepository employmentOpportunityRepository;

	private final EmploymentTenureRepository employmentTenureRepository;

	private final LanguageRepository languageRepository;

	private final LanguageReferralTypeRepository languageReferralTypeRepository;

	private final LanguageRequirementRepository languageRequirementRepository;

	private final NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository;

	private final PriorityLevelRepository priorityLevelRepository;

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
			NonAdvertisedAppointmentRepository nonAdvertisedAppointmentRepository,
			PriorityLevelRepository priorityLevelRepository,
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
		this.priorityLevelRepository = priorityLevelRepository;
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

	public Page<CityEntity> getAllCities(Pageable pageable) {
		return cityRepository.findAll(pageable);
	}

	public Page<ClassificationEntity> getAllClassifications(Pageable pageable) {
		return classificationRepository.findAll(pageable);
	}

	public Page<EmploymentEquityEntity> getAllEmploymentEquities(Pageable pageable) {
		return employmentEquityRepository.findAll(pageable);
	}

	public Page<EmploymentOpportunityEntity> getAllEmploymentOpportunities(Pageable pageable) {
		return employmentOpportunityRepository.findAll(pageable);
	}

	public Page<EmploymentTenureEntity> getAllEmploymentTenures(Pageable pageable) {
		return employmentTenureRepository.findAll(pageable);
	}

	public Page<LanguageEntity> getAllLanguages(Pageable pageable) {
		return languageRepository.findAll(pageable);
	}

	public Page<LanguageReferralTypeEntity> getAllLanguageReferralTypes(Pageable pageable) {
		return languageReferralTypeRepository.findAll(pageable);
	}

	public Page<LanguageRequirementEntity> getAllLanguageRequirements(Pageable pageable) {
		return languageRequirementRepository.findAll(pageable);
	}

	public Page<NonAdvertisedAppointmentEntity> getAllNonAdvertisedAppointments(Pageable pageable) {
		return nonAdvertisedAppointmentRepository.findAll(pageable);
	}

	public Page<PriorityLevelEntity> getAllPriorityLevels(Pageable pageable) {
		return priorityLevelRepository.findAll(pageable);
	}

	public Page<ProfileStatusEntity> getAllProfileStatuses(Pageable pageable) {
		return profileStatusRepository.findAll(pageable);
	}

	public Page<ProvinceEntity> getAllProvinces(Pageable pageable) {
		return provinceRepository.findAll(pageable);
	}

	public Page<RequestStatusEntity> getAllRequestStatuses(Pageable pageable) {
		return requestStatusRepository.findAll(pageable);
	}

	public Page<SecurityClearanceEntity> getAllSecurityClearances(Pageable pageable) {
		return securityClearanceRepository.findAll(pageable);
	}

	public Page<SelectionProcessTypeEntity> getAllSelectionProcessTypes(Pageable pageable) {
		return selectionProcessTypeRepository.findAll(pageable);
	}

	public Page<UserTypeEntity> getAllUserTypes(Pageable pageable) {
		return userTypeRepository.findAll(pageable);
	}

	public Page<WfaStatusEntity> getAllWfaStatuses(Pageable pageable) {
		return wfaStatusRepository.findAll(pageable);
	}

	public Page<WorkScheduleEntity> getAllWorkSchedules(Pageable pageable) {
		return workScheduleRepository.findAll(pageable);
	}

	public Page<WorkUnitEntity> getAllWorkUnits(Pageable pageable) {
		return workUnitRepository.findAll(pageable);
	}

}
