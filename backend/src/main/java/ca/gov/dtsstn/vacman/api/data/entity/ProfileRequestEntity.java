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

@Entity(name = "ProfileRequest")
@Table(name = "[PROFILE_REQUEST]")
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_REQUEST_ID]", columnDefinition = "NUMERIC"))
public class ProfileRequestEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[PERSON_ID_APPROVED_BY]", nullable = false)
	private UserEntity approvedBy;

	@ManyToOne
	@JoinColumn(name = "[PERSON_ID_ASSESSED_BY]", nullable = false)
	private UserEntity assessedBy;

	@Column(name = "[ASSESSMENT_DATE]")
	private LocalDate assessmentDate;

	@Column(name = "[ASSESSMENT_JUSTIFICATION_TEXT]", length = 200)
	private String assessmentJustification;

	@ManyToOne
	@JoinColumn(name = "[ASSESSMENT_RESULT_ID]", nullable = false)
	private AssessmentResultEntity assessmentResult;

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	public ProfileRequestEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileRequestEntity(
			@Nullable Long id,
			@Nullable UserEntity approvedBy,
			@Nullable UserEntity assessedBy,
			@Nullable LocalDate assessmentDate,
			@Nullable String assessmentJustification,
			@Nullable AssessmentResultEntity assessmentResult,
			@Nullable ProfileEntity profile,
			@Nullable RequestEntity request,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.approvedBy = approvedBy;
		this.assessedBy = assessedBy;
		this.assessmentDate = assessmentDate;
		this.assessmentJustification = assessmentJustification;
		this.assessmentResult = assessmentResult;
		this.request = request;
	}

	public UserEntity getApprovedBy() {
		return approvedBy;
	}

	public void setApprovedBy(UserEntity approvedBy) {
		this.approvedBy = approvedBy;
	}

	public UserEntity getAssessedBy() {
		return assessedBy;
	}

	public void setAssessedBy(UserEntity assessedBy) {
		this.assessedBy = assessedBy;
	}

	public LocalDate getAssessmentDate() {
		return assessmentDate;
	}

	public void setAssessmentDate(LocalDate assessmentDate) {
		this.assessmentDate = assessmentDate;
	}

	public String getAssessmentJustification() {
		return assessmentJustification;
	}

	public void setAssessmentJustification(String assessmentJustification) {
		this.assessmentJustification = assessmentJustification;
	}

	public AssessmentResultEntity getAssessmentResult() {
		return assessmentResult;
	}

	public void setAssessmentResult(AssessmentResultEntity assessmentResult) {
		this.assessmentResult = assessmentResult;
	}

	public ProfileEntity getProfile() {
		return profile;
	}

	public void setProfile(ProfileEntity profile) {
		this.profile = profile;
	}

	public RequestEntity getRequest() {
		return request;
	}

	public void setRequest(RequestEntity request) {
		this.request = request;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("approvedBy", approvedBy)
			.append("assessedBy", assessedBy)
			.append("assessmentDate", assessmentDate)
			.append("assessmentJustification", assessmentJustification)
			.append("assessmentResult", assessmentResult)
			.append("profile", profile)
			.append("request", request)
			.toString();
	}

}
