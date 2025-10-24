package ca.gov.dtsstn.vacman.api.web;

import static ca.gov.dtsstn.vacman.api.web.model.CollectionModel.toCollectionModel;
import static org.springframework.data.domain.Pageable.unpaged;

import org.mapstruct.factory.Mappers;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationReadModel;
import ca.gov.dtsstn.vacman.api.web.model.CollectionModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentEquityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentOpportunityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.EmploymentTenureReadModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReadModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageReferralTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.LanguageRequirementReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchFeedbackReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.NonAdvertisedAppointmentReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ProfileStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ProvinceReadModel;
import ca.gov.dtsstn.vacman.api.web.model.RequestStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.SecurityClearanceReadModel;
import ca.gov.dtsstn.vacman.api.web.model.SelectionProcessTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.UserTypeReadModel;
import ca.gov.dtsstn.vacman.api.web.model.WfaStatusReadModel;
import ca.gov.dtsstn.vacman.api.web.model.WorkScheduleReadModel;
import ca.gov.dtsstn.vacman.api.web.model.WorkUnitReadModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.CodeModelMapper;
import io.micrometer.core.annotation.Counted;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@ApiResponses.Ok
@Tag(name = "Codes")
@ApiResponses.InternalServerError
@RequestMapping({ "/api/v1/codes" })
public class CodesController {

	private final CodeModelMapper codeMapper = Mappers.getMapper(CodeModelMapper.class);

	private final CodeService codeService;

	public CodesController(CodeService codeService) {
		Assert.notNull(codeService, "codeService is required; it must not be null");
		this.codeService = codeService;
	}

	@GetMapping({ "/cities" })
	@PreAuthorize("permitAll()")
	@Operation(summary = "Get all city codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "cities" })
	public CollectionModel<CityReadModel> getCities() {
		return codeService.getCities(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/classifications" })
	@Operation(summary = "Get all classification codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "classifications" })
	public CollectionModel<ClassificationReadModel> getClassifications() {
		return codeService.getClassifications(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/employment-equities" })
	@Operation(summary = "Get all employment equity codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "employment_equities" })
	public CollectionModel<EmploymentEquityReadModel> getEmploymentEquities() {
		return codeService.getEmploymentEquities(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/employment-opportunities" })
	@Operation(summary = "Get all employment opportunity codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "employment_opportunities" })
	public CollectionModel<EmploymentOpportunityReadModel> getEmploymentOpportunities() {
		return codeService.getEmploymentOpportunities(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/employment-tenures" })
	@Operation(summary = "Get all employment tenure codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "employment_tenures" })
	public CollectionModel<EmploymentTenureReadModel> getEmploymentTenures() {
		return codeService.getEmploymentTenures(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/language-referral-types" })
	@Operation(summary = "Get all language referral type codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "language_referral_types" })
	public CollectionModel<LanguageReferralTypeReadModel> getLanguageReferralTypes() {
		return codeService.getLanguageReferralTypes(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/language-requirements" })
	@Operation(summary = "Get all language requirement codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "language_requirements" })
	public CollectionModel<LanguageRequirementReadModel> getLanguageRequirements() {
		return codeService.getLanguageRequirements(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/languages" })
	@Operation(summary = "Get all language codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "languages" })
	public CollectionModel<LanguageReadModel> getLanguages() {
		return codeService.getLanguages(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/match-feedbacks" })
	@Operation(summary = "Get all match feedback codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "match_feedbacks" })
	public CollectionModel<MatchFeedbackReadModel> getMatchFeedbacks() {
		return codeService.getMatchFeedbacks(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/match-statuses" })
	@Operation(summary = "Get all match status codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "match_statuses" })
	public CollectionModel<MatchStatusReadModel> getMatchStatuses() {
		return codeService.getMatchStatuses(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/non-advertised-appointments" })
	@Operation(summary = "Get all non-advertised appointment codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "non_advertised_appointments" })
	public CollectionModel<NonAdvertisedAppointmentReadModel> getNonAdvertisedAppointments() {
		return codeService.getNonAdvertisedAppointments(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/profile-statuses" })
	@Operation(summary = "Get all profile status codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "profile_statuses" })
	public CollectionModel<ProfileStatusReadModel> getProfileStatuses() {
		return codeService.getProfileStatuses(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/provinces" })
	@Operation(summary = "Get all province codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "provinces" })
	public CollectionModel<ProvinceReadModel> getProvinces() {
		return codeService.getProvinces(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/request-statuses" })
	@Operation(summary = "Get all request status codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "request_statuses" })
	public CollectionModel<RequestStatusReadModel> getRequestStatuses() {
		return codeService.getRequestStatuses(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/security-clearances" })
	@Operation(summary = "Get all security clearance codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "security_clearances" })
	public CollectionModel<SecurityClearanceReadModel> getSecurityClearances() {
		return codeService.getSecurityClearances(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/selection-process-types" })
	@Operation(summary = "Get all selection process type codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "selection_process_types" })
	public CollectionModel<SelectionProcessTypeReadModel> getSelectionProcessTypes() {
		return codeService.getSelectionProcessTypes(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/user-types" })
	@Operation(summary = "Get all user type codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "user_types" })
	public CollectionModel<UserTypeReadModel> getUserTypes() {
		return codeService.getUserTypes(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/wfa-statuses" })
	@Operation(summary = "Get all WFA status codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "wfa_statuses" })
	public CollectionModel<WfaStatusReadModel> getWfaStatuses() {
		return codeService.getWfaStatuses(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/work-schedules" })
	@Operation(summary = "Get all work schedule codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "work_schedules" })
	public CollectionModel<WorkScheduleReadModel> getWorkSchedules() {
		return codeService.getWorkSchedules(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/work-units" })
	@Operation(summary = "Get all work unit codes")
	@Counted(value = "codes.fetched", extraTags = { "type", "work_units" })
	public CollectionModel<WorkUnitReadModel> getWorkUnits() {
		return codeService.getWorkUnits(unpaged())
			.map(codeMapper::map).stream()
			.collect(toCollectionModel());
	}

}
