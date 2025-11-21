package ca.gov.dtsstn.vacman.api.data.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

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
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@DataJpaTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("UserRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryTest {

	@Autowired
	UserRepository userRepository;

	@Autowired
	LanguageRepository languageRepository;

	@Autowired
	UserTypeRepository userTypeRepository;

	@MockitoBean
	SecurityAuditor securityAuditor;

	@BeforeEach
	void setUp() {
		when(securityAuditor.getCurrentAuditor())
			.thenReturn(Optional.of("test-user"));
	}

	@Test
	void testSaveWithPartialDataDoesNotThrow() {
		final var user = UserEntity.builder()
			.language(languageRepository.findById(1L).orElseThrow())
			.userType(userTypeRepository.findById(1L).orElseThrow())
			.microsoftEntraId("01010101-0101-0101-0101-010101010101")
			.businessEmailAddress("test.user@example.com")
			.firstName("Test")
			.lastName("User")
			.build();

		final var savedUser = userRepository.save(user);

		assertThat(savedUser).isNotNull();
	}

}
