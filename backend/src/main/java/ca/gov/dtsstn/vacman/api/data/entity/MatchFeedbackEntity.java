package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.hibernate.annotations.Immutable;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "MatchFeedback")
@Immutable
@Table(name = "[CD_MATCH_FEEDBACK]")
public class MatchFeedbackEntity extends AbstractCodeEntity {

	public MatchFeedbackEntity() {
		super();
	}

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
