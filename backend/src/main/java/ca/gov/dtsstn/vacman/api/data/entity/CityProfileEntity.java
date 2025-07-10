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

@Entity(name = "CityProfile")
@Table(name = "[CITY_PROFILE]", uniqueConstraints = {
    @UniqueConstraint(name = "CTYPRFL_UK", columnNames = {"[PROFILE_ID]", "[CITY_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[CITY_PROFILE_ID]"))
public class CityProfileEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = false)
	private CityEntity city;

	public CityProfileEntity() {
		super();
	}

	@Builder.Constructor
	public CityProfileEntity(
			@Nullable Long id,
			@Nullable ProfileEntity profile,
			@Nullable CityEntity city,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.profile = profile;
		this.city = city;
	}

	public ProfileEntity getProfile() {
		return profile;
	}

	public void setProfile(ProfileEntity profile) {
		this.profile = profile;
	}

	public CityEntity getCity() {
		return city;
	}

	public void setCity(CityEntity city) {
		this.city = city;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("profile", profile)
			.append("city", city)
			.toString();
	}

}
