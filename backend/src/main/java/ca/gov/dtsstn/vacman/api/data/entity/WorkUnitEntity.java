package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Optional;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "WorkUnit")
@Table(name = "[CD_WORK_UNIT]")
public class WorkUnitEntity extends AbstractCodeEntity {

	@ManyToOne
	@JoinColumn(name = "[PARENT_WORK_UNIT_ID]", nullable = true)
	protected WorkUnitEntity parent;

	public WorkUnitEntity() {
		super();
	}

	@Builder.Constructor
	public WorkUnitEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate,
			@Nullable WorkUnitEntity parent,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.parent = parent;
	}

	public WorkUnitEntity getParent() {
		return parent;
	}

	public void setParent(WorkUnitEntity parent) {
		this.parent = parent;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("parent.id", Optional.ofNullable(parent).map(WorkUnitEntity::getId).orElse(null)) // anti-recursion protection
			.toString();
	}

}
