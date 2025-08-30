package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Arrays;
import java.util.function.Predicate;

import org.springframework.core.style.ToStringCreator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;

@MappedSuperclass
@EntityListeners({ AuditingEntityListener.class })
public abstract class AbstractBaseEntity {

	/**
	 * Returns a predicate that can be used to filter collections by id.
	 */
	public static <T extends AbstractBaseEntity> Predicate<T> byId(Long... ids) {
		return entity -> Arrays.asList(ids).contains(entity.getId());
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "[ID]", nullable = false, unique = true, updatable = false)
	protected Long id;

	@JsonIgnore
	@CreatedBy
	@Column(name = "[USER_CREATED]", length = 50, nullable = false, updatable = false)
	protected String createdBy;

	@JsonIgnore
	@CreatedDate
	@Column(name = "[DATE_CREATED]", nullable = false, updatable = false)
	protected Instant createdDate;

	@JsonIgnore
	@LastModifiedBy
	@Column(name = "[USER_UPDATED]", length = 50)
	protected String lastModifiedBy;

	@JsonIgnore
	@Version
	@LastModifiedDate
	@Column(name = "[DATE_UPDATED]")
	protected Instant lastModifiedDate;

	public AbstractBaseEntity() {
		super();
	}

	public AbstractBaseEntity(
			@Nullable Long id,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		this.id = id;
		this.createdBy = createdBy;
		this.createdDate = createdDate;
		this.lastModifiedBy = lastModifiedBy;
		this.lastModifiedDate = lastModifiedDate;
	}

	public Long getId() {
		return id;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public Instant getCreatedDate() {
		return createdDate;
	}

	public String getLastModifiedBy() {
		return lastModifiedBy;
	}

	public Instant getLastModifiedDate() {
		return lastModifiedDate;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) { return true; }
		if (obj == null) { return false; }
		if (getClass() != obj.getClass()) { return false; }

		final var other = (AbstractBaseEntity) obj;
		return id != null && id.equals(other.id);
	}

	@Override
	public int hashCode() {
		return id != null ? id.hashCode() : getClass().hashCode();
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("id", id)
			.append("createdBy", createdBy)
			.append("createdDate", createdDate)
			.append("lastModifiedBy", lastModifiedBy)
			.append("lastModifiedDate", lastModifiedDate)
			.toString();
	}

}
