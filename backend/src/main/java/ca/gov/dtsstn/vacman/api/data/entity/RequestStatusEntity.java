package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "RequestStatus")
@Table(name = "[CD_REQUEST_STATUS]")
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_STATUS_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[REQUEST_STATUS_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[REQUEST_STATUS_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[REQUEST_STATUS_NAME_FR]"))
public class RequestStatusEntity extends AbstractLookupEntity {}
