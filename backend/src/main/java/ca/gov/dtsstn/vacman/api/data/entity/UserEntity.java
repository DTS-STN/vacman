package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Objects;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity(name = "User")
@Table(name = "[user]")
@EntityListeners({ AuditingEntityListener.class })
public class UserEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;

	@CreatedBy
	private String createdBy;

	@CreatedDate
	private Instant createdDate;

	@LastModifiedBy
	private String lastModifiedBy;

	@Version
	@LastModifiedDate
	private Instant lastModifiedDate;

	/**
	 * Default constructor (required by JPA).
	 */
	public UserEntity() {}

	/**
	 * Constructs a new UserEntity with all fields.
	 * @param name The name of the user.
	 * @param id The unique identifier of the user.
	 * @param createdBy The user who created this entity.
	 * @param createdDate The date and time when this entity was created.
	 * @param lastModifiedBy The user who last modified this entity.
	 * @param lastModifiedDate The date and time when this entity was last modified.
	 */
	@Builder.Constructor
	public UserEntity(
			String name,
			@Nullable Long id,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		this.id = id;
		this.name = name;
		this.createdBy = createdBy;
		this.createdDate = createdDate;
		this.lastModifiedBy = lastModifiedBy;
		this.lastModifiedDate = lastModifiedDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Instant getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Instant createdDate) {
		this.createdDate = createdDate;
	}

	public String getLastModifiedBy() {
		return lastModifiedBy;
	}

	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}

	public Instant getLastModifiedDate() {
		return lastModifiedDate;
	}

	public void setLastModifiedDate(Instant lastModifiedDate) {
		this.lastModifiedDate = lastModifiedDate;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) { return true; }
		if (obj == null) { return false; }
		if (getClass() != obj.getClass()) { return false; }

		final var other = (UserEntity) obj;

		return Objects.equals(id, other.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("id", id)
			.append("name", name)
			.append("createdBy", createdBy)
			.append("createdDate", createdDate)
			.append("lastModifiedBy", lastModifiedBy)
			.append("lastModifiedDate", lastModifiedDate)
			.toString();
	}
}
