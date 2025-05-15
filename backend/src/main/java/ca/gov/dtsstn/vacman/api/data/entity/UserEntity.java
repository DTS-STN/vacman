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

		// tombstone fields
		@CreatedBy String createdBy,
		@CreatedDate Instant createdDate,
		@LastModifiedBy String lastModifiedBy,
		@LastModifiedDate Instant lastModifiedDate,
		@Version Long version
) {}