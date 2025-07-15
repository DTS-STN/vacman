package ca.gov.dtsstn.vacman.api.data.entity;

import java.util.Objects;

import org.springframework.core.style.ToStringCreator;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Abstract entity for main business entities with NUMERIC(10) ID constraints.
 * Maximum ID value: 9,999,999,999
 */
@MappedSuperclass
@EntityListeners({ AuditingEntityListener.class })
public abstract class AbstractBusinessEntity extends AbstractAuditableEntity {

	public static final long MAX_BUSINESS_ID = 9_999_999_999L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false, updatable = false)
	@Min(value = 1, message = "ID must be positive")
	@Max(value = MAX_BUSINESS_ID, message = "ID cannot exceed " + MAX_BUSINESS_ID)
	protected Long id;

	public AbstractBusinessEntity() {}

	public AbstractBusinessEntity(@Nullable Long id) {
		super();
		this.id = id;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		if (id != null && id > MAX_BUSINESS_ID) {
			throw new IllegalArgumentException("ID cannot exceed " + MAX_BUSINESS_ID);
		}
		this.id = id;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) { return true; }
		if (obj == null) { return false; }
		if (getClass() != obj.getClass()) { return false; }

		final var other = (AbstractBusinessEntity) obj;
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
			.append("super", super.toString())
			.toString();
	}

}
