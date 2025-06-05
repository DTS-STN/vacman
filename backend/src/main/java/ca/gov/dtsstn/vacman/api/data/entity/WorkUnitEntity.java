package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "WorkUnit")
@Table(name = "[CD_WORK_UNIT]")
@AttributeOverride(name = "id", column = @Column(name = "[WORK_UNIT_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[WORK_UNIT_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[WORK_UNIT_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[WORK_UNIT_NAME_FR]"))
public class WorkUnitEntity extends AbstractLookupEntity {}
