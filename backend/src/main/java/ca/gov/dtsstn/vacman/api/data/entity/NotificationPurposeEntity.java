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

@Entity(name = "NotificationPurpose")
@Table(name = "[CD_NOTIFICATION_PURPOSE]", uniqueConstraints = {
    @UniqueConstraint(name = "NTFCTNPRPS_UK", columnNames = "[NOTIFICATION_PURPOSE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[NOTIFICATION_PURPOSE_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[NOTIFICATION_PURPOSE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[NOTIFICATION_PURPOSE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[NOTIFICATION_PURPOSE_NAME_FR]"))
public class NotificationPurposeEntity extends AbstractLookupEntity {

	@Column(name = "[GC_NOTIFY_TEMPLATE_ID]", length = 36, nullable = false)
	private String gcNotifyTemplateId;

	public NotificationPurposeEntity() {
		super();
	}

	@Builder.Constructor
	public NotificationPurposeEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable String gcNotifyTemplateId,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.gcNotifyTemplateId = gcNotifyTemplateId;
	}

	public String getGcNotifyTemplateId() {
		return gcNotifyTemplateId;
	}

	public void setGcNotifyTemplateId(String gcNotifyTemplateId) {
		this.gcNotifyTemplateId = gcNotifyTemplateId;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("gcNotifyTemplateId", gcNotifyTemplateId)
			.toString();
	}
}
