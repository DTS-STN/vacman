package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "MatchFeedback")
@Table(name = "[CD_MATCH_FEEDBACK]", uniqueConstraints = { @UniqueConstraint(name = "MTCHFDBCK_UK", columnNames = "[MATCH_FEEDBACK_NAME_EN]") })
public class MatchFeedbackEntity extends AbstractCodeEntity {

	public MatchFeedbackEntity() {
		super();
	}

	@Builder.Constructor
	public MatchFeedbackEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
