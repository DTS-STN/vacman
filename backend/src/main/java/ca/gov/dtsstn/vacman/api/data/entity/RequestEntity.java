package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDate;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "Request")
@Table(name = "[REQUEST]")
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_ID]"))
public class RequestEntity extends AbstractEntity {

	@Column(name = "[BUSINESS_EMAIL_ADDRESS]", length = 320, nullable = false)
	private String businessEmailAddress;

	@Column(name = "[BUSINESS_PHONE_NUMBER]", length = 15, nullable = false)
	private String businessPhoneNumber;

	@ManyToOne
	@JoinColumn(name = "[CITY_ID]", nullable = true)
	private CityEntity city;

	@ManyToOne
	@JoinColumn(name = "[CLASSIFICATION_ID]", nullable = true)
	private ClassificationEntity classification;

	@Column(name = "[FIRST_NAME]", length = 100, nullable = false)
	private String firstName;

	@Column(name = "[HIRE_DATE]", nullable = true)
	private LocalDate hireDate;

	@Column(name = "[INITIAL]", length = 4, nullable = true)
	private String initial;

	@Column(name = "[LAST_NAME]", length = 100, nullable = false)
	private String lastName;

	@Column(name = "[MIDDLE_NAME]", length = 100, nullable = true)
	private String middelName;

	@Column(name = "[NETWORK_NAME]", length = 50, nullable = false)
	private String networkName;

	@Column(name = "[PERSONAL_RECORD_IDENTIFIER]", length = 10, nullable = true)
	private String pri;

	@ManyToOne
	@JoinColumn(name = "[PRIORITY_LEVEL_ID]", nullable = false)
	private PriorityLevelEntity priorityLevel;

	@ManyToOne
	@JoinColumn(name = "[USER_TYPE_ID]", nullable = false)
	private UserTypeEntity userType;

	@Column(name = "[UU_NAME]", length = 50, nullable = false)
	private String uuid;

	@ManyToOne
	@JoinColumn(name = "[WORK_UNIT_ID]", nullable = false)
	private WorkUnitEntity workUnit;

	public RequestEntity() {
		super();
	}

	@Builder.Constructor
	public RequestEntity(
			@Nullable Long id,
			@Nullable String businessEmailAddress,
			@Nullable String businessPhoneNumber,
			@Nullable CityEntity city,
			@Nullable ClassificationEntity classification,
			@Nullable String firstName,
			@Nullable LocalDate hireDate,
			@Nullable String initial,
			@Nullable String lastName,
			@Nullable String middelName,
			@Nullable String networkName,
			@Nullable PriorityLevelEntity priorityLevel,
			@Nullable UserTypeEntity userType,
			@Nullable String uuid,
			@Nullable WorkUnitEntity workUnit,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.businessEmailAddress = businessEmailAddress;
		this.businessPhoneNumber = businessPhoneNumber;
		this.city = city;
		this.classification = classification;
		this.firstName = firstName;
		this.hireDate = hireDate;
		this.initial = initial;
		this.lastName = lastName;
		this.middelName = middelName;
		this.networkName = networkName;
		this.priorityLevel = priorityLevel;
		this.userType = userType;
		this.uuid = uuid;
		this.workUnit = workUnit;
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

	public CityEntity getCity() {
		return city;
	}

	public void setCity(CityEntity city) {
		this.city = city;
	}

	public ClassificationEntity getClassification() {
		return classification;
	}

	public void setClassification(ClassificationEntity classification) {
		this.classification = classification;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String name) {
		this.firstName = name;
	}

	public LocalDate getHireDate() {
		return hireDate;
	}

	public void setHireDate(LocalDate hireDate) {
		this.hireDate = hireDate;
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

	public String getPri() {
		return pri;
	}

	public void setPri(String pri) {
		this.pri = pri;
	}

	public PriorityLevelEntity getPriorityLevel() {
		return priorityLevel;
	}

	public void setPriorityLevel(PriorityLevelEntity priorityLevel) {
		this.priorityLevel = priorityLevel;
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

	public WorkUnitEntity getWorkUnit() {
		return workUnit;
	}

	public void setWorkUnit(WorkUnitEntity workUnit) {
		this.workUnit = workUnit;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("businessEmailAddress", businessEmailAddress)
			.append("businessPhoneNumber", businessPhoneNumber)
			.append("city", city)
			.append("classification", classification)
			.append("firstName", firstName)
			.append("hireDate", hireDate)
			.append("initial", initial)
			.append("lastName", lastName)
			.append("middelName", middelName)
			.append("networkName", networkName)
			.append("pri", pri)
			.append("priorityLevel", priorityLevel)
			.append("userType", userType)
			.append("uuid", uuid)
			.append("workUnit", workUnit)
			.toString();
	}

}
