package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "EmploymentTenure")
@Table(name = "[CD_EMPLOYMENT_TENURE]")
@AttributeOverride(name = "id", column = @Column(name = "[EMPLOYMENT_TENURE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[EMPLOYMENT_TENURE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EMPLOYMENT_TENURE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EMPLOYMENT_TENURE_NAME_FR]"))
public class EmploymentTenureEntity extends AbstractLookupEntity {}
