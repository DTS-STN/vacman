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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "Profile")
@Table(name = "[PROFILE]")
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_ID]"))
public class ProfileEntity extends AbstractBaseEntity {

	@ManyToOne
	@JoinColumn(name = "[USER_ID]", nullable = false)
	private UserEntity user;

	@ManyToOne
	@JoinColumn(name = "[USER_ID_HR_ADVISOR]", nullable = false)
	private UserEntity hrAdvisor;

	@ManyToOne
	@JoinColumn(name = "[WFA_STATUS_ID]", nullable = true)
	private WfaStatusEntity wfaStatus;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = true)
	private ClassificationEntity classification;

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = true)
	private CityEntity city;

	@ManyToOne
	@JoinColumn(name = "[PRIORITY_LEVEL_ID]", nullable = true)
	private PriorityLevelEntity priorityLevel;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = true)
	private WorkUnitEntity workUnit;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = true)
	private LanguageEntity language;

	@ManyToOne
	@JoinColumn(name = "[PROFILE_STATUS_ID]", nullable = false)
	private ProfileStatusEntity profileStatus;

	@Column(name = "[PERSONAL_PHONE_NUMBER]", length = 15, nullable = true)
	private String personalPhoneNumber;

	@Column(name = "[PERSONAL_EMAIL_ADDRESS]", length = 320, nullable = true)
	private String personalEmailAddress;

	@Column(name = "[PRIVACY_CONSENT_IND]", nullable = true)
	private Boolean hasConsentedToPrivacyTerms;

	@Column(name = "[AVAILABLE_FOR_REFERRAL_IND]", nullable = true)
	private Boolean isAvailableForReferral;

	@Column(name = "[INTERESTED_IN_ALTERNATION_IND]", nullable = true)
	private Boolean isInterestedInAlternation;

	@Column(name = "[ADDITIONAL_COMMENT]", length = 200, nullable = true)
	private String additionalComment;

	// Collection relationships for many-to-many tables
	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<CityProfileEntity> cityProfiles = new HashSet<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ClassificationProfileEntity> classificationProfiles = new HashSet<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ProfileEmploymentOpportunityEntity> employmentOpportunities = new HashSet<>();

	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ProfileLanguageReferralTypeEntity> languageReferralTypes = new HashSet<>();

	public ProfileEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileEntity(
			@Nullable Long id,
			@Nullable UserEntity user,
			@Nullable UserEntity hrAdvisor,
			@Nullable WfaStatusEntity wfaStatus,
			@Nullable ClassificationEntity classification,
			@Nullable CityEntity city,
			@Nullable PriorityLevelEntity priorityLevel,
			@Nullable WorkUnitEntity workUnit,
			@Nullable LanguageEntity language,
			@Nullable ProfileStatusEntity profileStatus,
			@Nullable String personalPhoneNumber,
			@Nullable String personalEmailAddress,
			@Nullable Boolean hasConsentedToPrivacyTerms,
			@Nullable Boolean isAvailableForReferral,
			@Nullable Boolean isInterestedInAlternation,
			@Nullable String additionalComment,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.user = user;
		this.hrAdvisor = hrAdvisor;
		this.wfaStatus = wfaStatus;
		this.classification = classification;
		this.city = city;
		this.priorityLevel = priorityLevel;
		this.workUnit = workUnit;
		this.language = language;
		this.profileStatus = profileStatus;
		this.personalPhoneNumber = personalPhoneNumber;
		this.personalEmailAddress = personalEmailAddress;
		this.hasConsentedToPrivacyTerms = hasConsentedToPrivacyTerms;
		this.isAvailableForReferral = isAvailableForReferral;
		this.isInterestedInAlternation = isInterestedInAlternation;
		this.additionalComment = additionalComment;
	}

	public UserEntity getUser() {
		return user;
	}

	public void setUser(UserEntity user) {
		this.user = user;
	}

	public UserEntity getHrAdvisor() {
		return hrAdvisor;
	}

	public void setHrAdvisor(UserEntity hrAdvisor) {
		this.hrAdvisor = hrAdvisor;
	}

	public WfaStatusEntity getWfaStatus() {
		return wfaStatus;
	}

	public void setWfaStatus(WfaStatusEntity wfaStatus) {
		this.wfaStatus = wfaStatus;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public CityEntity getCity() {
		return city;
	}

	public void setCity(CityEntity city) {
		this.city = city;
	}

	public PriorityLevelEntity getPriorityLevel() {
		return priorityLevel;
	}

	public void setPriorityLevel(PriorityLevelEntity priorityLevel) {
		this.priorityLevel = priorityLevel;
	}

	public WorkUnitEntity getWorkUnit() {
		return workUnit;
	}

	public void setWorkUnit(WorkUnitEntity workUnit) {
		this.workUnit = workUnit;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
	}

	public ProfileStatusEntity getProfileStatus() {
		return profileStatus;
	}

	public void setProfileStatus(ProfileStatusEntity profileStatus) {
		this.profileStatus = profileStatus;
	}

	public String getPersonalPhoneNumber() {
		return personalPhoneNumber;
	}

	public void setPersonalPhoneNumber(String personalPhoneNumber) {
		this.personalPhoneNumber = personalPhoneNumber;
	}

	public String getPersonalEmailAddress() {
		return personalEmailAddress;
	}

	public void setPersonalEmailAddress(String personalEmailAddress) {
		this.personalEmailAddress = personalEmailAddress;
	}

	public Boolean getHasConsentedToPrivacyTerms() {
		return hasConsentedToPrivacyTerms;
	}

	public void setHasConsentedToPrivacyTerms(Boolean hasConsentedToPrivacyTerms) {
		this.hasConsentedToPrivacyTerms = hasConsentedToPrivacyTerms;
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

	public String getAdditionalComment() {
		return additionalComment;
	}

	public void setAdditionalComment(String additionalComment) {
		this.additionalComment = additionalComment;
	}

	public Set<CityProfileEntity> getCityProfiles() {
		return cityProfiles;
	}

	public void setCityProfiles(Set<CityProfileEntity> cityProfiles) {
		this.cityProfiles = cityProfiles;
	}

	public Set<ClassificationProfileEntity> getClassificationProfiles() {
		return classificationProfiles;
	}

	public void setClassificationProfiles(Set<ClassificationProfileEntity> classificationProfiles) {
		this.classificationProfiles = classificationProfiles;
	}

	public Set<ProfileEmploymentOpportunityEntity> getEmploymentOpportunities() {
		return employmentOpportunities;
	}

	public void setEmploymentOpportunities(Set<ProfileEmploymentOpportunityEntity> employmentOpportunities) {
		this.employmentOpportunities = employmentOpportunities;
	}

	public Set<ProfileLanguageReferralTypeEntity> getLanguageReferralTypes() {
		return languageReferralTypes;
	}

	public void setLanguageReferralTypes(Set<ProfileLanguageReferralTypeEntity> languageReferralTypes) {
		this.languageReferralTypes = languageReferralTypes;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("user", user)
			.append("hrAdvisor", hrAdvisor)
			.append("wfaStatus", wfaStatus)
			.append("classification", classification)
			.append("city", city)
			.append("priorityLevel", priorityLevel)
			.append("workUnit", workUnit)
			.append("language", language)
			.append("profileStatus", profileStatus)
			.append("personalPhoneNumber", personalPhoneNumber)
			.append("personalEmailAddress", personalEmailAddress)
			.append("hasConsentedToPrivacyTerms", hasConsentedToPrivacyTerms)
			.append("isAvailableForReferral", isAvailableForReferral)
			.append("isInterestedInAlternation", isInterestedInAlternation)
			.append("additionalComment", additionalComment)
			.toString();
	}

}
