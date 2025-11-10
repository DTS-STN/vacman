package ca.gov.dtsstn.vacman.api.config.properties;

import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import com.github.benmanes.caffeine.cache.CaffeineSpec;

import jakarta.validation.constraints.NotNull;

@Validated
@ConfigurationProperties("application.caching")
public record CachingProperties(
	@NotNull Boolean enabled,
	Map<String, String> cacheSpecs
) {

	public CachingProperties {
		if (cacheSpecs == null) { cacheSpecs = Map.of(); }
		cacheSpecs.forEach((name, spec) -> CaffeineSpec.parse(spec));
	}

}
