package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "City")
@Table(name = "[CD_CITY]")
public class CityEntity extends AbstractCodeEntity {

	@ManyToOne
	@JoinColumn(name = "[PROVINCE_TERRITORY_ID]", nullable = false)
	protected ProvinceEntity provinceTerritory;

	public CityEntity() {
		super();
	}

	@Builder.Constructor
	public CityEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate,
			@Nullable ProvinceEntity provinceTerritory,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.provinceTerritory = provinceTerritory;
	}

	public ProvinceEntity getProvinceTerritory() {
		return provinceTerritory;
	}

	public void setProvinceTerritory(ProvinceEntity provinceTerritory) {
		this.provinceTerritory = provinceTerritory;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("provinceTerritory", provinceTerritory)
			.toString();
	}

}
