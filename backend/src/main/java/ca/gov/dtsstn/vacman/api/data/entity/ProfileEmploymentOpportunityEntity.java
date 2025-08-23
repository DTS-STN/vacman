package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "ProfileEmploymentOpportunity")
@Table(name = "[PROFILE_EMPLOYMENT_OPPORTUNITY]")
public class ProfileEmploymentOpportunityEntity extends AbstractBaseEntity {

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_OPPORTUNITY_ID]", nullable = false)
	private EmploymentOpportunityEntity employmentOpportunity;

	@ManyToOne
	@JsonBackReference
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	public ProfileEmploymentOpportunityEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileEmploymentOpportunityEntity(
			@Nullable Long id,
			@Nullable EmploymentOpportunityEntity employmentOpportunity,
			@Nullable ProfileEntity profile,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.employmentOpportunity = employmentOpportunity;
		this.profile = profile;
	}

	public EmploymentOpportunityEntity getEmploymentOpportunity() {
		return employmentOpportunity;
	}

	public void setEmploymentOpportunity(EmploymentOpportunityEntity employmentOpportunity) {
		this.employmentOpportunity = employmentOpportunity;
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
			.append("employmentOpportunity", employmentOpportunity)
			.append("profile", profile)
			.toString();
	}

}
