package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.LocalDateTime;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

/**
 * Entity representing language requirement code lookup table.
 * Maps to CD_LANGUAGE_REQUIREMENT database table.
 */
@Entity(name = "LanguageRequirement")
@Table(name = "[CD_LANGUAGE_REQUIREMENT]", uniqueConstraints = {
    @UniqueConstraint(name = "LNGRQR_UK", columnNames = "[LNG_REQUIREMENT_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[LNG_REQUIREMENT_ID]"))
@AttributeOverride(name = "createdDate", column = @Column(name = "[DATE_CREATED]", columnDefinition = "DATE"))
@AttributeOverride(name = "lastModifiedDate", column = @Column(name = "[DATE_UPDATED]", columnDefinition = "DATE"))
public class LanguageRequirementEntity extends AbstractBusinessEntity {

    @Column(name = "[LNG_REQUIREMENT_CODE]", length = 20, nullable = false)
    protected String code;

    @Column(name = "[LNG_REQUIREMENT_NAME_EN]", length = 100, nullable = false)
    protected String nameEn;

    @Column(name = "[LNG_REQUIREMENT_NAME_FR]", length = 100, nullable = false)
    protected String nameFr;

    @Column(name = "[EFFECTIVE_DATE]", nullable = false)
    @NotNull(message = "Effective date is required")
    protected LocalDateTime effectiveDate;

    @Column(name = "[EXPIRY_DATE]")
    protected LocalDateTime expiryDate;

    public LanguageRequirementEntity() {
        super();
    }

    @Builder.Constructor
    public LanguageRequirementEntity(
            @Nullable Long id,
            @Nullable String code,
            @Nullable String nameEn,
            @Nullable String nameFr,
            @Nonnull LocalDateTime effectiveDate,
            @Nullable LocalDateTime expiryDate) {
        super(id);
        this.code = code;
        this.nameEn = nameEn;
        this.nameFr = nameFr;
        if (effectiveDate == null) {
            throw new IllegalArgumentException("Effective date cannot be null");
        }
        this.effectiveDate = effectiveDate;
        this.expiryDate = expiryDate;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getNameFr() {
        return nameFr;
    }

    public void setNameFr(String nameFr) {
        this.nameFr = nameFr;
    }

    public LocalDateTime getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDateTime effectiveDate) {
        if (effectiveDate == null) {
            throw new IllegalArgumentException("Effective date cannot be null");
        }
        this.effectiveDate = effectiveDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    @Override
    public String toString() {
        return new ToStringCreator(this)
                .append("id", getId())
                .append("code", getCode())
                .append("nameEn", getNameEn())
                .append("nameFr", getNameFr())
                .append("effectiveDate", getEffectiveDate())
                .append("expiryDate", getExpiryDate())
                .append("createdBy", getCreatedBy())
                .append("createdDate", getCreatedDate())
                .append("lastModifiedBy", getLastModifiedBy())
                .append("lastModifiedDate", getLastModifiedDate())
                .toString();
    }

}
