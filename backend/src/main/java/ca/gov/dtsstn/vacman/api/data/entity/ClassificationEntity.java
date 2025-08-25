package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "Classification")
@Table(name = "[CD_CLASSIFICATION]")
public class ClassificationEntity extends AbstractCodeEntity {

	public static ClassificationEntityBuilder builder() {
		return new ClassificationEntityBuilder();
	}

	public ClassificationEntity() {
		super();
	}

	@Builder.Constructor
	public ClassificationEntity(
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
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
	}

}
