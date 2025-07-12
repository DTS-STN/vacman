package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entity representing appointment non-advertised code lookup table.
 * Maps to CD_APPOINTMENT_NON_ADVERTISED database table.
 */
@Entity(name = "AppointmentNonAdvertised")
@Table(name = "[CD_APPOINTMENT_NON_ADVERTISED]", uniqueConstraints = {
    @UniqueConstraint(name = "APPNTMNTNONADVRTSD_UK", columnNames = "[APPOINTMENT_NON_ADVERTISED_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[APPOINTMENT_NON_ADVERTISED_NAME_FR]"))
public class AppointmentNonAdvertisedEntity extends AbstractLookupEntity {

    public AppointmentNonAdvertisedEntity() {
        super();
    }
}
