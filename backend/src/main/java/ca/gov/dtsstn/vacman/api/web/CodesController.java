package ca.gov.dtsstn.vacman.api.web;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
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
	public PagedModel<CityReadModel> getCities() {
		return new PagedModel<>(codeService.getAllCities(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/classifications" })
	@Operation(summary = "Get all classification codes")
	public PagedModel<ClassificationReadModel> getClassifications() {
		return new PagedModel<>(codeService.getAllClassifications(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/employment-equities" })
	@Operation(summary = "Get all employment equity codes")
	public PagedModel<EmploymentEquityReadModel> getEmploymentEquities() {
		return new PagedModel<>(codeService.getAllEmploymentEquities(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/employment-opportunities" })
	@Operation(summary = "Get all employment opportunity codes")
	public PagedModel<EmploymentOpportunityReadModel> getEmploymentOpportunities() {
		return new PagedModel<>(codeService.getAllEmploymentOpportunities(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/employment-tenures" })
	@Operation(summary = "Get all employment tenure codes")
	public PagedModel<EmploymentTenureReadModel> getEmploymentTenures() {
		return new PagedModel<>(codeService.getAllEmploymentTenures(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/languages" })
	@Operation(summary = "Get all language codes")
	public PagedModel<LanguageReadModel> getLanguages() {
		return new PagedModel<>(codeService.getAllLanguages(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/language-referral-types" })
	@Operation(summary = "Get all language referral type codes")
	public PagedModel<LanguageReferralTypeReadModel> getLanguageReferralTypes() {
		return new PagedModel<>(codeService.getAllLanguageReferralTypes(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/language-requirements" })
	@Operation(summary = "Get all language requirement codes")
	public PagedModel<LanguageRequirementReadModel> getLanguageRequirements() {
		return new PagedModel<>(codeService.getAllLanguageRequirements(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/non-advertised-appointments" })
	@Operation(summary = "Get all non-advertised appointment codes")
	public PagedModel<NonAdvertisedAppointmentReadModel> getNonAdvertisedAppointments() {
		return new PagedModel<>(codeService.getAllNonAdvertisedAppointments(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/priority-levels" })
	@Operation(summary = "Get all priority level codes")
	public PagedModel<PriorityLevelReadModel> getPriorityLevels() {
		return new PagedModel<>(codeService.getAllPriorityLevels(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/profile-statuses" })
	@Operation(summary = "Get all profile status codes")
	public PagedModel<ProfileStatusReadModel> getProfileStatuses() {
		return new PagedModel<>(codeService.getAllProfileStatuses(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/provinces" })
	@Operation(summary = "Get all province codes")
	public PagedModel<ProvinceReadModel> getProvinces() {
		return new PagedModel<>(codeService.getAllProvinces(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/request-statuses" })
	@Operation(summary = "Get all request status codes")
	public PagedModel<RequestStatusReadModel> getRequestStatuses() {
		return new PagedModel<>(codeService.getAllRequestStatuses(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/security-clearances" })
	@Operation(summary = "Get all security clearance codes")
	public PagedModel<SecurityClearanceReadModel> getSecurityClearances() {
		return new PagedModel<>(codeService.getAllSecurityClearances(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/selection-process-types" })
	@Operation(summary = "Get all selection process type codes")
	public PagedModel<SelectionProcessTypeReadModel> getSelectionProcessTypes() {
		return new PagedModel<>(codeService.getAllSelectionProcessTypes(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/user-types" })
	@Operation(summary = "Get all user type codes")
	public PagedModel<UserTypeReadModel> getUserTypes() {
		return new PagedModel<>(codeService.getAllUserTypes(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/wfa-statuses" })
	@Operation(summary = "Get all WFA status codes")
	public PagedModel<WfaStatusReadModel> getWfaStatuses() {
		return new PagedModel<>(codeService.getAllWfaStatuses(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/work-schedules" })
	@Operation(summary = "Get all work schedule codes")
	public PagedModel<WorkScheduleReadModel> getWorkSchedules() {
		return new PagedModel<>(codeService.getAllWorkSchedules(Pageable.unpaged()).map(codeMapper::map));
	}

	@GetMapping({ "/work-units" })
	@Operation(summary = "Get all work unit codes")
	public PagedModel<WorkUnitReadModel> getWorkUnits() {
		return new PagedModel<>(codeService.getAllWorkUnits(Pageable.unpaged()).map(codeMapper::map));
	}

}
