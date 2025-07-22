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

@Entity(name = "City")
@Table(name = "[CD_CITY]")
@AttributeOverride(name = "id", column = @Column(name = "[CITY_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[CITY_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[CITY_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[CITY_NAME_FR]"))
public class CityEntity extends AbstractLookupEntity {

	@ManyToOne
	@JoinColumn(name = "[PROVINCE_TERRITORY_ID]", nullable = false)
	private ProvinceEntity province;

	public CityEntity() {
		super();
	}

	@Builder.Constructor
	public CityEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable ProvinceEntity province,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.province = province;
	}

	public ProvinceEntity getProvince() {
		return province;
	}

	public void setProvince(ProvinceEntity province) {
		this.province = province;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("province", province)
			.toString();
	}

}
