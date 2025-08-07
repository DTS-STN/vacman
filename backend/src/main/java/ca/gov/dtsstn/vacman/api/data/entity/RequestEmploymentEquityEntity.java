package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "RequestEmploymentEquity")
@Table(name = "[REQUEST_EMPLOYMENT_EQUITY]", uniqueConstraints = { @UniqueConstraint(name = "RQSTEMPLYMNTEQT_UK", columnNames = { "[EMPLOYMENT_EQUITY_ID]", "[REQUEST_ID]" }) })
public class RequestEmploymentEquityEntity extends AbstractBaseEntity {

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_EQUITY_ID]", nullable = false)
	private EmploymentEquityEntity employmentEquity;

	@ManyToOne
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
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("employmentEquity", employmentEquity)
			.append("request", request)
			.toString();
	}

}
