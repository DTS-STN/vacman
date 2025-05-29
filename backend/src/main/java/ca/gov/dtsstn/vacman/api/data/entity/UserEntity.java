package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "User")
@Table(name = "[user]")
public class UserEntity extends AbstractEntity {

	private String name;

	/**
	 * Default constructor (required by JPA).
	 */
	public UserEntity() {
		super();
	}

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
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("name", name)
			.toString();
	}

}
