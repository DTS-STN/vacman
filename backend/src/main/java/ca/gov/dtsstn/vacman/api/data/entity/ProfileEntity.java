package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "Profile")
@Table(name = "[PROFILE]")
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_ID]"))
public class ProfileEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[user_id_approved_by]", nullable = true)
	private UserEntity approvedBy;

	@ManyToOne
	@JoinColumn(name = "[city_id]", nullable = true)
	private CityEntity city;

	@ManyToOne
	@JoinColumn(name = "[classification_id]", nullable = true)
	private ClassificationEntity classification;

	@Column(name = "[additional_comment_txt]", length = 200, nullable = true)
	private String comment;

	@ManyToOne
	@JoinColumn(name = "[education_level_id]", nullable = true)
	private EducationLevelEntity educationLevel;

	@Column(name = "[privacy_consent_ind]", nullable = true)
	private Boolean hasAcceptedPrivacyTerms;

	@Column(name = "[available_for_referral_ind]", nullable = true)
	private Boolean isAvailableForReferral;

	@Column(name = "[interested_in_alternation_ind]", nullable = true)
	private Boolean isInterestedInAlternation;

	@ManyToOne
	@JoinColumn(name = "[language_id]", nullable = true)
	private LanguageEntity language;

	@ManyToOne
	@JoinColumn(name = "[notification_purpose_id]", nullable = false)
	private NotificationPurposeEntity notificationPurpose;

	@Column(name = "[personal_email_address]", length = 320, nullable = true)
	private String personalEmailAddress;

	@Column(name = "[personal_phone_number]", length = 15, nullable = true)
	private String personalPhoneNumber;

	@ManyToOne
	@JoinColumn(name = "[priority_level_id]", nullable = true)
	private PriorityLevelEntity priorityLevel;

	@ManyToOne
	@JoinColumn(name = "[profile_status_id]", nullable = false)
	private ProfileStatusEntity profileStatus;

	@ManyToOne
	@JoinColumn(name = "[user_id_reviewed_by]", nullable = true)
	private UserEntity reviewedBy;

	@ManyToOne
	@JoinColumn(name = "[wfa_status_id]", nullable = true)
	private WfaStatusEntity wfaStatus;

	@ManyToOne
	@JoinColumn(name = "[work_unit_id]", nullable = true)
	private WorkUnitEntity workUnit;

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
			@Nullable NotificationPurposeEntity notificationPurpose,
			@Nullable String personalEmailAddress,
			@Nullable String personalPhoneNumber,
			@Nullable PriorityLevelEntity priorityLevel,
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
		this.city = city;
		this.classification = classification;
		this.comment = comment;
		this.educationLevel = educationLevel;
		this.hasAcceptedPrivacyTerms = hasAcceptedPrivacyTerms;
		this.isAvailableForReferral = isAvailableForReferral;
		this.isInterestedInAlternation = isInterestedInAlternation;
		this.language = language;
		this.notificationPurpose = notificationPurpose;
		this.personalEmailAddress = personalEmailAddress;
		this.personalPhoneNumber = personalPhoneNumber;
		this.priorityLevel = priorityLevel;
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
			.append("city", city)
			.append("classification", classification)
			.append("comment", comment)
			.append("educationLevel", educationLevel)
			.append("hasAcceptedPrivacyTerms", hasAcceptedPrivacyTerms)
			.append("isAvailableForReferral", isAvailableForReferral)
			.append("isInterestedInAlternation", isInterestedInAlternation)
			.append("language", language)
			.append("notificationPurpose", notificationPurpose)
			.append("personalEmailAddress", personalEmailAddress)
			.append("personalPhoneNumber", personalPhoneNumber)
			.append("priorityLevel", priorityLevel)
			.append("profileStatus", profileStatus)
			.append("reviewedBy", reviewedBy)
			.append("wfaStatus", wfaStatus)
			.append("workUnit", workUnit)
			.toString();
	}

}
