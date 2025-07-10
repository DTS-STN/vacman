package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "SecurityClearance")
@Table(name = "[CD_SECURITY_CLEARANCE]", uniqueConstraints = {
    @UniqueConstraint(name = "SCRCLNC_UK", columnNames = "[SECURITY_CLEARANCE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[SECURITY_CLEARANCE_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[SECURITY_CLEARANCE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[SECURITY_CLEARANCE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[SECURITY_CLEARANCE_NAME_FR]"))
public class SecurityClearanceEntity extends AbstractLookupEntity {}
