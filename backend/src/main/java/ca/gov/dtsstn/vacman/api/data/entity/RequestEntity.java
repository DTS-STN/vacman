package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "Request")
@Table(name = "[REQUEST]")
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_ID]"))
public class RequestEntity extends AbstractBusinessEntity {

	@ManyToOne
	@JoinColumn(name = "[SECURITY_CLEARANCE_ID]", nullable = false)
	private SecurityClearanceEntity securityClearance;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = false)
	private WorkUnitEntity workUnit;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = false)
	private ClassificationEntity classification;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_STATUS_ID]", nullable = false)
	private RequestStatusEntity requestStatus;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_SUBMITTER]", nullable = false)
	private UserEntity submitter;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_HR_ADVISOR]", nullable = false)
	private UserEntity hrAdvisor;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_HIRING_MANAGER]", nullable = false)
	private UserEntity hiringManager;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_SUB_DELEGATED_MANAGER]", nullable = false)
	private UserEntity subDelegatedManager;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = false)
	private LanguageEntity language;

	@ManyToOne
	@JoinColumn(name = "[LNG_REQUIREMENT_ID]", nullable = false)
	private LanguageRequirementEntity languageRequirement;

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_TENURE_ID]", nullable = false)
	private EmploymentTenureEntity employmentTenure;

	@ManyToOne
	@JoinColumn(name = "[SELECTION_PROCESS_TYPE_ID]", nullable = false)
	private SelectionProcessTypeEntity selectionProcessType;

	@ManyToOne
	@JoinColumn(name = "[APPOINTMENT_NON_ADVERTISED_ID]", nullable = false)
	private AppointmentNonAdvertisedEntity appointmentNonAdvertised;

	@ManyToOne
	@JoinColumn(name = "[WORK_SCHEDULE_ID]", nullable = false)
	private WorkScheduleEntity workSchedule;

	@Column(name = "[REQUEST_NAME_EN]", length = 200, nullable = false)
	private String requestNameEn;

	@Column(name = "[REQUEST_NAME_FR]", length = 200, nullable = false)
	private String requestNameFr;

	@Column(name = "[PRIORITY_CLEARANCE_NUMBER]", length = 20, nullable = true)
	private String priorityClearanceNumber;

	@Column(name = "[ALLOW_TELEWORK_IND]", nullable = true)
	private Boolean allowTeleworkIndicator;

	@Column(name = "[START_DATE]", nullable = false)
	private LocalDate startDate;

	@Column(name = "[END_DATE]", nullable = true)
	private LocalDate endDate;

	@Column(name = "[ALTERNATE_CONTACT_EMAIL_ADDRESS]", length = 320, nullable = true)
	private String alternateContactEmailAddress;

	@Column(name = "[REQUEST_NUMBER]", length = 10, nullable = true)
	private String requestNumber;

	@Column(name = "[EMPLOYMENT_EQUITY_NEED_IDENTIFIED_IND]", nullable = true)
	private Boolean employmentEquityNeedIdentifiedIndicator;

	@Column(name = "[SELECTION_PROCESS_NUMBER]", length = 30, nullable = true)
	private String selectionProcessNumber;

	@Column(name = "[POSITION_NUMBER]", length = 100, nullable = true)
	private String positionNumber;

	@Column(name = "[LANGUAGE_PROFILE_EN]", length = 3, nullable = true)
	private String languageProfileEn;

	@Column(name = "[LANGUAGE_PROFILE_FR]", length = 3, nullable = true)
	private String languageProfileFr;

	@Column(name = "[SOMC_AND_CONDITION_EMPLOYMENT_EN]", nullable = true)
	private String somcAndConditionEmploymentEn;

	@Column(name = "[SOMC_AND_CONDITION_EMPLOYMENT_FR]", nullable = true)
	private String somcAndConditionEmploymentFr;

	@Column(name = "[ADDITIONAL_COMMENT]", length = 100, nullable = true)
	private String additionalComment;

	// Collection relationships for many-to-many tables
	@OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RequestCityEntity> requestCities = new ArrayList<>();

	@OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RequestEmploymentEquityEntity> requestEmploymentEquities = new ArrayList<>();

	public RequestEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEntity(
			@Nullable Long id,
			@Nullable SecurityClearanceEntity securityClearance,
			@Nullable WorkUnitEntity workUnit,
			@Nullable ClassificationEntity classification,
			@Nullable RequestStatusEntity requestStatus,
			@Nullable UserEntity submitter,
			@Nullable UserEntity hrAdvisor,
			@Nullable UserEntity hiringManager,
			@Nullable UserEntity subDelegatedManager,
			@Nullable LanguageEntity language,
			@Nullable LanguageRequirementEntity languageRequirement,
			@Nullable EmploymentTenureEntity employmentTenure,
			@Nullable SelectionProcessTypeEntity selectionProcessType,
			@Nullable AppointmentNonAdvertisedEntity appointmentNonAdvertised,
			@Nullable WorkScheduleEntity workSchedule,
			@Nullable String requestNameEn,
			@Nullable String requestNameFr,
			@Nullable String priorityClearanceNumber,
			@Nullable Boolean allowTeleworkIndicator,
			@Nullable LocalDate startDate,
			@Nullable LocalDate endDate,
			@Nullable String alternateContactEmailAddress,
			@Nullable String requestNumber,
			@Nullable Boolean employmentEquityNeedIdentifiedIndicator,
			@Nullable String selectionProcessNumber,
			@Nullable String positionNumber,
			@Nullable String languageProfileEn,
			@Nullable String languageProfileFr,
			@Nullable String somcAndConditionEmploymentEn,
			@Nullable String somcAndConditionEmploymentFr,
			@Nullable String additionalComment,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.securityClearance = securityClearance;
		this.workUnit = workUnit;
		this.classification = classification;
		this.requestStatus = requestStatus;
		this.submitter = submitter;
		this.hrAdvisor = hrAdvisor;
		this.hiringManager = hiringManager;
		this.subDelegatedManager = subDelegatedManager;
		this.language = language;
		this.languageRequirement = languageRequirement;
		this.employmentTenure = employmentTenure;
		this.selectionProcessType = selectionProcessType;
		this.appointmentNonAdvertised = appointmentNonAdvertised;
		this.workSchedule = workSchedule;
		this.requestNameEn = requestNameEn;
		this.requestNameFr = requestNameFr;
		this.priorityClearanceNumber = priorityClearanceNumber;
		this.allowTeleworkIndicator = allowTeleworkIndicator;
		this.startDate = startDate;
		this.endDate = endDate;
		this.alternateContactEmailAddress = alternateContactEmailAddress;
		this.requestNumber = requestNumber;
		this.employmentEquityNeedIdentifiedIndicator = employmentEquityNeedIdentifiedIndicator;
		this.selectionProcessNumber = selectionProcessNumber;
		this.positionNumber = positionNumber;
		this.languageProfileEn = languageProfileEn;
		this.languageProfileFr = languageProfileFr;
		this.somcAndConditionEmploymentEn = somcAndConditionEmploymentEn;
		this.somcAndConditionEmploymentFr = somcAndConditionEmploymentFr;
		this.additionalComment = additionalComment;
	}

	public SecurityClearanceEntity getSecurityClearance() {
		return securityClearance;
	}

	public void setSecurityClearance(SecurityClearanceEntity securityClearance) {
		this.securityClearance = securityClearance;
	}

	public WorkUnitEntity getWorkUnit() {
		return workUnit;
	}

	public void setWorkUnit(WorkUnitEntity workUnit) {
		this.workUnit = workUnit;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public RequestStatusEntity getRequestStatus() {
		return requestStatus;
	}

	public void setRequestStatus(RequestStatusEntity requestStatus) {
		this.requestStatus = requestStatus;
	}

	public UserEntity getSubmitter() {
		return submitter;
	}

	public void setSubmitter(UserEntity submitter) {
		this.submitter = submitter;
	}

	public UserEntity getHrAdvisor() {
		return hrAdvisor;
	}

	public void setHrAdvisor(UserEntity hrAdvisor) {
		this.hrAdvisor = hrAdvisor;
	}

	public UserEntity getHiringManager() {
		return hiringManager;
	}

	public void setHiringManager(UserEntity hiringManager) {
		this.hiringManager = hiringManager;
	}

	public UserEntity getSubDelegatedManager() {
		return subDelegatedManager;
	}

	public void setSubDelegatedManager(UserEntity subDelegatedManager) {
		this.subDelegatedManager = subDelegatedManager;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
	}

	public LanguageRequirementEntity getLanguageRequirement() {
		return languageRequirement;
	}

	public void setLanguageRequirement(LanguageRequirementEntity languageRequirement) {
		this.languageRequirement = languageRequirement;
	}

	public EmploymentTenureEntity getEmploymentTenure() {
		return employmentTenure;
	}

	public void setEmploymentTenure(EmploymentTenureEntity employmentTenure) {
		this.employmentTenure = employmentTenure;
	}

	public SelectionProcessTypeEntity getSelectionProcessType() {
		return selectionProcessType;
	}

	public void setSelectionProcessType(SelectionProcessTypeEntity selectionProcessType) {
		this.selectionProcessType = selectionProcessType;
	}

	public AppointmentNonAdvertisedEntity getAppointmentNonAdvertised() {
		return appointmentNonAdvertised;
	}

	public void setAppointmentNonAdvertised(AppointmentNonAdvertisedEntity appointmentNonAdvertised) {
		this.appointmentNonAdvertised = appointmentNonAdvertised;
	}

	public WorkScheduleEntity getWorkSchedule() {
		return workSchedule;
	}

	public void setWorkSchedule(WorkScheduleEntity workSchedule) {
		this.workSchedule = workSchedule;
	}

	public String getRequestNameEn() {
		return requestNameEn;
	}

	public void setRequestNameEn(String requestNameEn) {
		this.requestNameEn = requestNameEn;
	}

	public String getRequestNameFr() {
		return requestNameFr;
	}

	public void setRequestNameFr(String requestNameFr) {
		this.requestNameFr = requestNameFr;
	}

	public String getPriorityClearanceNumber() {
		return priorityClearanceNumber;
	}

	public void setPriorityClearanceNumber(String priorityClearanceNumber) {
		this.priorityClearanceNumber = priorityClearanceNumber;
	}

	public Boolean getAllowTeleworkIndicator() {
		return allowTeleworkIndicator;
	}

	public void setAllowTeleworkIndicator(Boolean allowTeleworkIndicator) {
		this.allowTeleworkIndicator = allowTeleworkIndicator;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public String getAlternateContactEmailAddress() {
		return alternateContactEmailAddress;
	}

	public void setAlternateContactEmailAddress(String alternateContactEmailAddress) {
		this.alternateContactEmailAddress = alternateContactEmailAddress;
	}

	public String getRequestNumber() {
		return requestNumber;
	}

	public void setRequestNumber(String requestNumber) {
		this.requestNumber = requestNumber;
	}

	public Boolean getEmploymentEquityNeedIdentifiedIndicator() {
		return employmentEquityNeedIdentifiedIndicator;
	}

	public void setEmploymentEquityNeedIdentifiedIndicator(Boolean employmentEquityNeedIdentifiedIndicator) {
		this.employmentEquityNeedIdentifiedIndicator = employmentEquityNeedIdentifiedIndicator;
	}

	public String getSelectionProcessNumber() {
		return selectionProcessNumber;
	}

	public void setSelectionProcessNumber(String selectionProcessNumber) {
		this.selectionProcessNumber = selectionProcessNumber;
	}

	public String getPositionNumber() {
		return positionNumber;
	}

	public void setPositionNumber(String positionNumber) {
		this.positionNumber = positionNumber;
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

	public void setLanguageProfileFr(String languageProfileFr) {
		this.languageProfileFr = languageProfileFr;
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

	public String getAdditionalComment() {
		return additionalComment;
	}

	public void setAdditionalComment(String additionalComment) {
		this.additionalComment = additionalComment;
	}

	public List<RequestCityEntity> getRequestCities() {
		return requestCities;
	}

	public void setRequestCities(List<RequestCityEntity> requestCities) {
		this.requestCities = requestCities;
	}

	public List<RequestEmploymentEquityEntity> getRequestEmploymentEquities() {
		return requestEmploymentEquities;
	}

	public void setRequestEmploymentEquities(List<RequestEmploymentEquityEntity> requestEmploymentEquities) {
		this.requestEmploymentEquities = requestEmploymentEquities;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("securityClearance", securityClearance)
			.append("workUnit", workUnit)
			.append("classification", classification)
			.append("requestStatus", requestStatus)
			.append("submitter", submitter)
			.append("hrAdvisor", hrAdvisor)
			.append("hiringManager", hiringManager)
			.append("subDelegatedManager", subDelegatedManager)
			.append("language", language)
			.append("languageRequirement", languageRequirement)
			.append("employmentTenure", employmentTenure)
			.append("selectionProcessType", selectionProcessType)
			.append("appointmentNonAdvertised", appointmentNonAdvertised)
			.append("workSchedule", workSchedule)
			.append("requestNameEn", requestNameEn)
			.append("requestNameFr", requestNameFr)
			.append("priorityClearanceNumber", priorityClearanceNumber)
			.append("allowTeleworkIndicator", allowTeleworkIndicator)
			.append("startDate", startDate)
			.append("endDate", endDate)
			.append("alternateContactEmailAddress", alternateContactEmailAddress)
			.append("requestNumber", requestNumber)
			.append("employmentEquityNeedIdentifiedIndicator", employmentEquityNeedIdentifiedIndicator)
			.append("selectionProcessNumber", selectionProcessNumber)
			.append("positionNumber", positionNumber)
			.append("languageProfileEn", languageProfileEn)
			.append("languageProfileFr", languageProfileFr)
			.append("somcAndConditionEmploymentEn", somcAndConditionEmploymentEn)
			.append("somcAndConditionEmploymentFr", somcAndConditionEmploymentFr)
			.append("additionalComment", additionalComment)
			.toString();
	}

}
