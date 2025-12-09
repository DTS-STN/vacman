package ca.gov.dtsstn.vacman.api.service.notify;

import java.io.Serializable;

import org.immutables.value.Value.Immutable;
import org.immutables.value.Value.Style;
import org.immutables.value.Value.Style.ValidationMethod;
import org.jspecify.annotations.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;

import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

@Immutable
@Style(validationMethod = ValidationMethod.NONE)
@JsonSerialize(as = ImmutableNotificationReceipt.class)
@JsonDeserialize(as = ImmutableNotificationReceipt.class)
public interface NotificationReceipt {

	@JsonProperty("content")
	NotificationReceiptContent getContent();

	@JsonProperty("id")
	String getId();

	@Nullable
	@JsonProperty("reference")
	String getReference();

	@JsonProperty("template")
	NotificationReceiptTemplate getTemplate();

	@JsonProperty("uri")
	String getUri();

	@Immutable
	@Style(validationMethod = ValidationMethod.NONE)
	@JsonSerialize(as = ImmutableNotificationReceiptContent.class)
	@JsonDeserialize(as = ImmutableNotificationReceiptContent.class)
	public interface NotificationReceiptContent extends Serializable {

		@JsonProperty("body")
		String getBody();

		@JsonProperty("from_email")
		String getFromEmail();

		@JsonProperty("subject")
		String getSubject();

	}

	@Immutable
	@Style(validationMethod = ValidationMethod.NONE)
	@JsonSerialize(as = ImmutableNotificationReceiptTemplate.class)
	@JsonDeserialize(as = ImmutableNotificationReceiptTemplate.class)
	public interface NotificationReceiptTemplate extends Serializable {

		@JsonProperty("id")
		String getId();

		@JsonProperty("uri")
		String getUri();

		@JsonProperty("version")
		String getVersion();

	}

}
