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
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_ID]", columnDefinition = "NUMERIC(10) IDENTITY NOT FOR REPLICATION"))
public class RequestEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[SECURITY_CLEARANCE_ID]", nullable = false)
	private SecurityClearanceEntity securityClearance;

	@ManyToOne
	@JoinColumn(name = "[PERSON_ID_REVIEWED_BY]", nullable = false)
	private UserEntity reviewedBy;

	@ManyToOne
	@JoinColumn(name = "[PERSON_ID_APPROVED_BY]", nullable = false)
	private UserEntity approvedBy;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = false)
	private WorkUnitEntity workUnit;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = false)
	private ClassificationEntity classification;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_STATUS_ID]", nullable = false)
	private RequestStatusEntity requestStatus;

	@Column(name = "[REQUEST_NAME_EN]", length = 200, nullable = false)
	private String requestNameEn;

	@Column(name = "[REQUEST_NAME_FR]", length = 200, nullable = false)
	private String requestNameFr;

	@Column(name = "[EDUCATIONAL_REQUIREMENT_TXT]", length = 200, nullable = true)
	private String educationalRequirementText;

	@Column(name = "[PRIORITY_CLEARANCE_NUMBER]", length = 20, nullable = true)
	private String priorityClearanceNumber;

	@Column(name = "[REQUEST_POSTING_DATE]", nullable = true)
	private LocalDate requestPostingDate;

	@Column(name = "[ALLOW_TELEWORK_IND]", nullable = true)
	private Boolean allowTeleworkIndicator;

	@Column(name = "[START_DATE]", nullable = false)
	private LocalDate startDate;

	@Column(name = "[END_DATE]", nullable = true)
	private LocalDate endDate;

	// Collection relationships for many-to-many tables
	@OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RequestCityEntity> requestCities = new ArrayList<>();

	@OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RequestEmploymentTenureEntity> employmentTenures = new ArrayList<>();

	@OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<RequestLanguageReferralTypeEntity> languageReferralTypes = new ArrayList<>();

	@OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProfileRequestEntity> profileRequests = new ArrayList<>();

	public RequestEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEntity(
			@Nullable Long id,
			@Nullable SecurityClearanceEntity securityClearance,
			@Nullable UserEntity reviewedBy,
			@Nullable UserEntity approvedBy,
			@Nullable WorkUnitEntity workUnit,
			@Nullable ClassificationEntity classification,
			@Nullable RequestStatusEntity requestStatus,
			@Nullable String requestNameEn,
			@Nullable String requestNameFr,
			@Nullable String educationalRequirementText,
			@Nullable String priorityClearanceNumber,
			@Nullable LocalDate requestPostingDate,
			@Nullable Boolean allowTeleworkIndicator,
			@Nullable LocalDate startDate,
			@Nullable LocalDate endDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.securityClearance = securityClearance;
		this.reviewedBy = reviewedBy;
		this.approvedBy = approvedBy;
		this.workUnit = workUnit;
		this.classification = classification;
		this.requestStatus = requestStatus;
		this.requestNameEn = requestNameEn;
		this.requestNameFr = requestNameFr;
		this.educationalRequirementText = educationalRequirementText;
		this.priorityClearanceNumber = priorityClearanceNumber;
		this.requestPostingDate = requestPostingDate;
		this.allowTeleworkIndicator = allowTeleworkIndicator;
		this.startDate = startDate;
		this.endDate = endDate;
	}

	public SecurityClearanceEntity getSecurityClearance() {
		return securityClearance;
	}

	public void setSecurityClearance(SecurityClearanceEntity securityClearance) {
		this.securityClearance = securityClearance;
	}

	public UserEntity getReviewedBy() {
		return reviewedBy;
	}

	public void setReviewedBy(UserEntity reviewedBy) {
		this.reviewedBy = reviewedBy;
	}

	public UserEntity getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(UserEntity approvedBy) {
		this.approvedBy = approvedBy;
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

	public String getEducationalRequirementText() {
		return educationalRequirementText;
	}

	public void setEducationalRequirementText(String educationalRequirementText) {
		this.educationalRequirementText = educationalRequirementText;
	}

	public String getPriorityClearanceNumber() {
		return priorityClearanceNumber;
	}

	public void setPriorityClearanceNumber(String priorityClearanceNumber) {
		this.priorityClearanceNumber = priorityClearanceNumber;
	}

	public LocalDate getRequestPostingDate() {
		return requestPostingDate;
	}

	public void setRequestPostingDate(LocalDate requestPostingDate) {
		this.requestPostingDate = requestPostingDate;
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

	public List<RequestCityEntity> getRequestCities() {
		return requestCities;
	}

	public void setRequestCities(List<RequestCityEntity> requestCities) {
		this.requestCities = requestCities;
	}

	public List<RequestEmploymentTenureEntity> getEmploymentTenures() {
		return employmentTenures;
	}

	public void setEmploymentTenures(List<RequestEmploymentTenureEntity> employmentTenures) {
		this.employmentTenures = employmentTenures;
	}

	public List<RequestLanguageReferralTypeEntity> getLanguageReferralTypes() {
		return languageReferralTypes;
	}

	public void setLanguageReferralTypes(List<RequestLanguageReferralTypeEntity> languageReferralTypes) {
		this.languageReferralTypes = languageReferralTypes;
	}

	public List<ProfileRequestEntity> getProfileRequests() {
		return profileRequests;
	}

	public void setProfileRequests(List<ProfileRequestEntity> profileRequests) {
		this.profileRequests = profileRequests;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("securityClearance", securityClearance)
			.append("reviewedBy", reviewedBy)
			.append("approvedBy", approvedBy)
			.append("workUnit", workUnit)
			.append("classification", classification)
			.append("requestStatus", requestStatus)
			.append("requestNameEn", requestNameEn)
			.append("requestNameFr", requestNameFr)
			.append("educationalRequirementText", educationalRequirementText)
			.append("priorityClearanceNumber", priorityClearanceNumber)
			.append("requestPostingDate", requestPostingDate)
			.append("allowTeleworkIndicator", allowTeleworkIndicator)
			.append("startDate", startDate)
			.append("endDate", endDate)
			.toString();
	}

}
