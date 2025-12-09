package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Objects;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "RequestLanguageRequirement")
@Table(name = "[REQUEST_LANGUAGE_REQUIREMENT]")
public class RequestLanguageRequirementEntity extends AbstractBaseEntity {

	public static RequestLanguageRequirementEntityBuilder builder() {
		return new RequestLanguageRequirementEntityBuilder();
	}

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_REQUIREMENT_ID]", nullable = false)
	private LanguageRequirementEntity languageRequirement;

	@ManyToOne
	@JsonBackReference
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	public RequestLanguageRequirementEntity() {
		super();
	}

	@Builder.Constructor
	public RequestLanguageRequirementEntity(
			@Nullable Long id,
			@Nullable LanguageRequirementEntity languageRequirement,
			@Nullable RequestEntity request,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.languageRequirement = languageRequirement;
		this.request = request;
	}

	public LanguageRequirementEntity getLanguageRequirement() {
		return languageRequirement;
	}

	public void setLanguageRequirement(LanguageRequirementEntity languageRequirement) {
		this.languageRequirement = languageRequirement;
	}

	public RequestEntity getRequest() {
		return request;
	}

	public void setRequest(RequestEntity request) {
		this.request = request;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) { return true; }
		if (obj == null) { return false; }
		if (getClass() != obj.getClass()) { return false; }

		final var other = (RequestLanguageRequirementEntity) obj;

		return Objects.equals(languageRequirement, other.languageRequirement)
			&& Objects.equals(request, other.request);
	}

	@Override
	public int hashCode() {
		return Objects.hash(languageRequirement, request);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("languageRequirement", languageRequirement)
			.append("request.id", request.id)
			.toString();
	}

}
