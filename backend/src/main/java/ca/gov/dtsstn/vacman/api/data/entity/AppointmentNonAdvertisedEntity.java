package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "AppointmentNonAdvertised")
@Table(name = "[CD_APPOINTMENT_NON_ADVERTISED]", uniqueConstraints = {
	@UniqueConstraint(name = "APPNTMNTNONADVRTSD_UK", columnNames = "[APPOINTMENT_NON_ADVERTISED_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_NAME_FR]"))
public class AppointmentNonAdvertisedEntity extends AbstractCodeEntity {

	public AppointmentNonAdvertisedEntity() {
		super();
	}

	@Builder.Constructor
	public AppointmentNonAdvertisedEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate, code, nameEn, nameFr, effectiveDate, expiryDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
				.append("super", super.toString())
				.toString();
	}
}
