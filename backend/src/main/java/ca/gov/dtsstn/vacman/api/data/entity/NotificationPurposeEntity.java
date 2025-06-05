package ca.gov.dtsstn.vacman.api.data.entity;

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
public class NotificationPurposeEntity extends AbstractLookupEntity {}
