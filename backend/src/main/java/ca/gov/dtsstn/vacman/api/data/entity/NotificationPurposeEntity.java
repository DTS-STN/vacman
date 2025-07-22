package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "NotificationPurpose")
@Table(name = "[CD_NOTIFICATION_PURPOSE]")
@AttributeOverride(name = "id", column = @Column(name = "[NOTIFICATION_PURPOSE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[NOTIFICATION_PURPOSE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[NOTIFICATION_PURPOSE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[NOTIFICATION_PURPOSE_NAME_FR]"))
public class NotificationPurposeEntity extends AbstractLookupEntity {

	public NotificationPurposeEntity() {
		super();
	}

	@Builder.Constructor
	public NotificationPurposeEntity(
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
