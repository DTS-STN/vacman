package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entity representing language requirement code lookup table.
 * Maps to CD_LANGUAGE_REQUIREMENT database table.
 */
@Entity(name = "LanguageRequirement")
@Table(name = "[CD_LANGUAGE_REQUIREMENT]", uniqueConstraints = {
    @UniqueConstraint(name = "LNGRQR_UK", columnNames = "[LNG_REQUIREMENT_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[LNG_REQUIREMENT_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[LNG_REQUIREMENT_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[LNG_REQUIREMENT_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[LNG_REQUIREMENT_NAME_FR]"))
public class LanguageRequirementEntity extends AbstractLookupEntity {

    public LanguageRequirementEntity() {
        super();
    }
}
