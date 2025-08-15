package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Objects;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "ClassificationProfile")
@Table(name = "[CLASSIFICATION_PROFILE]", uniqueConstraints = { @UniqueConstraint(name = "CLSPRFL_UK", columnNames = { "[CLASSIFICATION_ID]", "[PROFILE_ID]"}) })
public class ClassificationProfileEntity extends AbstractBaseEntity {

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = false)
	private ClassificationEntity classification;

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	public ClassificationProfileEntity() {
		super();
	}

	@Builder.Constructor
	public ClassificationProfileEntity(
			@Nullable Long id,
			@Nullable ClassificationEntity classification,
			@Nullable ProfileEntity profile,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.classification = classification;
		this.profile = profile;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public ProfileEntity getProfile() {
		return profile;
	}

	public void setProfile(ProfileEntity profile) {
		this.profile = profile;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("classification", classification)
			.append("profile", profile)
			.toString();
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof ClassificationProfileEntity that)) {
			return false;
		}

		return Objects.equals(this.profile, that.profile) && Objects.equals(this.classification, that.classification);

	}

	@Override
	public int hashCode() {
		return Objects.hash(profile, classification);
	}

}
