package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

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

@Entity(name = "ProfileEmploymentTenure")
@Table(name = "[PROFILE_EMPLOYMENT_TENURE]", uniqueConstraints = {
    @UniqueConstraint(name = "PEMPTNR_UK", columnNames = {"[EMPLOYMENT_TENURE_ID]", "[PROFILE_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_EMPLOYMENT_TENURE_ID]"))
public class ProfileEmploymentTenureEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_TENURE_ID]", nullable = false)
	private EmploymentTenureEntity employmentTenure;

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	public ProfileEmploymentTenureEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileEmploymentTenureEntity(
			@Nullable Long id,
			@Nullable EmploymentTenureEntity employmentTenure,
			@Nullable ProfileEntity profile,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.employmentTenure = employmentTenure;
		this.profile = profile;
	}

	public EmploymentTenureEntity getEmploymentTenure() {
		return employmentTenure;
	}

	public void setEmploymentTenure(EmploymentTenureEntity employmentTenure) {
		this.employmentTenure = employmentTenure;
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
			.append("employmentTenure", employmentTenure)
			.append("profile", profile)
			.toString();
	}

}
