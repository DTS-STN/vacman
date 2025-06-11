package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDate;
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

@Entity(name = "Request")
@Table(name = "[REQUEST]")
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_ID]", columnDefinition = "NUMERIC"))
public class RequestEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = false)
	private ClassificationEntity classification;

	@Column(name = "[ALLOW_TELEWORK_IND]")
	private Boolean isTeleworkAllowed;

	@Column(name = "[EDUCATIONAL_REQUIREMENT_TXT]", length = 200)
	private String educationalRequirement;

	@Column(name = "[END_DATE]")
	private LocalDate endDate;

	@OneToMany(mappedBy = "request", cascade = { CascadeType.ALL }, orphanRemoval = true)
	private Set<ProfileRequestEntity> profileRequests = new HashSet<>();

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = false)
	private WorkUnitEntity workUnit;

	public RequestEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEntity(
			@Nullable Long id,
			@Nullable ClassificationEntity classification,
			@Nullable String educationalRequirement,
			@Nullable LocalDate endDate,
			@Nullable Boolean isTeleworkAllowed,
			@Nullable Set<ProfileRequestEntity> profileRequests,
			@Nullable WorkUnitEntity workUnit,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.classification = classification;
		this.educationalRequirement = educationalRequirement;
		this.endDate = endDate;
		this.isTeleworkAllowed = isTeleworkAllowed;
		this.profileRequests = profileRequests;
		this.workUnit = workUnit;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public String getEducationalRequirement() {
		return educationalRequirement;
	}

	public void setEducationalRequirement(String educationalRequirement) {
		this.educationalRequirement = educationalRequirement;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public Boolean getIsTeleworkAllowed() {
		return isTeleworkAllowed;
	}

	public void setIsTeleworkAllowed(Boolean isTeleworkAllowed) {
		this.isTeleworkAllowed = isTeleworkAllowed;
	}

	public Set<ProfileRequestEntity> getProfileRequests() {
		return profileRequests;
	}

	public void setProfileRequests(Set<ProfileRequestEntity> profileRequests) {
		this.profileRequests = profileRequests;
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
			.append("classification", classification)
			.append("educationalRequirement", educationalRequirement)
			.append("endDate", endDate)
			.append("isTeleworkAllowed", isTeleworkAllowed)
			.append("profileRequests", profileRequests)
			.append("workUnit", workUnit)
			.toString();
	}

}
