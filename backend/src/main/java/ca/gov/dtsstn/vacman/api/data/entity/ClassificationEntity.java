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

@Entity(name = "Classification")
@Table(name = "[CD_CLASSIFICATION]", uniqueConstraints = {
    @UniqueConstraint(name = "CLSFCTN_UK", columnNames = "[CLASSIFICATION_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[CLASSIFICATION_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[CLASSIFICATION_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[CLASSIFICATION_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[CLASSIFICATION_NAME_FR]"))
public class ClassificationEntity extends AbstractLookupEntity {

	public ClassificationEntity() {
		super();
	}

	@Builder.Constructor
	public ClassificationEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
