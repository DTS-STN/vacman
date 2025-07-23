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

/**
 * Entity representing work schedule code lookup table.
 * Maps to CD_WORK_SCHEDULE database table.
 */
@Entity(name = "WorkSchedule")
@Table(name = "[CD_WORK_SCHEDULE]", uniqueConstraints = {
    @UniqueConstraint(name = "WRKSCHDL_UK", columnNames = "[WORK_SCHEDULE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[WORK_SCHEDULE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[WORK_SCHEDULE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[WORK_SCHEDULE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[WORK_SCHEDULE_NAME_FR]"))
public class WorkScheduleEntity extends AbstractCodeEntity {

    public WorkScheduleEntity() {
        super();
    }

    @Builder.Constructor
    public WorkScheduleEntity(
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
