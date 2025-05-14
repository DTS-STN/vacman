package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.PersistenceCreator;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
		@Transient boolean isNew) implements Persistable<String> {

	@PersistenceCreator
	public UserEntity(
			String id,
			String name,

			// tombstone fields
			String createdBy,
			Instant createdDate,
			String lastModifiedBy,
			Instant lastModifiedDate) {
		this(name, id, createdBy, createdDate, lastModifiedBy, lastModifiedDate, false);
	}

	@Override
	public String getId() {
		return this.id;
	}

	@Override
	@JsonIgnore
	public boolean isNew() {
		return Optional.ofNullable(this.isNew).orElse(this.id == null);
	}

}