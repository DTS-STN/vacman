package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entity representing selection process type code lookup table.
 * Maps to CD_SELECTION_PROCESS_TYPE database table.
 */
@Entity(name = "SelectionProcessType")
@Table(name = "[CD_SELECTION_PROCESS_TYPE]", uniqueConstraints = {
    @UniqueConstraint(name = "SLCTNPRCSSTYP_UK", columnNames = "[SELECTION_PROCESS_TYPE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[SELECTION_PROCESS_TYPE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[SELECTION_PROCESS_TYPE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[SELECTION_PROCESS_TYPE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[SELECTION_PROCESS_TYPE_NAME_FR]"))
public class SelectionProcessTypeEntity extends AbstractLookupEntity {

    public SelectionProcessTypeEntity() {
        super();
    }
}
