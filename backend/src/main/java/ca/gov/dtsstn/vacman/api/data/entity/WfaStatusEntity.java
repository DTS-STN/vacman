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

@Entity(name = "WfaStatus")
@AttributeOverride(name = "id", column = @Column(name = "[WFA_STATUS_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[WFA_STATUS_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[WFA_STATUS_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[WFA_STATUS_NAME_FR]"))
@Table(name = "[CD_WFA_STATUS]", uniqueConstraints = { @UniqueConstraint(name = "WFASTS_UK", columnNames = "[WFA_STATUS_NAME_EN]") })
public class WfaStatusEntity extends AbstractCodeEntity {

	public WfaStatusEntity() {
		super();
	}

	@Builder.Constructor
	public WfaStatusEntity(
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

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
