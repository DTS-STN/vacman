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

@Entity(name = "RequestEmploymentTenure")
@Table(name = "[REQUEST_EMPLOYMENT_TENURE]", uniqueConstraints = {
    @UniqueConstraint(name = "PEMPTNR_UKv1", columnNames = {"[REQUEST_ID]", "[EMPLOYMENT_TENURE_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_EMPLOYMENT_TENURE_ID]", columnDefinition = "NUMERIC(10) IDENTITY NOT FOR REPLICATION"))
public class RequestEmploymentTenureEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[EMPLOYMENT_TENURE_ID]", nullable = false)
	private EmploymentTenureEntity employmentTenure;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	public RequestEmploymentTenureEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEmploymentTenureEntity(
			@Nullable Long id,
			@Nullable EmploymentTenureEntity employmentTenure,
			@Nullable RequestEntity request,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.employmentTenure = employmentTenure;
		this.request = request;
	}

	public EmploymentTenureEntity getEmploymentTenure() {
		return employmentTenure;
	}

	public void setEmploymentTenure(EmploymentTenureEntity employmentTenure) {
		this.employmentTenure = employmentTenure;
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
			.append("employmentTenure", employmentTenure)
			.append("request", request)
			.toString();
	}

}
