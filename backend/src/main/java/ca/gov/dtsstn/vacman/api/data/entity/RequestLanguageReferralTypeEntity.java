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

@Entity(name = "RequestLanguageReferralType")
@Table(name = "[REQUEST_LANGUAGE_REFERRAL_TYPE]", uniqueConstraints = {
    @UniqueConstraint(name = "RLNGRLTYP_UK", columnNames = {"[REQUEST_ID]", "[LANGUAGE_REFERRAL_TYPE_ID]"})
})
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_LANGUAGE_REFERRAL_TYPE_ID]"))
public class RequestLanguageReferralTypeEntity extends AbstractEntity {

	@ManyToOne
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_REFERRAL_TYPE_ID]", nullable = false)
	private LanguageReferralTypeEntity languageReferralType;

	public RequestLanguageReferralTypeEntity() {
		super();
	}

	@Builder.Constructor
	public RequestLanguageReferralTypeEntity(
			@Nullable Long id,
			@Nullable RequestEntity request,
			@Nullable LanguageReferralTypeEntity languageReferralType,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.request = request;
		this.languageReferralType = languageReferralType;
	}

	public RequestEntity getRequest() {
		return request;
	}

	public void setRequest(RequestEntity request) {
		this.request = request;
	}

	public LanguageReferralTypeEntity getLanguageReferralType() {
		return languageReferralType;
	}

	public void setLanguageReferralType(LanguageReferralTypeEntity languageReferralType) {
		this.languageReferralType = languageReferralType;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("request", request)
			.append("languageReferralType", languageReferralType)
			.toString();
	}

}
