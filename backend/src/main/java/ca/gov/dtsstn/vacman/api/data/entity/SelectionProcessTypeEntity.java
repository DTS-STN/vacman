package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
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
public class SelectionProcessTypeEntity extends AbstractCodeEntity {

    public SelectionProcessTypeEntity() {
        super();
    }

    @Builder.Constructor
    public SelectionProcessTypeEntity(
            @Nullable Long id,
            @Nullable String code,
            @Nullable String nameEn,
            @Nullable String nameFr,
            @Nullable Instant effectiveDate,
            @Nullable Instant expiryDate,
            @Nullable String createdBy,
            @Nullable Instant createdDate,
            @Nullable String lastModifiedBy,
            @Nullable Instant lastModifiedDate) {
        super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
    }

    @Override
    public String toString() {
        return new ToStringCreator(this)
                .append("super", super.toString())
                .toString();
    }
}
