package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "User")
@AttributeOverride(name = "id", column = @Column(name = "[USER_ID]"))
@Table(name = "[USER]", uniqueConstraints = { @UniqueConstraint(name = "USER_NAME_UK", columnNames = { "[NETWORK_NAME]", "[UU_NAME]" }) })
public class UserEntity extends AbstractBaseEntity {

	@Column(name = "[BUSINESS_EMAIL_ADDRESS]", length = 320, nullable = false)
	private String businessEmailAddress;

	@Column(name = "[BUSINESS_PHONE_NUMBER]", length = 15, nullable = true)
	private String businessPhoneNumber;

	@Column(name = "[FIRST_NAME]", length = 100, nullable = false)
	private String firstName;

	@Column(name = "[INITIAL]", length = 4, nullable = true)
	private String initial;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = false)
	private LanguageEntity language;

	@Column(name = "[LAST_NAME]", length = 100, nullable = false)
	private String lastName;

	@Column(name = "[MIDDLE_NAME]", length = 100, nullable = true)
	private String middleName;

	@Column(name = "[NETWORK_NAME]", length = 50, nullable = false)
	private String activeDirectoryId;

	@Column(name = "[PERSONAL_RECORD_IDENTIFIER]", length = 10, nullable = true)
	private String personalRecordIdentifier;

	// Profile relationship - One user can have many profiles
	// User does not own the FK, Profile does
	// This creates a bidirectional one-to-many relationship where Profile owns the FK
	// No cascade on User side to avoid deletion conflicts
	@OneToMany(mappedBy = "user")
	private Set<ProfileEntity> profiles = new HashSet<>();

	@ManyToOne
	@JoinColumn(name = "[USER_TYPE_ID]", nullable = false)
	private UserTypeEntity userType;

	@Column(name = "[UU_NAME]", length = 50, nullable = false)
	private String uuid;

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
			@Nullable String middleName,
			@Nullable String activeDirectoryId,
			@Nullable String personalRecordIdentifier,
			@Nullable Set<ProfileEntity> profiles,
			@Nullable UserTypeEntity userType,
			@Nullable String uuid,
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
		this.middleName = middleName;
		this.activeDirectoryId = activeDirectoryId;
		this.personalRecordIdentifier = personalRecordIdentifier;
		this.userType = userType;
		this.uuid = uuid;

		if (profiles != null) {
			this.profiles.addAll(profiles);
		}
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

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getMiddleName() {
		return middleName;
	}

	public void setMiddleName(String middleName) {
		this.middleName = middleName;
	}

	public String getActiveDirectoryId() {
		return activeDirectoryId;
	}

	public void setActiveDirectoryId(String activeDirectoryId) {
		this.activeDirectoryId = activeDirectoryId;
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
		this.profiles.clear();
		if (profiles != null) {
			this.profiles.addAll(profiles);
		}
	}

	public UserTypeEntity getUserType() {
		return userType;
	}

	public void setUserType(UserTypeEntity userType) {
		this.userType = userType;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
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
			.append("middleName", middleName)
			.append("activeDirectoryId", activeDirectoryId)
			.append("personalRecordIdentifier", personalRecordIdentifier)
			.append("profiles", profiles)
			.append("userType", userType)
			.append("uuid", uuid)
			.toString();
	}

}