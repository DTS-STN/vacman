package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "AssessmentResult")
@Table(name = "[CD_ASSESSMENT_RESULT]")
@AttributeOverride(name = "id", column = @Column(name = "[ASSESSMENT_RESULT_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[ASSESSMENT_RESULT_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[ASSESSMENT_RESULT_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[ASSESSMENT_RESULT_NAME_FR]"))
public class AssessmentResultEntity extends AbstractLookupEntity {}
