package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "Province")
@Table(name = "[CD_PROVINCE_TERRITORY]")
@AttributeOverride(name = "id", column = @Column(name = "[PROVINCE_TERRITORY_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[PROVINCE_TERRITORY_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[PROVINCE_TERRITORY_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[PROVINCE_TERRITORY_NAME_FR]"))
public class ProvinceEntity extends AbstractLookupEntity {

	/**
	 * Default constructor (required by JPA).
	 */
	public ProvinceEntity() {
		super();
	}

	/**
	 * @param id The unique identifier of the user.
	 * @param code The code.
	 * @param nameEn The english name of reference.
	 * @param nameFr The french name of reference.
	 * @param createdBy The user who created this entity.
	 * @param createdDate The date and time when this entity was created.
	 * @param lastModifiedBy The user who last modified this entity.
	 * @param lastModifiedDate The date and time when this entity was last modified.
	 */
	@Builder.Constructor
	public ProvinceEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
