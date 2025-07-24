package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.gov.dtsstn.vacman.api.service.CodeService;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationReadModel;
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
@RequestMapping({ "/api/v1/codes" })
public class CodesController {

	private final CodeModelMapper codeMapper = Mappers.getMapper(CodeModelMapper.class);

	private final CodeService codeService;

	public CodesController(CodeService codeService) {
		this.codeService = codeService;
	}

	@GetMapping({ "/cities" })
	@Operation(summary = "Get all city codes")
	public Page<CityReadModel> getCities() {
		final var cities = codeService.getAllCities(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(cities);
	}

	@GetMapping({ "/classifications" })
	@Operation(summary = "Get all classification codes")
	public Page<ClassificationReadModel> getClassifications() {
		final var classifications = codeService.getAllClassifications(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(classifications);
	}

	@GetMapping({ "/employment-equities" })
	@Operation(summary = "Get all employment equity codes")
	public Page<EmploymentEquityReadModel> getEmploymentEquities() {
		final var employmentEquities = codeService.getAllEmploymentEquities(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(employmentEquities);
	}

	@GetMapping({ "/employment-opportunities" })
	@Operation(summary = "Get all employment opportunity codes")
	public Page<EmploymentOpportunityReadModel> getEmploymentOpportunities() {
		final var employmentOpportunities = codeService.getAllEmploymentOpportunities(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(employmentOpportunities);
	}

	@GetMapping({ "/employment-tenures" })
	@Operation(summary = "Get all employment tenure codes")
	public Page<EmploymentTenureReadModel> getEmploymentTenures() {
		final var employmentTenures = codeService.getAllEmploymentTenures(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(employmentTenures);
	}

	@GetMapping({ "/languages" })
	@Operation(summary = "Get all language codes")
	public Page<LanguageReadModel> getLanguages() {
		final var languages = codeService.getAllLanguages(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(languages);
	}

	@GetMapping({ "/language-referral-types" })
	@Operation(summary = "Get all language referral type codes")
	public Page<LanguageReferralTypeReadModel> getLanguageReferralTypes() {
		final var languageReferralTypes = codeService.getAllLanguageReferralTypes(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(languageReferralTypes);
	}

	@GetMapping({ "/language-requirements" })
	@Operation(summary = "Get all language requirement codes")
	public Page<LanguageRequirementReadModel> getLanguageRequirements() {
		final var languageRequirements = codeService.getAllLanguageRequirements(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(languageRequirements);
	}

	@GetMapping({ "/non-advertised-appointments" })
	@Operation(summary = "Get all non-advertised appointment codes")
	public Page<NonAdvertisedAppointmentReadModel> getNonAdvertisedAppointments() {
		final var nonAdvertisedAppointments = codeService.getAllNonAdvertisedAppointments(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(nonAdvertisedAppointments);
	}

	@GetMapping({ "/priority-levels" })
	@Operation(summary = "Get all priority level codes")
	public Page<PriorityLevelReadModel> getPriorityLevels() {
		final var priorityLevels = codeService.getAllPriorityLevels(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(priorityLevels);
	}

	@GetMapping({ "/profile-statuses" })
	@Operation(summary = "Get all profile status codes")
	public Page<ProfileStatusReadModel> getProfileStatuses() {
		final var profileStatuses = codeService.getAllProfileStatuses(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(profileStatuses);
	}

	@GetMapping({ "/provinces" })
	@Operation(summary = "Get all province codes")
	public Page<ProvinceReadModel> getProvinces() {
		final var provinces = codeService.getAllProvinces(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(provinces);
	}

	@GetMapping({ "/request-statuses" })
	@Operation(summary = "Get all request status codes")
	public Page<RequestStatusReadModel> getRequestStatuses() {
		final var requestStatuses = codeService.getAllRequestStatuses(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(requestStatuses);
	}

	@GetMapping({ "/security-clearances" })
	@Operation(summary = "Get all security clearance codes")
	public Page<SecurityClearanceReadModel> getSecurityClearances() {
		final var securityClearances = codeService.getAllSecurityClearances(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(securityClearances);
	}

	@GetMapping({ "/selection-process-types" })
	@Operation(summary = "Get all selection process type codes")
	public Page<SelectionProcessTypeReadModel> getSelectionProcessTypes() {
		final var selectionProcessTypes = codeService.getAllSelectionProcessTypes(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(selectionProcessTypes);
	}

	@GetMapping({ "/user-types" })
	@Operation(summary = "Get all user type codes")
	public Page<UserTypeReadModel> getUserTypes() {
		final var userTypes = codeService.getAllUserTypes(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(userTypes);
	}

	@GetMapping({ "/wfa-statuses" })
	@Operation(summary = "Get all WFA status codes")
	public Page<WfaStatusReadModel> getWfaStatuses() {
		final var wfaStatuses = codeService.getAllWfaStatuses(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(wfaStatuses);
	}

	@GetMapping({ "/work-schedules" })
	@Operation(summary = "Get all work schedule codes")
	public Page<WorkScheduleReadModel> getWorkSchedules() {
		final var workSchedules = codeService.getAllWorkSchedules(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(workSchedules);
	}

	@GetMapping({ "/work-units" })
	@Operation(summary = "Get all work unit codes")
	public Page<WorkUnitReadModel> getWorkUnits() {
		final var workUnits = codeService.getAllWorkUnits(Pageable.unpaged()).stream()
			.map(codeMapper::map)
			.toList();

		return new PageImpl<>(workUnits);
	}

}
