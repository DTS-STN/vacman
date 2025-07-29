package ca.gov.dtsstn.vacman.api.service.dto;

import java.util.List;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
public record MSGraphUser(
	String id,
	String onPremisesSamAccountName,
	String givenName,
	String surname,
	List<String> businessPhones,
	String mail,
	String preferredLanguage,
	String city,
	String state,
	String jobTitle,
	String department,
	String officeLocation,
	String mobilePhone
) {}
