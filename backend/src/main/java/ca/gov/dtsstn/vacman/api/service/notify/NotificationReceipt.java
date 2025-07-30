package ca.gov.dtsstn.vacman.api.service.notify;

import java.io.Serializable;

import org.immutables.value.Value.Immutable;
import org.immutables.value.Value.Style;
import org.immutables.value.Value.Style.ValidationMethod;
import org.springframework.lang.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

/**
 * @author based on code by Greg Baker
 */
@Immutable
@Style(validationMethod = ValidationMethod.NONE)
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
