package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "Notification")
@Table(name = "[NOTIFICATION]")
@AttributeOverride(name = "id", column = @Column(name = "[NOTIFICATION_ID]"))
public class NotificationEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[NOTIFICATION_PURPOSE_ID]", nullable = false)
	private NotificationPurposeEntity notificationPurpose;

	private ProfileEn

	public NotificationEntity() {
		super();
	}

	public NotificationEntity(
			@Nullable Long id,
			@Nullable NotificationPurposeEntity notificationPurpose,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.notificationPurpose = notificationPurpose;
	}

	public NotificationPurposeEntity getNotificationPurpose() {
		return notificationPurpose;
	}

	public void setNotificationPurpose(NotificationPurposeEntity notificationPurpose) {
		this.notificationPurpose = notificationPurpose;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("notificationPurpose", notificationPurpose)
			.toString();
	}

}