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

@Entity(name = "RequestEmploymentEquity")
@Table(name = "[REQUEST_EMPLOYMENT_EQUITY]")
public class RequestEmploymentEquityEntity extends AbstractBaseEntity {

	public static RequestEmploymentEquityEntityBuilder builder() {
		return new RequestEmploymentEquityEntityBuilder();
	}

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_EQUITY_ID]", nullable = false)
	private EmploymentEquityEntity employmentEquity;

	@ManyToOne
	@JsonBackReference
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	public RequestEmploymentEquityEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEmploymentEquityEntity(
			@Nullable Long id,
			@Nullable EmploymentEquityEntity employmentEquity,
			@Nullable RequestEntity request,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.employmentEquity = employmentEquity;
		this.request = request;
	}

	public EmploymentEquityEntity getEmploymentEquity() {
		return employmentEquity;
	}

	public void setEmploymentEquity(EmploymentEquityEntity employmentEquity) {
		this.employmentEquity = employmentEquity;
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

		final var other = (RequestEmploymentEquityEntity) obj;

		return Objects.equals(employmentEquity, other.employmentEquity)
			&& Objects.equals(request, other.request);
	}

	@Override
	public int hashCode() {
		return Objects.hash(employmentEquity, request);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("employmentEquity", employmentEquity)
			.append("request.id", request.id)
			.toString();
	}

}
