package ca.gov.dtsstn.vacman.api.data.entity;

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
public class WorkScheduleEntity extends AbstractLookupEntity {

    public WorkScheduleEntity() {
        super();
    }
}
