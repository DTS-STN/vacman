package ca.gov.dtsstn.vacman.api.web.model.converter;

import ca.gov.dtsstn.vacman.api.web.model.ProfilesStatusParam;
import org.springframework.core.convert.converter.Converter;

/**
 * Converter to allower for case-insensitive profile status query parameter values.
 */
public class StringToProfileStatusParamConverter  implements Converter<String, ProfilesStatusParam> {

    @Override
    public ProfilesStatusParam convert(String source) {
        return ProfilesStatusParam.valueOf(source.toUpperCase());
    }
}
