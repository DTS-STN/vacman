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

@Entity(name = "ProfileCity")
@Table(name = "[PROFILE_CITY]")
public class ProfileCityEntity extends AbstractBaseEntity {

	@ManyToOne
	@JsonBackReference
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = false)
	private CityEntity city;

	public ProfileCityEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileCityEntity(
			@Nullable Long id,
			@Nullable CityEntity city,
			@Nullable ProfileEntity profile,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.city = city;
		this.profile = profile;
	}

	public CityEntity getCity() {
		return city;
	}

	public void setCity(CityEntity city) {
		this.city = city;
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
			.append("city", city)
			.append("profile", profile)
			.toString();
	}

}
