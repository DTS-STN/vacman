package ca.gov.dtsstn.vacman.api.service.dto;

import java.util.Set;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
public record RequestQuery(
	Long requestId,
	Set<Long> hrAdvisorIds,
	Set<Long> statusIds,
	Set<Long> workUnitIds,
	Set<Long> classificationIds
) {}
