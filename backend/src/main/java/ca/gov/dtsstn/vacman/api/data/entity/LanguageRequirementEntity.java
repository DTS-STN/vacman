package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
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
@AttributeOverride(name = "createdDate", column = @Column(name = "[DATE_CREATED]", columnDefinition = "DATE"))
@AttributeOverride(name = "lastModifiedDate", column = @Column(name = "[DATE_UPDATED]", columnDefinition = "DATE"))
public class LanguageRequirementEntity extends AbstractCodeEntity {

    public LanguageRequirementEntity() {
        super();
    }

    @Builder.Constructor
    public LanguageRequirementEntity(
            @Nullable Long id,
            @Nullable String code,
            @Nullable String nameEn,
            @Nullable String nameFr,
            @Nonnull Instant effectiveDate,
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
