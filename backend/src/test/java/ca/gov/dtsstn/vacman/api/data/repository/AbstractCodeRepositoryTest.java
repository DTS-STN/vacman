package ca.gov.dtsstn.vacman.api.data.repository;

import static ca.gov.dtsstn.vacman.api.data.repository.AbstractCodeRepository.isActive;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.CityEntity;
import ca.gov.dtsstn.vacman.api.data.entity.ProvinceEntity;
import jakarta.persistence.EntityManager;

@DataJpaTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("AbstractCodeRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class AbstractCodeRepositoryTest {

	@Autowired
	CityRepository cityRepository;

	@Autowired
	ProvinceRepository provinceRepository;

	@Autowired
	EntityManager entityManager;

	@MockitoBean
	SecurityAuditor securityAuditor;

	ProvinceEntity province;

	@BeforeEach
	void setUp() {
		when(securityAuditor.getCurrentAuditor()).thenReturn(Optional.of("test-user"));

		entityManager.createNativeQuery("ALTER TABLE CD_PROVINCE_TERRITORY ALTER COLUMN ID RESTART WITH (SELECT MAX(ID) + 1 FROM CD_PROVINCE_TERRITORY)").executeUpdate();
		entityManager.createNativeQuery("ALTER TABLE CD_CITY ALTER COLUMN ID RESTART WITH (SELECT MAX(ID) + 1 FROM CD_CITY)").executeUpdate();

		province = provinceRepository.save(ProvinceEntity.builder()
			.code("TEST_PROV")
			.nameEn("Test Province")
			.nameFr("Province de test")
			.effectiveDate(Instant.now())
			.build());
	}

	@Test
	@DisplayName("isActive() should return codes with null expiry date")
	void isActive_shouldReturnActiveCodes_whenExpiryDateIsNull() {
		final var city = cityRepository.save(CityEntity.builder()
			.code("TEST_CITY_1")
			.nameEn("Test City 1")
			.nameFr("Ville de test 1")
			.effectiveDate(Instant.now())
			.expiryDate(null)
			.provinceTerritory(province)
			.build());

		final var results = cityRepository.findAll(isActive());

		assertThat(results).extracting(CityEntity::getId).contains(city.getId());
	}

	@Test
	@DisplayName("isActive() should return codes with future expiry date")
	void isActive_shouldReturnActiveCodes_whenExpiryDateIsInFuture() {
		final var city = cityRepository.save(CityEntity.builder()
			.code("TEST_CITY_2")
			.nameEn("Test City 2")
			.nameFr("Ville de test 2")
			.effectiveDate(Instant.now())
			.expiryDate(Instant.now().plusSeconds(3600))
			.provinceTerritory(province)
			.build());

		final var results = cityRepository.findAll(isActive());

		assertThat(results).extracting(CityEntity::getId).contains(city.getId());
	}

	@Test
	@DisplayName("isActive() should not return codes with past expiry date")
	void isActive_shouldNotReturnExpiredCodes_whenExpiryDateIsInPast() {
		final var expiredCity = cityRepository.save(CityEntity.builder()
			.code("TEST_CITY_3")
			.nameEn("Test City 3")
			.nameFr("Ville de test 3")
			.effectiveDate(Instant.now())
			.expiryDate(Instant.now().minusSeconds(3600))
			.provinceTerritory(province)
			.build());

		final var results = cityRepository.findAll(isActive());

		assertThat(results).extracting(CityEntity::getId).doesNotContain(expiredCity.getId());
	}

	@Test
	@DisplayName("isActive() should return only active codes when mixed codes exist")
	void isActive_shouldReturnOnlyActiveCodes_whenMixedCodesExist() {
		final var activeCity1 = cityRepository.save(CityEntity.builder()
			.code("ACTIVE_1")
			.nameEn("Active 1")
			.nameFr("Actif 1")
			.effectiveDate(Instant.now())
			.expiryDate(null)
			.provinceTerritory(province)
			.build());

		final var activeCity2 = cityRepository.save(CityEntity.builder()
			.code("ACTIVE_2")
			.nameEn("Active 2")
			.nameFr("Actif 2")
			.effectiveDate(Instant.now())
			.expiryDate(Instant.now().plusSeconds(3600))
			.provinceTerritory(province)
			.build());

		final var expiredCity = cityRepository.save(CityEntity.builder()
			.code("EXPIRED_1")
			.nameEn("Expired 1")
			.nameFr("Expiré 1")
			.effectiveDate(Instant.now())
			.expiryDate(Instant.now().minusSeconds(3600))
			.provinceTerritory(province)
			.build());

		final var results = cityRepository.findAll(isActive());

		assertThat(results).extracting(CityEntity::getId)
			.contains(activeCity1.getId(), activeCity2.getId())
			.doesNotContain(expiredCity.getId());
	}

}
