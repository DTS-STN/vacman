package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "AssessmentResult")
@Table(name = "[CD_ASSESSMENT_RESULT]", uniqueConstraints = {
    @UniqueConstraint(name = "ASMNTRSLT_UK", columnNames = "[ASSESSMENT_RESULT_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[ASSESSMENT_RESULT_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[ASSESSMENT_RESULT_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[ASSESSMENT_RESULT_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[ASSESSMENT_RESULT_NAME_FR]"))
public class AssessmentResultEntity extends AbstractLookupEntity {}
