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

@Entity(name = "RequestCity")
@Table(name = "[REQUEST_CITY]", uniqueConstraints = {
    @UniqueConstraint(name = "RQSTCTY_UK", columnNames = {"[CITY_ID]", "[REQUEST_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_CITY_ID]", columnDefinition = "NUMERIC(10) IDENTITY NOT FOR REPLICATION"))
public class RequestCityEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = false)
	private CityEntity city;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	public RequestCityEntity() {
		super();
	}

	@Builder.Constructor
	public RequestCityEntity(
			@Nullable Long id,
			@Nullable CityEntity city,
			@Nullable RequestEntity request,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.city = city;
		this.request = request;
	}

	public CityEntity getCity() {
		return city;
	}

	public void setCity(CityEntity city) {
		this.city = city;
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
			.append("city", city)
			.append("request", request)
			.toString();
	}

}
