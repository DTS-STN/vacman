package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.LocalDateTime;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "WorkUnit")
@Table(name = "[CD_WORK_UNIT]", uniqueConstraints = {
    @UniqueConstraint(name = "WRKUNT_UK", columnNames = "[WORK_UNIT_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[WORK_UNIT_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[WORK_UNIT_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[WORK_UNIT_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[WORK_UNIT_NAME_FR]"))
public class WorkUnitEntity extends AbstractLookupEntity {

	@ManyToOne
	@JoinColumn(name = "[PARENT_WORK_UNIT_ID]", nullable = true)
	protected WorkUnitEntity parent;

	public WorkUnitEntity getParent() {
		return parent;
	}

	@Builder.Constructor
	public WorkUnitEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nonnull LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate,
			@Nullable WorkUnitEntity parent) {
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate);
		this.parent = parent;
	}


	public void setParent(WorkUnitEntity parent) {
		this.parent = parent;
	}

	public WorkUnitEntity() {
		super();
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("parent", parent)
			.toString();
	}

}
