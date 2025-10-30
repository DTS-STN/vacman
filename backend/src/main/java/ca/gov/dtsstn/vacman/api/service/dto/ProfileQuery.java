package ca.gov.dtsstn.vacman.api.service.dto;

import java.util.Set;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
public record ProfileQuery(
	Set<Long> hrAdvisorIds,
	Set<Long> statusIds,
	String firstName,
	String middleName,
	String lastName,
	String employeeName
) {}
