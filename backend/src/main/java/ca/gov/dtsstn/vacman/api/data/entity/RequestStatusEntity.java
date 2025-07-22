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

@Entity(name = "RequestStatus")
@Table(name = "[CD_REQUEST_STATUS]", uniqueConstraints = {
    @UniqueConstraint(name = "CDRSTS_UK", columnNames = "[REQUEST_STATUS_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_STATUS_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[REQUEST_STATUS_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[REQUEST_STATUS_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[REQUEST_STATUS_NAME_FR]"))
public class RequestStatusEntity extends AbstractLookupEntity {

	public RequestStatusEntity() {
		super();
	}

	@Builder.Constructor
	public RequestStatusEntity(
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
