package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "EducationLevel")
@Table(name = "[CD_EDUCATION_LEVEL]")
@AttributeOverride(name = "id", column = @Column(name = "[EDUCATION_LEVEL_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[EDUCATION_LEVEL_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EDUCATION_LEVEL_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EDUCATION_LEVEL_NAME_FR]"))
public class EducationLevelEntity extends AbstractLookupEntity {}
