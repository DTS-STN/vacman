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

	@ManyToOne
	@JoinColumn(name = "[education_level_id]", nullable = true)
	private EducationLevelEntity educationLevel;

	@ManyToOne
	@JoinColumn(name = "[language_id]", nullable = true)
	private LanguageEntity language;

	@ManyToOne
	@JoinColumn(name = "[user_id_reviewed_by]", nullable = true)
	private UserEntity reviewedBy;

	@ManyToOne
	@JoinColumn(name = "[wfa_status_id]", nullable = true)
	private WfaStatusEntity wfaStatus;

	public ProfileEntity() {
		super();
	}

	public ProfileEntity(
			@Nullable Long id,
			@Nullable UserEntity approvedBy,
			@Nullable CityEntity city,
			@Nullable ClassificationEntity classification,
			@Nullable EducationLevelEntity educationLevel,
			@Nullable LanguageEntity language,
			@Nullable UserEntity reviewedBy,
			@Nullable WfaStatusEntity wfaStatus,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.approvedBy = approvedBy;
		this.city = city;
		this.classification = classification;
		this.educationLevel = educationLevel;
		this.language = language;
		this.reviewedBy = reviewedBy;
		this.wfaStatus = wfaStatus;
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

	public EducationLevelEntity getEducationLevel() {
		return educationLevel;
	}

	public void setEducationLevel(EducationLevelEntity educationLevel) {
		this.educationLevel = educationLevel;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
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

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("approvedBy", approvedBy)
			.append("city", city)
			.append("classification", classification)
			.append("educationLevel", educationLevel)
			.append("language", language)
			.append("reviewedBy", reviewedBy)
			.append("wfaStatus", wfaStatus)
			.toString();
	}

}
