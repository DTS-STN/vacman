package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "Request")
@Table(name = "[REQUEST]")
public class RequestEntity extends AbstractBaseEntity implements Ownable {

	@Column(name = "[ADDITIONAL_COMMENT]", length = 100)
	private String additionalComment;

	@Column(name = "[ALTERNATE_CONTACT_EMAIL_ADDRESS]", length = 320)
	private String alternateContactEmailAddress;

	@ManyToOne
	@JoinColumn(name = "[APPOINTMENT_NON_ADVERTISED_ID]")
	private NonAdvertisedAppointmentEntity appointmentNonAdvertised;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]")
	private ClassificationEntity classification;

	@Column(name = "[EMPLOYMENT_EQUITY_NEED_IDENTIFIED_IND]")
	private Boolean employmentEquityNeedIdentifiedIndicator;

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_TENURE_ID]")
	private EmploymentTenureEntity employmentTenure;

	@Column(name = "[END_DATE]")
	private LocalDate endDate;

	@Column(name = "[HAS_PRVS_PRFRMD_DTS_IND]")
	private Boolean hasPerformedSameDuties;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_HIRING_MANAGER]")
	private UserEntity hiringManager;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_HR_ADVISOR]")
	private UserEntity hrAdvisor;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]")
	private LanguageEntity language;

	@Column(name = "[LANGUAGE_PROFILE_EN]", length = 3)
	private String languageProfileEn;

	@Column(name = "[LANGUAGE_PROFILE_FR]", length = 3)
	private String languageProfileFr;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_REQUIREMENT_ID]")
	private LanguageRequirementEntity languageRequirement;

	@Column(name = "[POSITION_NUMBER]", length = 100)
	private String positionNumber;

	@Column(name = "[PRIORITY_CLEARANCE_NUMBER]", length = 20)
	private String priorityClearanceNumber;

	@Column(name = "[APPT_RSLT_PRRT_ENTTLMNT_IND]")
	private Boolean priorityEntitlement;

	@Column(name = "[APPT_RSLT_PRRT_ENTTLMNT_RTNL]", length = 200)
	private String priorityEntitlementRationale;

	@OneToMany(mappedBy = "request", cascade = { CascadeType.ALL }, orphanRemoval = true)
	private Set<RequestCityEntity> requestCities = new HashSet<>();

	@OneToMany(mappedBy = "request", cascade = { CascadeType.ALL }, orphanRemoval = true)
	private Set<RequestEmploymentEquityEntity> requestEmploymentEquities = new HashSet<>();

	@Column(name = "[NAME_EN]", length = 200)
	private String nameEn;

	@Column(name = "[NAME_FR]", length = 200)
	private String nameFr;

	@Column(name = "[REQUEST_NUMBER]", length = 10)
	private String requestNumber;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_STATUS_ID]", nullable = false)
	private RequestStatusEntity requestStatus;

	@ManyToOne
	@JoinColumn(name = "[SECURITY_CLEARANCE_ID]")
	private SecurityClearanceEntity securityClearance;

	@Column(name = "[SELECTION_PROCESS_NUMBER]", length = 30)
	private String selectionProcessNumber;

	@ManyToOne
	@JoinColumn(name = "[SELECTION_PROCESS_TYPE_ID]")
	private SelectionProcessTypeEntity selectionProcessType;

	@Column(name = "[SOMC_AND_CONDITION_EMPLOYMENT_EN]")
	private String somcAndConditionEmploymentEn;

	@Column(name = "[SOMC_AND_CONDITION_EMPLOYMENT_FR]")
	private String somcAndConditionEmploymentFr;

	@Column(name = "[START_DATE]")
	private LocalDate startDate;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_SUB_DELEGATED_MANAGER]")
	private UserEntity subDelegatedManager;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_SUBMITTER]", nullable = false)
	private UserEntity submitter;

	@Column(name = "[ALLOW_TELEWORK_IND]")
	private Boolean teleworkAllowed;

	@Column(name = "[APPR_RCV_WMC_PMLC_IND]")
	private Boolean workforceMgmtApprovalRecvd;

	@ManyToOne
	@JoinColumn(name = "[WORK_SCHEDULE_ID]")
	private WorkScheduleEntity workSchedule;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]")
	private WorkUnitEntity workUnit;

	public RequestEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEntity(
			@Nullable Long id,
			@Nullable String additionalComment,
			@Nullable String alternateContactEmailAddress,
			@Nullable NonAdvertisedAppointmentEntity appointmentNonAdvertised,
			@Nullable ClassificationEntity classification,
			@Nullable Boolean employmentEquityNeedIdentifiedIndicator,
			@Nullable EmploymentTenureEntity employmentTenure,
			@Nullable LocalDate endDate,
			@Nullable Boolean hasPerformedSameDuties,
			@Nullable UserEntity hiringManager,
			@Nullable UserEntity hrAdvisor,
			@Nullable LanguageEntity language,
			@Nullable String languageProfileEn,
			@Nullable String languageProfileFr,
			@Nullable LanguageRequirementEntity languageRequirement,
			@Nullable String positionNumber,
			@Nullable String priorityClearanceNumber,
			@Nullable Boolean priorityEntitlement,
			@Nullable String priorityEntitlementRationale,
			@Nullable Set<RequestCityEntity> requestCities,
			@Nullable Set<RequestEmploymentEquityEntity> requestEmploymentEquities,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable String requestNumber,
			@Nullable RequestStatusEntity requestStatus,
			@Nullable SecurityClearanceEntity securityClearance,
			@Nullable String selectionProcessNumber,
			@Nullable SelectionProcessTypeEntity selectionProcessType,
			@Nullable String somcAndConditionEmploymentEn,
			@Nullable String somcAndConditionEmploymentFr,
			@Nullable LocalDate startDate,
			@Nullable UserEntity subDelegatedManager,
			@Nullable UserEntity submitter,
			@Nullable Boolean teleworkAllowed,
			@Nullable Boolean workforceMgmtApprovalRecvd,
			@Nullable WorkScheduleEntity workSchedule,
			@Nullable WorkUnitEntity workUnit,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.additionalComment = additionalComment;
		this.alternateContactEmailAddress = alternateContactEmailAddress;
		this.appointmentNonAdvertised = appointmentNonAdvertised;
		this.classification = classification;
		this.employmentEquityNeedIdentifiedIndicator = employmentEquityNeedIdentifiedIndicator;
		this.employmentTenure = employmentTenure;
		this.endDate = endDate;
		this.hasPerformedSameDuties = hasPerformedSameDuties;
		this.hiringManager = hiringManager;
		this.hrAdvisor = hrAdvisor;
		this.language = language;
		this.languageProfileEn = languageProfileEn;
		this.languageProfileFr = languageProfileFr;
		this.languageRequirement = languageRequirement;
		this.positionNumber = positionNumber;
		this.priorityClearanceNumber = priorityClearanceNumber;
		this.priorityEntitlement = priorityEntitlement;
		this.priorityEntitlementRationale = priorityEntitlementRationale;
		this.requestCities = requestCities;
		this.requestEmploymentEquities = requestEmploymentEquities;
		this.nameEn = nameEn;
		this.nameFr = nameFr;
		this.requestNumber = requestNumber;
		this.requestStatus = requestStatus;
		this.securityClearance = securityClearance;
		this.selectionProcessNumber = selectionProcessNumber;
		this.selectionProcessType = selectionProcessType;
		this.somcAndConditionEmploymentEn = somcAndConditionEmploymentEn;
		this.somcAndConditionEmploymentFr = somcAndConditionEmploymentFr;
		this.startDate = startDate;
		this.subDelegatedManager = subDelegatedManager;
		this.submitter = submitter;
		this.teleworkAllowed = teleworkAllowed;
		this.workforceMgmtApprovalRecvd = workforceMgmtApprovalRecvd;
		this.workSchedule = workSchedule;
		this.workUnit = workUnit;
	}

	public String getAdditionalComment() {
		return additionalComment;
	}

	public void setAdditionalComment(String additionalComment) {
		this.additionalComment = additionalComment;
	}

	public String getAlternateContactEmailAddress() {
		return alternateContactEmailAddress;
	}

	public void setAlternateContactEmailAddress(String alternateContactEmailAddress) {
		this.alternateContactEmailAddress = alternateContactEmailAddress;
	}

	public NonAdvertisedAppointmentEntity getAppointmentNonAdvertised() {
		return appointmentNonAdvertised;
	}

	public void setAppointmentNonAdvertised(NonAdvertisedAppointmentEntity appointmentNonAdvertised) {
		this.appointmentNonAdvertised = appointmentNonAdvertised;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public Boolean getEmploymentEquityNeedIdentifiedIndicator() {
		return employmentEquityNeedIdentifiedIndicator;
	}

	public void setEmploymentEquityNeedIdentifiedIndicator(Boolean employmentEquityNeedIdentifiedIndicator) {
		this.employmentEquityNeedIdentifiedIndicator = employmentEquityNeedIdentifiedIndicator;
	}

	public EmploymentTenureEntity getEmploymentTenure() {
		return employmentTenure;
	}

	public void setEmploymentTenure(EmploymentTenureEntity employmentTenure) {
		this.employmentTenure = employmentTenure;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public Boolean getHasPerformedSameDuties() {
		return hasPerformedSameDuties;
	}

	public void setHasPerformedSameDuties(Boolean hasPerformedSameDuties) {
		this.hasPerformedSameDuties = hasPerformedSameDuties;
	}

	public UserEntity getHiringManager() {
		return hiringManager;
	}

	public void setHiringManager(UserEntity hiringManager) {
		this.hiringManager = hiringManager;
	}

	public UserEntity getHrAdvisor() {
		return hrAdvisor;
	}

	public void setHrAdvisor(UserEntity hrAdvisor) {
		this.hrAdvisor = hrAdvisor;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
	}

	public String getLanguageProfileEn() {
		return languageProfileEn;
	}

	public void setLanguageProfileEn(String languageProfileEn) {
		this.languageProfileEn = languageProfileEn;
	}

	public String getLanguageProfileFr() {
		return languageProfileFr;
	}

	public LanguageRequirementEntity getLanguageRequirement() {
		return languageRequirement;
	}

	public void setLanguageRequirement(LanguageRequirementEntity languageRequirement) {
		this.languageRequirement = languageRequirement;
	}

	public String getPositionNumber() {
		return positionNumber;
	}

	public void setPositionNumber(String positionNumber) {
		this.positionNumber = positionNumber;
	}

	public String getPriorityClearanceNumber() {
		return priorityClearanceNumber;
	}

	public void setPriorityClearanceNumber(String priorityClearanceNumber) {
		this.priorityClearanceNumber = priorityClearanceNumber;
	}

	public Boolean getPriorityEntitlement() {
		return priorityEntitlement;
	}

	public void setPriorityEntitlement(Boolean priorityEntitlement) {
		this.priorityEntitlement = priorityEntitlement;
	}

	public String getPriorityEntitlementRationale() {
		return priorityEntitlementRationale;
	}

	public void setPriorityEntitlementRationale(String priorityEntitlementRationale) {
		this.priorityEntitlementRationale = priorityEntitlementRationale;
	}

	public Set<RequestCityEntity> getRequestCities() {
		return requestCities;
	}

	public void setRequestCities(Set<RequestCityEntity> requestCities) {
		this.requestCities = requestCities;
	}

	public Set<RequestEmploymentEquityEntity> getRequestEmploymentEquities() {
		return requestEmploymentEquities;
	}

	public void setRequestEmploymentEquities(Set<RequestEmploymentEquityEntity> requestEmploymentEquities) {
		this.requestEmploymentEquities = requestEmploymentEquities;
	}

	public String getNameEn() {
		return nameEn;
	}

	public void setNameEn(String requestNameEn) {
		this.nameEn = requestNameEn;
	}

	public String getNameFr() {
		return nameFr;
	}

	public void setNameFr(String requestNameFr) {
		this.nameFr = requestNameFr;
	}

	public String getRequestNumber() {
		return requestNumber;
	}

	public void setRequestNumber(String requestNumber) {
		this.requestNumber = requestNumber;
	}

	public RequestStatusEntity getRequestStatus() {
		return requestStatus;
	}

	public void setRequestStatus(RequestStatusEntity requestStatus) {
		this.requestStatus = requestStatus;
	}

	public SecurityClearanceEntity getSecurityClearance() {
		return securityClearance;
	}

	public void setSecurityClearance(SecurityClearanceEntity securityClearance) {
		this.securityClearance = securityClearance;
	}

	public String getSelectionProcessNumber() {
		return selectionProcessNumber;
	}

	public void setSelectionProcessNumber(String selectionProcessNumber) {
		this.selectionProcessNumber = selectionProcessNumber;
	}

	public SelectionProcessTypeEntity getSelectionProcessType() {
		return selectionProcessType;
	}

	public void setSelectionProcessType(SelectionProcessTypeEntity selectionProcessType) {
		this.selectionProcessType = selectionProcessType;
	}

	public String getSomcAndConditionEmploymentEn() {
		return somcAndConditionEmploymentEn;
	}

	public void setSomcAndConditionEmploymentEn(String somcAndConditionEmploymentEn) {
		this.somcAndConditionEmploymentEn = somcAndConditionEmploymentEn;
	}

	public String getSomcAndConditionEmploymentFr() {
		return somcAndConditionEmploymentFr;
	}

	public void setSomcAndConditionEmploymentFr(String somcAndConditionEmploymentFr) {
		this.somcAndConditionEmploymentFr = somcAndConditionEmploymentFr;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public UserEntity getSubDelegatedManager() {
		return subDelegatedManager;
	}

	public void setSubDelegatedManager(UserEntity subDelegatedManager) {
		this.subDelegatedManager = subDelegatedManager;
	}

	public UserEntity getSubmitter() {
		return submitter;
	}

	public void setSubmitter(UserEntity submitter) {
		this.submitter = submitter;
	}

	public Boolean getTeleworkAllowed() {
		return teleworkAllowed;
	}

	public void setTeleworkAllowed(Boolean teleworkAllowed) {
		this.teleworkAllowed = teleworkAllowed;
	}

	public Boolean getWorkforceMgmtApprovalRecvd() {
		return workforceMgmtApprovalRecvd;
	}

	public void setWorkforceMgmtApprovalRecvd(Boolean workforceMgmtApprovalRecvd) {
		this.workforceMgmtApprovalRecvd = workforceMgmtApprovalRecvd;
	}

	public WorkScheduleEntity getWorkSchedule() {
		return workSchedule;
	}

	public void setWorkSchedule(WorkScheduleEntity workSchedule) {
		this.workSchedule = workSchedule;
	}

	public WorkUnitEntity getWorkUnit() {
		return workUnit;
	}

	public void setWorkUnit(WorkUnitEntity workUnit) {
		this.workUnit = workUnit;
	}

	@Override
	public Long getOwnerId() {
		return Optional.ofNullable(submitter)
			.map(UserEntity::getId)
			.orElse(null);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("additionalComment", additionalComment)
			.append("alternateContactEmailAddress", alternateContactEmailAddress)
			.append("appointmentNonAdvertised", appointmentNonAdvertised)
			.append("classification", classification)
			.append("employmentEquityNeedIdentifiedIndicator", employmentEquityNeedIdentifiedIndicator)
			.append("employmentTenure", employmentTenure)
			.append("endDate", endDate)
			.append("hasPerformedSameDuties", hasPerformedSameDuties)
			.append("hrAdvisor", hrAdvisor)
			.append("hiringManager", hiringManager)
			.append("language", language)
			.append("languageProfileEn", languageProfileEn)
			.append("languageProfileFr", languageProfileFr)
			.append("languageRequirement", languageRequirement)
			.append("positionNumber", positionNumber)
			.append("priorityClearanceNumber", priorityClearanceNumber)
			.append("priorityEntitlement", priorityEntitlement)
			.append("priorityEntitlementRationale", priorityEntitlementRationale)
			.append("requestCities", requestCities)
			.append("requestEmploymentEquities", requestEmploymentEquities)
			.append("nameEn", nameEn)
			.append("nameFr", nameFr)
			.append("requestNumber", requestNumber)
			.append("requestStatus", requestStatus)
			.append("securityClearance", securityClearance)
			.append("selectionProcessNumber", selectionProcessNumber)
			.append("selectionProcessType", selectionProcessType)
			.append("somcAndConditionEmploymentEn", somcAndConditionEmploymentEn)
			.append("somcAndConditionEmploymentFr", somcAndConditionEmploymentFr)
			.append("startDate", startDate)
			.append("subDelegatedManager", subDelegatedManager)
			.append("submitter", submitter)
			.append("teleworkAllowed", teleworkAllowed)
			.append("workforceMgmtApprovalRecvd", workforceMgmtApprovalRecvd)
			.append("workSchedule", workSchedule)
			.append("workUnit", workUnit)
			.toString();
	}

}