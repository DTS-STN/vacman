package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entity representing employment opportunity code lookup table.
 * Maps to CD_EMPLOYMENT_OPPORTUNITY database table.
 */
@Entity(name = "EmploymentOpportunity")
@Table(name = "[CD_EMPLOYMENT_OPPORTUNITY]", uniqueConstraints = {
    @UniqueConstraint(name = "EMPOPPR_UK", columnNames = "[EMPLOYMENT_OPPORTUNITY_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[EMPLOYMENT_OPPORTUNITY_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[EMPLOYMENT_OPPORTUNITY_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EMPLOYMENT_OPPORTUNITY_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EMPLOYMENT_OPPORTUNITY_NAME_FR]"))
public class EmploymentOpportunityEntity extends AbstractLookupEntity {

    public EmploymentOpportunityEntity() {
        super();
    }
}
