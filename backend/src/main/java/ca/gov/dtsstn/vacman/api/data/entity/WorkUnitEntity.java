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

@Entity(name = "WorkUnit")
@Table(name = "[CD_WORK_UNIT]")
@AttributeOverride(name = "id", column = @Column(name = "[WORK_UNIT_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[WORK_UNIT_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[WORK_UNIT_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[WORK_UNIT_NAME_FR]"))
public class WorkUnitEntity extends AbstractLookupEntity {

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID_PARENT]", nullable = true)
	private WorkUnitEntity parent;

	public WorkUnitEntity() {
		super();
	}

	@Builder.Constructor
	public WorkUnitEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate,
			@Nullable WorkUnitEntity parent) {
		super(id, code, nameEn, nameFr, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
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
			.append("parent", parent)
			.toString();
	}

}
