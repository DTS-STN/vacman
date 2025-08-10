package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;
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
import ca.gov.dtsstn.vacman.api.web.model.NonAdvertisedAppointmentReadModel;
import ca.gov.dtsstn.vacman.api.web.model.PriorityLevelReadModel;
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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Codes")
@RequestMapping({ AppConstants.ApiPaths.CODES })
public class CodesController {

	private final CodeModelMapper codeMapper = Mappers.getMapper(CodeModelMapper.class);

	private final CodeService codeService;

	public CodesController(CodeService codeService) {
		this.codeService = codeService;
	}

	@GetMapping({ "/cities" })
	@PreAuthorize("permitAll()")
	@Operation(summary = "Get all city codes")
	public CollectionModel<CityReadModel> getCities() {
		final var cities = codeService.getCities(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(cities);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/classifications" })
	@Operation(summary = "Get all classification codes")
	public CollectionModel<ClassificationReadModel> getClassifications() {
		final var classifications = codeService.getClassifications(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(classifications);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/employment-equities" })
	@Operation(summary = "Get all employment equity codes")
	public CollectionModel<EmploymentEquityReadModel> getEmploymentEquities() {
		final var employmentEquities = codeService.getEmploymentEquities(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(employmentEquities);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/employment-opportunities" })
	@Operation(summary = "Get all employment opportunity codes")
	public CollectionModel<EmploymentOpportunityReadModel> getEmploymentOpportunities() {
		final var employmentOpportunities = codeService.getEmploymentOpportunities(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(employmentOpportunities);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/employment-tenures" })
	@Operation(summary = "Get all employment tenure codes")
	public CollectionModel<EmploymentTenureReadModel> getEmploymentTenures() {
		final var employmentTenures = codeService.getEmploymentTenures(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(employmentTenures);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/languages" })
	@Operation(summary = "Get all language codes")
	public CollectionModel<LanguageReadModel> getLanguages() {
		final var languages = codeService.getLanguages(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(languages);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/language-referral-types" })
	@Operation(summary = "Get all language referral type codes")
	public CollectionModel<LanguageReferralTypeReadModel> getLanguageReferralTypes() {
		final var languageReferralTypes = codeService.getLanguageReferralTypes(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(languageReferralTypes);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/language-requirements" })
	@Operation(summary = "Get all language requirement codes")
	public CollectionModel<LanguageRequirementReadModel> getLanguageRequirements() {
		final var languageRequirements = codeService.getLanguageRequirements(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(languageRequirements);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/non-advertised-appointments" })
	@Operation(summary = "Get all non-advertised appointment codes")
	public CollectionModel<NonAdvertisedAppointmentReadModel> getNonAdvertisedAppointments() {
		final var nonAdvertisedAppointments = codeService.getNonAdvertisedAppointments(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(nonAdvertisedAppointments);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/priority-levels" })
	@Operation(summary = "Get all priority level codes")
	public CollectionModel<PriorityLevelReadModel> getPriorityLevels() {
		final var priorityLevels = codeService.getPriorityLevels(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(priorityLevels);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/profile-statuses" })
	@Operation(summary = "Get all profile status codes")
	public CollectionModel<ProfileStatusReadModel> getProfileStatuses() {
		final var profileStatuses = codeService.getProfileStatuses(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(profileStatuses);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/provinces" })
	@Operation(summary = "Get all province codes")
	public CollectionModel<ProvinceReadModel> getProvinces() {
		final var provinces = codeService.getProvinces(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(provinces);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/request-statuses" })
	@Operation(summary = "Get all request status codes")
	public CollectionModel<RequestStatusReadModel> getRequestStatuses() {
		final var requestStatuses = codeService.getRequestStatuses(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(requestStatuses);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/security-clearances" })
	@Operation(summary = "Get all security clearance codes")
	public CollectionModel<SecurityClearanceReadModel> getSecurityClearances() {
		final var securityClearances = codeService.getSecurityClearances(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(securityClearances);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/selection-process-types" })
	@Operation(summary = "Get all selection process type codes")
	public CollectionModel<SelectionProcessTypeReadModel> getSelectionProcessTypes() {
		final var selectionProcessTypes = codeService.getSelectionProcessTypes(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(selectionProcessTypes);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/user-types" })
	@Operation(summary = "Get all user type codes")
	public CollectionModel<UserTypeReadModel> getUserTypes() {
		final var userTypes = codeService.getUserTypes(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(userTypes);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/wfa-statuses" })
	@Operation(summary = "Get all WFA status codes")
	public CollectionModel<WfaStatusReadModel> getWfaStatuses() {
		final var wfaStatuses = codeService.getWfaStatuses(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(wfaStatuses);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/work-schedules" })
	@Operation(summary = "Get all work schedule codes")
	public CollectionModel<WorkScheduleReadModel> getWorkSchedules() {
		final var workSchedules = codeService.getWorkSchedules(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(workSchedules);
	}

	@PreAuthorize("permitAll()")
	@GetMapping({ "/work-units" })
	@Operation(summary = "Get all work unit codes")
	public CollectionModel<WorkUnitReadModel> getWorkUnits() {
		final var workUnits = codeService.getWorkUnits(Pageable.unpaged())
			.map(codeMapper::map)
			.toList();

		return new CollectionModel<>(workUnits);
	}

}
