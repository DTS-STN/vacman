package ca.gov.dtsstn.vacman.api.data.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;

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
		final var user = new UserEntityBuilder()
			.language(languageRepository.findById(1L).orElseThrow())
			.userType(userTypeRepository.findById(1L).orElseThrow())
			.microsoftEntraId("00000000-0000-0000-0000-000000000000")
			.businessEmailAddress("test.user@example.com")
			.firstName("Test")
			.lastName("User")
			.build();

		final var savedUser = userRepository.save(user);

		assertThat(savedUser).isNotNull();
	}

}
