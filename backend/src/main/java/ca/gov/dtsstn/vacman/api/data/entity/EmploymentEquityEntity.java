package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entity representing employment equity code lookup table.
 * Maps to CD_EMPLOYMENT_EQUITY database table.
 */
@Entity(name = "EmploymentEquity")
@Table(name = "[CD_EMPLOYMENT_EQUITY]", uniqueConstraints = {
    @UniqueConstraint(name = "EMPLYMNTEQT_UK", columnNames = "[EMPLOYMENT_EQUITY_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[EMPLOYMENT_EQUITY_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[EMPLOYMENT_EQUITY_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EMPLOYMENT_EQUITY_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EMPLOYMENT_EQUITY_NAME_FR]"))
public class EmploymentEquityEntity extends AbstractLookupEntity {

    public EmploymentEquityEntity() {
        super();
    }
}
