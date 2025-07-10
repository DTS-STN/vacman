package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "EmploymentTenure")
@Table(name = "[CD_EMPLOYMENT_TENURE]", uniqueConstraints = {
    @UniqueConstraint(name = "EMPTNR_UK", columnNames = "[EMPLOYMENT_TENURE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[EMPLOYMENT_TENURE_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[EMPLOYMENT_TENURE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EMPLOYMENT_TENURE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EMPLOYMENT_TENURE_NAME_FR]"))
public class EmploymentTenureEntity extends AbstractLookupEntity {}
