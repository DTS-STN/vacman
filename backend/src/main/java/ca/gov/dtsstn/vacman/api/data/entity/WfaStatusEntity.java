package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "WfaStatus")
@Table(name = "[CD_WFA_STATUS]")
public class WfaStatusEntity extends AbstractCodeEntity {

	@Column(name = "[SORT_ORDER]")
	private Integer sortOrder;

	public static WfaStatusEntityBuilder builder() {
		return new WfaStatusEntityBuilder();
	}

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
			@Nullable Integer sortOrder,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.sortOrder = sortOrder;
	}

	public Integer getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(Integer sortOrder) {
		this.sortOrder = sortOrder;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("sortOrder", sortOrder)
			.toString();
	}

}
