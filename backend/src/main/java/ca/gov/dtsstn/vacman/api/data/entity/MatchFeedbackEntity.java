package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.hibernate.annotations.Immutable;
import org.immutables.builder.Builder;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "MatchFeedback")
@Table(name = "[CD_MATCH_FEEDBACK]")
public class MatchFeedbackEntity extends AbstractCodeEntity {

	public static MatchFeedbackEntityBuilder builder() {
		return new MatchFeedbackEntityBuilder();
	}

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
}
