package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "SecurityClearance")
@Table(name = "[CD_SECURITY_CLEARANCE]")
@AttributeOverride(name = "id", column = @Column(name = "[SECURITY_CLEARANCE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[SECURITY_CLEARANCE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[SECURITY_CLEARANCE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[SECURITY_CLEARANCE_NAME_FR]"))
public class SecurityClearanceEntity extends AbstractLookupEntity {}
