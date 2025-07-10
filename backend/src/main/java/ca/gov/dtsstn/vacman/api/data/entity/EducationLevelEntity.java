package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "EducationLevel")
@Table(name = "[CD_EDUCATION_LEVEL]", uniqueConstraints = {
    @UniqueConstraint(name = "EDCTNLVL_UK", columnNames = "[EDUCATION_LEVEL_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[EDUCATION_LEVEL_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[EDUCATION_LEVEL_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EDUCATION_LEVEL_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EDUCATION_LEVEL_NAME_FR]"))
public class EducationLevelEntity extends AbstractLookupEntity {}
