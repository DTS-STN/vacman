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

/**
 * Junction entity representing the many-to-many relationship between Profile and EmploymentOpportunity.
 * Maps to PROFILE_EMPLOYMENT_OPPORTUNITY database table.
 */
@Entity(name = "ProfileEmploymentOpportunity")
@Table(name = "[PROFILE_EMPLOYMENT_OPPORTUNITY]", uniqueConstraints = {
    @UniqueConstraint(name = "PEMPOPPR_UK", columnNames = {"[EMPLOYMENT_OPPORTUNITY_ID]", "[PROFILE_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_EMPLOYMENT_OPPORTUNITY_ID]"))
public class ProfileEmploymentOpportunityEntity extends AbstractEntity {

    @ManyToOne
    @JoinColumn(name = "[EMPLOYMENT_OPPORTUNITY_ID]", nullable = false)
    private EmploymentOpportunityEntity employmentOpportunity;

    @ManyToOne
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
