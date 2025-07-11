package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDateTime;

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

@Entity(name = "City")
@Table(name = "[CD_CITY]", uniqueConstraints = {
    @UniqueConstraint(name = "CITY_UK", columnNames = {"[CITY_NAME_EN]", "[PROVINCE_TERRITORY_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[CITY_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[CITY_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[CITY_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[CITY_NAME_FR]"))
public class CityEntity extends AbstractLookupEntity {

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
			@Nullable LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate,
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
