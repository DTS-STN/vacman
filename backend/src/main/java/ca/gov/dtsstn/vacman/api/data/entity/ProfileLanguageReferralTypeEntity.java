package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Objects;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "ProfileLanguageReferralType")
@Table(name = "[PROFILE_LANGUAGE_REFERRAL_TYPE]", uniqueConstraints = { @UniqueConstraint(name = "PLNGRLTYP_UK", columnNames = { "[PROFILE_ID]", "[LANGUAGE_REFERRAL_TYPE_ID]" }) })
public class ProfileLanguageReferralTypeEntity extends AbstractBaseEntity {

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_REFERRAL_TYPE_ID]", nullable = false)
	private LanguageReferralTypeEntity languageReferralType;

	public ProfileLanguageReferralTypeEntity() {
		super();
	}

	@Builder.Constructor
	public ProfileLanguageReferralTypeEntity(
			@Nullable Long id,
			@Nullable LanguageReferralTypeEntity languageReferralType,
			@Nullable ProfileEntity profile,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.languageReferralType = languageReferralType;
		this.profile = profile;
	}

	public LanguageReferralTypeEntity getLanguageReferralType() {
		return languageReferralType;
	}

	public void setLanguageReferralType(LanguageReferralTypeEntity languageReferralType) {
		this.languageReferralType = languageReferralType;
	}

	public ProfileEntity getProfile() {
		return profile;
	}

	public void setProfile(ProfileEntity profile) {
		this.profile = profile;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("languageReferralType", languageReferralType)
			.append("profile", profile)
			.toString();
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof ProfileLanguageReferralTypeEntity that)) {
			return false;
		}

		return Objects.equals(this.profile, that.profile) && Objects.equals(this.languageReferralType, that.languageReferralType);

	}

	@Override
	public int hashCode() {
		return Objects.hash(profile, languageReferralType);
	}

}
