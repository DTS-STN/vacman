package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Set;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity(name = "User")
@Table(name = "[USER]")
@AttributeOverride(name = "id", column = @Column(name = "[USER_ID]", columnDefinition = "NUMERIC"))
public class UserEntity extends AbstractEntity {

	@Column(name = "[BUSINESS_EMAIL_ADDRESS]", length = 320, nullable = false)
	private String businessEmailAddress;

	@Column(name = "[BUSINESS_PHONE_NUMBER]", length = 15)
	private String businessPhoneNumber;

	@Column(name = "[FIRST_NAME]", length = 100, nullable = false)
	private String firstName;

	@Column(name = "[INITIAL]", length = 4)
	private String initial;

	@ManyToOne
	@JoinColumn(name = "[LANGUAGE_ID]", nullable = false)
	private LanguageEntity language;

	@Column(name = "[LAST_NAME]", length = 100, nullable = false)
	private String lastName;

	@Column(name = "[MIDDLE_NAME]", length = 100)
	private String middelName;

	@Column(name = "[NETWORK_NAME]", length = 50, nullable = false)
	private String networkName;

	@ManyToOne
	@JoinColumn(name = "[NOTIFICATION_PURPOSE_ID]", nullable = false)
	private NotificationPurposeEntity notificationPurposeEntity;

	@Column(name = "[PERSONAL_RECORD_IDENTIFIER]", length = 10)
	private String pri;

	@JoinColumn(name = "[USER_ID]", nullable = false)
	@OneToMany(cascade = { CascadeType.ALL }, orphanRemoval = true)
	private Set<ProfileEntity> profiles;

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
			@Nullable String middelName,
			@Nullable String networkName,
			@Nullable NotificationPurposeEntity notificationPurposeEntity,
			@Nullable String pri,
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
		this.middelName = middelName;
		this.networkName = networkName;
		this.notificationPurposeEntity = notificationPurposeEntity;
		this.pri = pri;
		this.profiles = profiles;
		this.userType = userType;
		this.uuid = uuid;
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

	public LanguageEntity getLanguage() {
		return language;
	}

	public void setLanguage(LanguageEntity language) {
		this.language = language;
	}

	public String getMiddelName() {
		return middelName;
	}

	public void setMiddelName(String middelName) {
		this.middelName = middelName;
	}

	public String getNetworkName() {
		return networkName;
	}

	public void setNetworkName(String networkName) {
		this.networkName = networkName;
	}

	public NotificationPurposeEntity getNotificationPurposeEntity() {
		return notificationPurposeEntity;
	}

	public void setNotificationPurposeEntity(NotificationPurposeEntity notificationPurposeEntity) {
		this.notificationPurposeEntity = notificationPurposeEntity;
	}

	public String getPri() {
		return pri;
	}

	public void setPri(String pri) {
		this.pri = pri;
	}

	public Set<ProfileEntity> getProfiles() {
		return profiles;
	}

	public void setProfile(Set<ProfileEntity> profiles) {
		this.profiles = profiles;
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
			.append("middelName", middelName)
			.append("networkName", networkName)
			.append("notificationPurposeEntity", notificationPurposeEntity)
			.append("pri", pri)
			.append("profiles", profiles)
			.append("userType", userType)
			.append("uuid", uuid)
			.toString();
	}

}
