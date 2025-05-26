package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
@Table("user")
public record UserEntity(
		@Id String id,
		String name,

		Integer fk_name_id,
  		Integer fk_email_id,
  		Integer fk_lang_pref_id,
  		Integer fk_phone_id,
  		String uuid,
  		String network_id,

		// tombstone fields
		@CreatedBy Integer createdBy,
		@CreatedDate Instant createdDate,
		@LastModifiedBy Integer lastModifiedBy,
		@LastModifiedDate Instant lastModifiedDate,
		@Version Long version
) {

	public static UserEntityBuilder builder() {
		return UserEntityBuilder.builder();
	}

	public static UserEntityBuilder builder(UserEntity user) {
		return UserEntityBuilder.builder(user);
	}

}
