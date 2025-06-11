package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "Profile")
@Table(name = "[PROFILE]")
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_ID]", columnDefinition = "NUMERIC"))
public class ProfileEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[USER_ID_APPROVED_BY]")
	private UserEntity approvedBy;

	@ManyToMany
	@JoinTable(name = "[CITY_PROFILE]", joinColumns = @JoinColumn(name = "[PROFILE_ID]"), inverseJoinColumns = @JoinColumn(name = "[CITY_ID]"))
	private Set<CityEntity> citiesOfInterest = new HashSet<>();

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]")
	private CityEntity city;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]")
	private ClassificationEntity classification;

	@ManyToMany
	@JoinTable(name = "[CLASSIFICATION_PROFILE]", joinColumns = @JoinColumn(name = "[PROFILE_ID]"), inverseJoinColumns = @JoinColumn(name = "[CLASSIFICATION_ID]"))
	private Set<ClassificationEntity> classificationsOfInterest = new HashSet<>();

	@Column(name = "[ADDITIONAL_COMMENT_TXT]", length = 200)
	private String comment;

	@ManyToOne
	@JoinColumn(name = "[EDUCATION_LEVEL_ID]")
	private EducationLevelEntity educationLevel;

	@ManyToMany
	@JoinTable(name = "[PROFILE_EMPLOYMENT_TENURE]", joinColumns = @JoinColumn(name = "[PROFILE_ID]"), inverseJoinColumns = @JoinColumn(name = "[EMPLOYMENT_TENURE_ID]"))
	private Set<EmploymentTenureEntity> employmentTenuresOfInterest = new HashSet<>();

	@Column(name = "[PRIVACY_CONSENT_IND]")
	private Boolean hasAcceptedPrivacyTerms;

	@Column(name = "[AVAILABLE_FOR_REFERRAL_IND]")
	private Boolean isAvailableForReferral;

	@Column(name = "[INTERESTED_IN_ALTERNATION_IND]")
	private Boolean isInterestedInAlternation;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]")
	private LanguageEntity language;

	@ManyToMany
	@JoinTable(name = "[PROFILE_LANGUAGE_REFERRAL_TYPE]", joinColumns = @JoinColumn(name = "[PROFILE_ID]"), inverseJoinColumns = @JoinColumn(name = "[LANGUAGE_REFERRAL_TYPE_ID]"))
	private Set<LanguageReferralTypeEntity> languageReferralTypes = new HashSet<>();

	@ManyToOne
	@JoinColumn(name = "[NOTIFICATION_PURPOSE_ID]")
	private NotificationPurposeEntity notificationPurpose;

	@Column(name = "[PERSONAL_EMAIL_ADDRESS]", length = 320)
	private String personalEmailAddress;

	@Column(name = "[PERSONAL_PHONE_NUMBER]", length = 15)
	private String personalPhoneNumber;

	@ManyToOne
	@JoinColumn(name = "[PRIORITY_LEVEL_ID]")
	private PriorityLevelEntity priorityLevel;

	@OneToMany(mappedBy = "profile", cascade = { CascadeType.ALL }, orphanRemoval = true)
	private Set<ProfileRequestEntity> profileRequests = new HashSet<>();

	@ManyToOne
	@JoinColumn(name = "[PROFILE_STATUS_ID]", nullable = false)
	private ProfileStatusEntity profileStatus;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_REVIEWED_BY]")
	private UserEntity reviewedBy;

	@ManyToOne
	@JoinColumn(name = "[WFA_STATUS_ID]")
	private WfaStatusEntity wfaStatus;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]")
	private WorkUnitEntity workUnit;

	public ProfileEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileEntity(
			@Nullable Long id,
			@Nullable UserEntity approvedBy,
			@Nullable Set<CityEntity> citiesOfInterest,
			@Nullable CityEntity city,
			@Nullable ClassificationEntity classification,
			@Nullable Set<ClassificationEntity> classificationsOfInterest,
			@Nullable String comment,
			@Nullable EducationLevelEntity educationLevel,
			@Nullable Set<EmploymentTenureEntity> employmentTenuresOfInterest,
			@Nullable Boolean hasAcceptedPrivacyTerms,
			@Nullable Boolean isAvailableForReferral,
			@Nullable Boolean isInterestedInAlternation,
			@Nullable LanguageEntity language,
			@Nullable Set<LanguageReferralTypeEntity> languageReferralTypes,
			@Nullable NotificationPurposeEntity notificationPurpose,
			@Nullable String personalEmailAddress,
			@Nullable String personalPhoneNumber,
			@Nullable PriorityLevelEntity priorityLevel,
			@Nullable Set<ProfileRequestEntity> profileRequests,
			@Nullable ProfileStatusEntity profileStatus,
			@Nullable UserEntity reviewedBy,
			@Nullable WfaStatusEntity wfaStatus,
			@Nullable WorkUnitEntity workUnit,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.approvedBy = approvedBy;
		this.citiesOfInterest = citiesOfInterest;
		this.city = city;
		this.classification = classification;
		this.classificationsOfInterest = classificationsOfInterest;
		this.comment = comment;
		this.educationLevel = educationLevel;
		this.employmentTenuresOfInterest = employmentTenuresOfInterest;
		this.hasAcceptedPrivacyTerms = hasAcceptedPrivacyTerms;
		this.isAvailableForReferral = isAvailableForReferral;
		this.isInterestedInAlternation = isInterestedInAlternation;
		this.language = language;
		this.languageReferralTypes = languageReferralTypes;
		this.notificationPurpose = notificationPurpose;
		this.personalEmailAddress = personalEmailAddress;
		this.personalPhoneNumber = personalPhoneNumber;
		this.priorityLevel = priorityLevel;
		this.profileRequests = profileRequests;
		this.profileStatus = profileStatus;
		this.reviewedBy = reviewedBy;
		this.wfaStatus = wfaStatus;
		this.workUnit = workUnit;
	}

	public UserEntity getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(UserEntity approvedBy) {
		this.approvedBy = approvedBy;
	}

	public Set<CityEntity> getCitiesOfInterest() {
		return citiesOfInterest;
	}

	public void setCitiesOfInterest(Set<CityEntity> citiesOfInterest) {
		this.citiesOfInterest = citiesOfInterest;
	}

	public CityEntity getCity() {
		return city;
	}

	public void setCity(CityEntity city) {
		this.city = city;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public Set<ClassificationEntity> getClassificationsOfInterest() {
		return classificationsOfInterest;
	}

	public void setClassificationsOfInterest(Set<ClassificationEntity> classificationsOfInterest) {
		this.classificationsOfInterest = classificationsOfInterest;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public EducationLevelEntity getEducationLevel() {
		return educationLevel;
	}

	public void setEducationLevel(EducationLevelEntity educationLevel) {
		this.educationLevel = educationLevel;
	}

	public Set<EmploymentTenureEntity> getEmploymentTenuresOfInterest() {
		return employmentTenuresOfInterest;
	}

	public void setEmploymentTenuresOfInterest(Set<EmploymentTenureEntity> employmentTenuresOfInterest) {
		this.employmentTenuresOfInterest = employmentTenuresOfInterest;
	}

	public Boolean getHasAcceptedPrivacyTerms() {
		return hasAcceptedPrivacyTerms;
	}

	public void setHasAcceptedPrivacyTerms(Boolean hasAcceptedPrivacyTerms) {
		this.hasAcceptedPrivacyTerms = hasAcceptedPrivacyTerms;
	}

	public Boolean getIsAvailableForReferral() {
		return isAvailableForReferral;
	}

	public void setIsAvailableForReferral(Boolean isAvailableForReferral) {
		this.isAvailableForReferral = isAvailableForReferral;
	}

	public Boolean getIsInterestedInAlternation() {
		return isInterestedInAlternation;
	}

	public void setIsInterestedInAlternation(Boolean isInterestedInAlternation) {
		this.isInterestedInAlternation = isInterestedInAlternation;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
	}

	public Set<LanguageReferralTypeEntity> getLanguageReferralTypes() {
		return languageReferralTypes;
	}

	public void setLanguageReferralTypes(Set<LanguageReferralTypeEntity> languageReferralTypes) {
		this.languageReferralTypes = languageReferralTypes;
	}

	public NotificationPurposeEntity getNotificationPurpose() {
		return notificationPurpose;
	}

	public void setNotificationPurpose(NotificationPurposeEntity notificationPurpose) {
		this.notificationPurpose = notificationPurpose;
	}

	public String getPersonalEmailAddress() {
		return personalEmailAddress;
	}

	public void setPersonalEmailAddress(String personalEmailAddress) {
		this.personalEmailAddress = personalEmailAddress;
	}

	public String getPersonalPhoneNumber() {
		return personalPhoneNumber;
	}

	public void setPersonalPhoneNumber(String personalPhoneNumber) {
		this.personalPhoneNumber = personalPhoneNumber;
	}

	public PriorityLevelEntity getPriorityLevel() {
		return priorityLevel;
	}

	public void setPriorityLevel(PriorityLevelEntity priorityLevel) {
		this.priorityLevel = priorityLevel;
	}

	public Set<ProfileRequestEntity> getProfileRequests() {
		return profileRequests;
	}

	public void setProfileRequests(Set<ProfileRequestEntity> profileRequests) {
		this.profileRequests = profileRequests;
	}

	public ProfileStatusEntity getProfileStatus() {
		return profileStatus;
	}

	public void setProfileStatus(ProfileStatusEntity profileStatus) {
		this.profileStatus = profileStatus;
	}

	public UserEntity getReviewedBy() {
		return reviewedBy;
	}

	public void setReviewedBy(UserEntity reviewedBy) {
		this.reviewedBy = reviewedBy;
	}

	public WfaStatusEntity getWfaStatus() {
		return wfaStatus;
	}

	public void setWfaStatus(WfaStatusEntity wfaStatus) {
		this.wfaStatus = wfaStatus;
	}

	public WorkUnitEntity getWorkUnit() {
		return workUnit;
	}

	public void setWorkUnit(WorkUnitEntity workUnit) {
		this.workUnit = workUnit;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("approvedBy", approvedBy)
			.append("citiesOfInterest", citiesOfInterest)
			.append("city", city)
			.append("classification", classification)
			.append("classificationsOfInterest", classificationsOfInterest)
			.append("comment", comment)
			.append("educationLevel", educationLevel)
			.append("employmentTenuresOfInterest", employmentTenuresOfInterest)
			.append("hasAcceptedPrivacyTerms", hasAcceptedPrivacyTerms)
			.append("isAvailableForReferral", isAvailableForReferral)
			.append("isInterestedInAlternation", isInterestedInAlternation)
			.append("language", language)
			.append("languageReferralTypes", languageReferralTypes)
			.append("notificationPurpose", notificationPurpose)
			.append("personalEmailAddress", personalEmailAddress)
			.append("personalPhoneNumber", personalPhoneNumber)
			.append("priorityLevel", priorityLevel)
			.append("profileRequests", profileRequests)
			.append("profileStatus", profileStatus)
			.append("reviewedBy", reviewedBy)
			.append("wfaStatus", wfaStatus)
			.append("workUnit", workUnit)
			.toString();
	}

}
