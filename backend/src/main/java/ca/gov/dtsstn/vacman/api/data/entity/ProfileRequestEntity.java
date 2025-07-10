package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDate;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "ProfileRequest")
@Table(name = "[PROFILE_REQUEST]", uniqueConstraints = {
    @UniqueConstraint(name = "PRFLRQST_UK", columnNames = {"[PROFILE_ID]", "[REQUEST_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_REQUEST_ID]"))
public class ProfileRequestEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	@ManyToOne
	@JoinColumn(name = "[ASSESSMENT_RESULT_ID]", nullable = false)
	private AssessmentResultEntity assessmentResult;

	@ManyToOne
	@JoinColumn(name = "[PERSON_ID_ASSESSED_BY]", nullable = false)
	private UserEntity assessedBy;

	@ManyToOne
	@JoinColumn(name = "[PERSON_ID_APPROVED_BY]", nullable = false)
	private UserEntity approvedBy;

	@Column(name = "[ASSESSMENT_DATE]", nullable = true)
	private LocalDate assessmentDate;

	@Column(name = "[ASSESSMENT_JUSTIFICATION_TEXT]", length = 200, nullable = true)
	private String assessmentJustificationText;

	public ProfileRequestEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileRequestEntity(
			@Nullable Long id,
			@Nullable RequestEntity request,
			@Nullable ProfileEntity profile,
			@Nullable AssessmentResultEntity assessmentResult,
			@Nullable UserEntity assessedBy,
			@Nullable UserEntity approvedBy,
			@Nullable LocalDate assessmentDate,
			@Nullable String assessmentJustificationText,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.request = request;
		this.profile = profile;
		this.assessmentResult = assessmentResult;
		this.assessedBy = assessedBy;
		this.approvedBy = approvedBy;
		this.assessmentDate = assessmentDate;
		this.assessmentJustificationText = assessmentJustificationText;
	}

	public RequestEntity getRequest() {
		return request;
	}

	public void setRequest(RequestEntity request) {
		this.request = request;
	}

	public ProfileEntity getProfile() {
		return profile;
	}

	public void setProfile(ProfileEntity profile) {
		this.profile = profile;
	}

	public AssessmentResultEntity getAssessmentResult() {
		return assessmentResult;
	}

	public void setAssessmentResult(AssessmentResultEntity assessmentResult) {
		this.assessmentResult = assessmentResult;
	}

	public UserEntity getAssessedBy() {
		return assessedBy;
	}

	public void setAssessedBy(UserEntity assessedBy) {
		this.assessedBy = assessedBy;
	}

	public UserEntity getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(UserEntity approvedBy) {
		this.approvedBy = approvedBy;
	}

	public LocalDate getAssessmentDate() {
		return assessmentDate;
	}

	public void setAssessmentDate(LocalDate assessmentDate) {
		this.assessmentDate = assessmentDate;
	}

	public String getAssessmentJustificationText() {
		return assessmentJustificationText;
	}

	public void setAssessmentJustificationText(String assessmentJustificationText) {
		this.assessmentJustificationText = assessmentJustificationText;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("request", request)
			.append("profile", profile)
			.append("assessmentResult", assessmentResult)
			.append("assessedBy", assessedBy)
			.append("approvedBy", approvedBy)
			.append("assessmentDate", assessmentDate)
			.append("assessmentJustificationText", assessmentJustificationText)
			.toString();
	}

}
