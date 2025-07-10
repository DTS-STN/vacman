package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "PriorityLevel")
@Table(name = "[CD_PRIORITY_LEVEL]", uniqueConstraints = {
    @UniqueConstraint(name = "PRTYLVL_UK", columnNames = "[PRIORITY_LEVEL_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[PRIORITY_LEVEL_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[PRIORITY_LEVEL_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[PRIORITY_LEVEL_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[PRIORITY_LEVEL_NAME_FR]"))
public class PriorityLevelEntity extends AbstractLookupEntity {}
