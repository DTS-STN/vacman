package ca.gov.dtsstn.vacman.api.web.model.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import ca.gov.dtsstn.vacman.api.data.entity.ClassificationProfileEntity;
import ca.gov.dtsstn.vacman.api.web.model.ClassificationProfileReadModel;

@Mapper
public interface ClassificationProfileModelMapper {

    @Mapping(target = "classificationId", source = "classification.id")
    @Mapping(target = "profileId", source = "profile.id")
    @Mapping(target = "classificationCode", source = "classification.code")
    @Mapping(target = "classificationNameEn", source = "classification.nameEn")
    @Mapping(target = "classificationNameFr", source = "classification.nameFr")
    ClassificationProfileReadModel toModel(ClassificationProfileEntity entity);

}
