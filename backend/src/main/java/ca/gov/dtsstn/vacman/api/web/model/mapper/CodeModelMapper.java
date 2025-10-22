package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ClassificationEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentEquityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentOpportunityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.EmploymentTenureEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageReferralTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchFeedbackEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.NonAdvertisedAppointmentEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProfileStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SecurityClearanceEntity;
import ca.gov.dtsstn.vacman.api.data.entity.SelectionProcessTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WfaStatusEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkScheduleEntity;
import ca.gov.dtsstn.vacman.api.data.entity.WorkUnitEntity;
import ca.gov.dtsstn.vacman.api.web.model.CityReadModel;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationReadModel;
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

@Mapper
public interface CodeModelMapper {

	CityReadModel map(CityEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	CityEntity idToCityEntity(Long id);

	ClassificationReadModel map(ClassificationEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	ClassificationEntity idToClassificationEntity(Long id);

	EmploymentEquityReadModel map(EmploymentEquityEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	EmploymentEquityEntity idToEmploymentEquityEntity(Long id);

	EmploymentOpportunityReadModel map(EmploymentOpportunityEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	EmploymentOpportunityEntity idToEmploymentOpportunityEntity(Long id);

	EmploymentTenureReadModel map(EmploymentTenureEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	EmploymentTenureEntity idToEmploymentTenureEntity(Long id);

	LanguageReadModel map(LanguageEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	LanguageEntity idToLanguageEntity(Long id);

	LanguageReferralTypeReadModel map(LanguageReferralTypeEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	LanguageReferralTypeEntity idToLanguageReferralTypeEntity(Long id);

	LanguageRequirementReadModel map(LanguageRequirementEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	LanguageRequirementEntity idToLanguageRequirementEntity(Long id);

	MatchFeedbackReadModel map(MatchFeedbackEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	MatchFeedbackEntity idToMatchFeedbackEntity(Long id);

	MatchStatusReadModel map(MatchStatusEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	MatchStatusEntity idToMatchStatusEntity(Long id);

	NonAdvertisedAppointmentReadModel map(NonAdvertisedAppointmentEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	NonAdvertisedAppointmentEntity idToNonAdvertisedAppointmentEntity(Long id);

	ProfileStatusReadModel map(ProfileStatusEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	ProfileStatusEntity idToProfileStatusEntity(Long id);

	ProvinceReadModel map(ProvinceEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	ProvinceEntity idToProvinceEntity(Long id);

	RequestStatusReadModel map(RequestStatusEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	RequestStatusEntity idToRequestStatusEntity(Long id);

	SecurityClearanceReadModel map(SecurityClearanceEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	SecurityClearanceEntity idToSecurityClearanceEntity(Long id);

	SelectionProcessTypeReadModel map(SelectionProcessTypeEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	SelectionProcessTypeEntity idToSelectionProcessTypeEntity(Long id);

	UserTypeReadModel map(UserTypeEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	UserTypeEntity idToUserTypeEntity(Long id);

	WfaStatusReadModel map(WfaStatusEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	WfaStatusEntity idToWfaStatusEntity(Long id);

	WorkScheduleReadModel map(WorkScheduleEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	WorkScheduleEntity idToWorkScheduleEntity(Long id);

	WorkUnitReadModel map(WorkUnitEntity entity);

	@BeanMapping(ignoreByDefault = true)
	@Mapping(target = "id", source = "id")
	WorkUnitEntity idToWorkUnitEntity(Long id);

}
