package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "RequestStatus")
@Table(name = "[CD_REQUEST_STATUS]", uniqueConstraints = {
    @UniqueConstraint(name = "CDRSTS_UK", columnNames = "[REQUEST_STATUS_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[REQUEST_STATUS_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[REQUEST_STATUS_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[REQUEST_STATUS_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[REQUEST_STATUS_NAME_FR]"))
public class RequestStatusEntity extends AbstractLookupEntity {}
