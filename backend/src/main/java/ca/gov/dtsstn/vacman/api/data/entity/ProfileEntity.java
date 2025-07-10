package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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

@Entity(name = "Profile")
@Table(name = "[PROFILE]")
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_ID]"))
public class ProfileEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[USER_ID_APPROVED_BY]", nullable = true)
	private UserEntity approvedBy;

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = true)
	private CityEntity city;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = true)
	private ClassificationEntity classification;

	@Column(name = "[ADDITIONAL_COMMENT_TXT]", length = 200, nullable = true)
	private String comment;

	@ManyToOne
	@JoinColumn(name = "[EDUCATION_LEVEL_ID]", nullable = true)
	private EducationLevelEntity educationLevel;

	@Column(name = "[PRIVACY_CONSENT_IND]", nullable = true)
	private Boolean hasAcceptedPrivacyTerms;

	@Column(name = "[AVAILABLE_FOR_REFERRAL_IND]", nullable = true)
	private Boolean isAvailableForReferral;

	@Column(name = "[INTERESTED_IN_ALTERNATION_IND]", nullable = true)
	private Boolean isInterestedInAlternation;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = true)
	private LanguageEntity language;

	@Column(name = "[PERSONAL_EMAIL_ADDRESS]", length = 320, nullable = true)
	private String personalEmailAddress;

	@Column(name = "[PERSONAL_PHONE_NUMBER]", length = 15, nullable = true)
	private String personalPhoneNumber;

	@ManyToOne
	@JoinColumn(name = "[PRIORITY_LEVEL_ID]", nullable = true)
	private PriorityLevelEntity priorityLevel;

	@ManyToOne
	@JoinColumn(name = "[PROFILE_STATUS_ID]", nullable = false)
	private ProfileStatusEntity profileStatus;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_REVIEWED_BY]", nullable = true)
	private UserEntity reviewedBy;

	@ManyToOne
	@JoinColumn(name = "[WFA_STATUS_ID]", nullable = true)
	private WfaStatusEntity wfaStatus;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = true)
	private WorkUnitEntity workUnit;

	@ManyToOne
	@JoinColumn(name = "[USER_ID]", nullable = false)
	private UserEntity user;

	// Collection relationships for many-to-many tables
	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CityProfileEntity> cityProfiles = new ArrayList<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ClassificationProfileEntity> classificationProfiles = new ArrayList<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProfileEmploymentTenureEntity> employmentTenures = new ArrayList<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProfileLanguageReferralTypeEntity> languageReferralTypes = new ArrayList<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProfileRequestEntity> profileRequests = new ArrayList<>();

	public ProfileEntity() {
		super();
	}

	public ProfileEntity(
			@Nullable Long id,
			@Nullable UserEntity approvedBy,
			@Nullable CityEntity city,
			@Nullable ClassificationEntity classification,
			@Nullable String comment,
			@Nullable EducationLevelEntity educationLevel,
			@Nullable Boolean hasAcceptedPrivacyTerms,
			@Nullable Boolean isAvailableForReferral,
			@Nullable Boolean isInterestedInAlternation,
			@Nullable LanguageEntity language,
			@Nullable String personalEmailAddress,
			@Nullable String personalPhoneNumber,
			@Nullable PriorityLevelEntity priorityLevel,
			@Nullable ProfileStatusEntity profileStatus,
			@Nullable UserEntity reviewedBy,
			@Nullable WfaStatusEntity wfaStatus,
			@Nullable WorkUnitEntity workUnit,
			@Nullable UserEntity user,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.approvedBy = approvedBy;
		this.city = city;
		this.classification = classification;
		this.comment = comment;
		this.educationLevel = educationLevel;
		this.hasAcceptedPrivacyTerms = hasAcceptedPrivacyTerms;
		this.isAvailableForReferral = isAvailableForReferral;
		this.isInterestedInAlternation = isInterestedInAlternation;
		this.language = language;
		this.personalEmailAddress = personalEmailAddress;
		this.personalPhoneNumber = personalPhoneNumber;
		this.priorityLevel = priorityLevel;
		this.profileStatus = profileStatus;
		this.reviewedBy = reviewedBy;
		this.wfaStatus = wfaStatus;
		this.workUnit = workUnit;
		this.user = user;
	}

	public UserEntity getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(UserEntity approvedBy) {
		this.approvedBy = approvedBy;
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

	public UserEntity getUser() {
		return user;
	}

	public void setUser(UserEntity user) {
		this.user = user;
	}

	public List<CityProfileEntity> getCityProfiles() {
		return cityProfiles;
	}

	public void setCityProfiles(List<CityProfileEntity> cityProfiles) {
		this.cityProfiles = cityProfiles;
	}

	public List<ClassificationProfileEntity> getClassificationProfiles() {
		return classificationProfiles;
	}

	public void setClassificationProfiles(List<ClassificationProfileEntity> classificationProfiles) {
		this.classificationProfiles = classificationProfiles;
	}

	public List<ProfileEmploymentTenureEntity> getEmploymentTenures() {
		return employmentTenures;
	}

	public void setEmploymentTenures(List<ProfileEmploymentTenureEntity> employmentTenures) {
		this.employmentTenures = employmentTenures;
	}

	public List<ProfileLanguageReferralTypeEntity> getLanguageReferralTypes() {
		return languageReferralTypes;
	}

	public void setLanguageReferralTypes(List<ProfileLanguageReferralTypeEntity> languageReferralTypes) {
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
			.append("approvedBy", approvedBy)
			.append("city", city)
			.append("classification", classification)
			.append("comment", comment)
			.append("educationLevel", educationLevel)
			.append("hasAcceptedPrivacyTerms", hasAcceptedPrivacyTerms)
			.append("isAvailableForReferral", isAvailableForReferral)
			.append("isInterestedInAlternation", isInterestedInAlternation)
			.append("language", language)
			.append("personalEmailAddress", personalEmailAddress)
			.append("personalPhoneNumber", personalPhoneNumber)
			.append("priorityLevel", priorityLevel)
			.append("profileStatus", profileStatus)
			.append("reviewedBy", reviewedBy)
			.append("wfaStatus", wfaStatus)
			.append("workUnit", workUnit)
			.append("user", user)
			.toString();
	}

}
