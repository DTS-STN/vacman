package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.collections4.CollectionUtils;
import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "User")
@Table(name = "[USER]")
public class UserEntity extends AbstractBaseEntity implements Ownable {

	public static UserEntityBuilder builder() {
		return new UserEntityBuilder();
	}

	@Column(name = "[BUSINESS_EMAIL_ADDRESS]", length = 320, nullable = false)
	private String businessEmailAddress;

	@Column(name = "[BUSINESS_PHONE_NUMBER]", length = 15, nullable = true)
	private String businessPhoneNumber;

	@Column(name = "[FIRST_NAME]", length = 100, nullable = false)
	private String firstName;

	@Column(name = "[INITIAL]", length = 4, nullable = true)
	private String initial;

	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = false)
	private LanguageEntity language;

	@Column(name = "[LAST_NAME]", length = 100, nullable = false)
	private String lastName;

	@Column(name = "[MS_ENTRA_ID]", length = 50, nullable = false)
	private String microsoftEntraId;

	@Column(name = "[MIDDLE_NAME]", length = 100, nullable = true)
	private String middleName;

	@Column(name = "[PERSONAL_RECORD_IDENTIFIER]", length = 10, nullable = true)
	private String personalRecordIdentifier;

	@JsonIgnore
	@OneToMany(mappedBy = "user")
	private Set<ProfileEntity> profiles = new HashSet<>();

	@ManyToOne
	@JsonIgnore
	@JoinColumn(name = "[USER_TYPE_ID]", nullable = false)
	private UserTypeEntity userType;

	public UserEntity() {
		super();
	}

	@Builder.Constructor
	public UserEntity(
			@Nullable Long id,
			@Nullable String businessEmailAddress,
			@Nullable String businessPhoneNumber,
			@Nullable String firstName,
			@Nullable String initial,
			@Nullable LanguageEntity language,
			@Nullable String lastName,
			@Nullable String microsoftEntraId,
			@Nullable String middleName,
			@Nullable String personalRecordIdentifier,
			@Nullable Set<ProfileEntity> profiles,
			@Nullable UserTypeEntity userType,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.businessEmailAddress = businessEmailAddress;
		this.businessPhoneNumber = businessPhoneNumber;
		this.firstName = firstName;
		this.initial = initial;
		this.language = language;
		this.lastName = lastName;
		this.microsoftEntraId = microsoftEntraId;
		this.middleName = middleName;
		this.personalRecordIdentifier = personalRecordIdentifier;
		this.profiles = profiles;
		this.userType = userType;
	}

	public String getBusinessEmailAddress() {
		return businessEmailAddress;
	}

	public void setBusinessEmailAddress(String businessEmailAddress) {
		this.businessEmailAddress = businessEmailAddress;
	}

	public String getBusinessPhoneNumber() {
		return businessPhoneNumber;
	}

	public void setBusinessPhoneNumber(String businessPhoneNumber) {
		this.businessPhoneNumber = businessPhoneNumber;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String name) {
		this.firstName = name;
	}

	public String getInitial() {
		return initial;
	}

	public void setInitial(String initial) {
		this.initial = initial;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getMicrosoftEntraId() {
		return microsoftEntraId;
	}

	public void setMicrosoftEntraId(String microsoftEntraId) {
		this.microsoftEntraId = microsoftEntraId;
	}

	public String getMiddleName() {
		return middleName;
	}

	public void setMiddleName(String middleName) {
		this.middleName = middleName;
	}

	public String getPersonalRecordIdentifier() {
		return personalRecordIdentifier;
	}

	public void setPersonalRecordIdentifier(String personalRecordIdentifier) {
		this.personalRecordIdentifier = personalRecordIdentifier;
	}

	public Set<ProfileEntity> getProfiles() {
		return profiles;
	}

	public void setProfiles(Set<ProfileEntity> profiles) {
		this.profiles = profiles;
	}

	public UserTypeEntity getUserType() {
		return userType;
	}

	public void setUserType(UserTypeEntity userType) {
		this.userType = userType;
	}

	@Override
	public Long getOwnerId() {
		// users own themselves, obviously
		return this.id;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("businessEmailAddress", businessEmailAddress)
			.append("businessPhoneNumber", businessPhoneNumber)
			.append("firstName", firstName)
			.append("initial", initial)
			.append("language", language)
			.append("lastName", lastName)
			.append("microsoftEntraId", microsoftEntraId)
			.append("middleName", middleName)
			.append("personalRecordIdentifier", personalRecordIdentifier)
			.append("profiles.size", CollectionUtils.size(profiles)) // anti-recursion protection
			.append("userType", userType)
			.toString();
	}

}
