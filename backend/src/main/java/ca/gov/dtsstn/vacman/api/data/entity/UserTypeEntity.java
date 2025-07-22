package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "UserType")
@Table(name = "[CD_USER_TYPE]", uniqueConstraints = {
    @UniqueConstraint(name = "USERTYP_UK", columnNames = "[USER_TYPE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[USER_TYPE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[USER_TYPE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[USER_TYPE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[USER_TYPE_NAME_FR]"))
public class UserTypeEntity extends AbstractLookupEntity {

	public UserTypeEntity() {
		super();
	}

	@Builder.Constructor
	public UserTypeEntity(
			Long id,
			String code,
			String nameEn,
			String nameFr,
			String createdBy,
			Instant createdDate,
			String lastModifiedBy,
			Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
