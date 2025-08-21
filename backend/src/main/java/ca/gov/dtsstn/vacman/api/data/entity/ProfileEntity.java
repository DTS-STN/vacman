package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.annotation.Nullable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "Profile")
@Table(name = "[PROFILE]")
public class ProfileEntity extends AbstractBaseEntity {

	@ManyToOne
	@JsonBackReference
	@JoinColumn(name = "[USER_ID]", nullable = false)
	private UserEntity user;

	@ManyToOne
	@JsonBackReference
	@JoinColumn(name = "[USER_ID_HR_ADVISOR]", nullable = true)
	private UserEntity hrAdvisor;

	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "[WFA_STATUS_ID]", nullable = true)
	private WfaStatusEntity wfaStatus;

	@Column(name = "[WFA_START_DATE]")
	private LocalDate wfaStartDate;

	@Column(name = "[WFA_END_DATE]")
	private LocalDate wfaEndDate;

	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = true)
	private ClassificationEntity classification;

	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = true)
	private CityEntity city;

	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = true)
	private WorkUnitEntity workUnit;

	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = true)
	private LanguageEntity language;

	@JsonIgnore
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
	@JsonIgnore
	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ProfileCityEntity> profileCities = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ClassificationProfileEntity> classificationProfiles = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ProfileEmploymentOpportunityEntity> employmentOpportunities = new HashSet<>();

	@JsonIgnore
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
			@Nullable WorkUnitEntity workUnit,
			@Nullable LocalDate wfaStartDate,
			@Nullable LocalDate wfaEndDate,
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
		this.wfaStartDate = wfaStartDate;
		this.wfaEndDate = wfaEndDate;
		this.classification = classification;
		this.city = city;
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

	public LocalDate getWfaStartDate() {
		return wfaStartDate;
	}

	public void setWfaStartDate(LocalDate wfaStartDate) {
		this.wfaStartDate = wfaStartDate;
	}

	public LocalDate getWfaEndDate() {
		return wfaEndDate;
	}

	public void setWfaEndDate(LocalDate wfaEndDate) {
		this.wfaEndDate = wfaEndDate;
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

	public Set<ProfileCityEntity> getProfileCities() {
		return profileCities;
	}

	public void setProfileCities(Set<ProfileCityEntity> profileCities) {
		this.profileCities = profileCities;
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
			.append("additionalComment", additionalComment)
			.append("city", city)
			.append("classification", classification)
			.append("hasConsentedToPrivacyTerms", hasConsentedToPrivacyTerms)
			.append("hrAdvisor.id", Optional.ofNullable(hrAdvisor).map(UserEntity::getId).orElse(null)) // anti-recursion protection
			.append("isAvailableForReferral", isAvailableForReferral)
			.append("isInterestedInAlternation", isInterestedInAlternation)
			.append("language", language)
			.append("personalEmailAddress", personalEmailAddress)
			.append("personalPhoneNumber", personalPhoneNumber)
			.append("profileStatus", profileStatus)
			.append("user.id", Optional.ofNullable(user).map(UserEntity::getId).orElse(null)) // anti-recursion protection
			.append("wfaStatus", wfaStatus)
			.append("workUnit", workUnit)
			.toString();
	}

}
