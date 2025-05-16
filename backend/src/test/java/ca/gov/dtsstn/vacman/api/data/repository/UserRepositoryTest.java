package ca.gov.dtsstn.vacman.api.data.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.jdbc.DataJdbcTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.context.annotation.Import;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;

import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@DataJdbcTest
@Import({ DataSourceConfig.class })
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryTest {

	@Autowired
	JdbcAggregateTemplate jdbcAggregateTemplate;

	@Autowired
	UserRepository userRepository;

	@Test
	void whenFindById_givenUserDoesNotExist_thenReturnEmptyOptional() {
		assertThat(userRepository.findById("00000000-0000-0000-0000-000000000000")).isNotPresent();
	}

	@Test
	void whenFindById_givenUserExists_thenReturnUser() {
		jdbcAggregateTemplate.save(UserEntity.builder()
			.id("00000000-0000-0000-0000-000000000000")
			.name("Test User")
			.build());

		final var user = userRepository.findById("00000000-0000-0000-0000-000000000000");

		assertThat(user).isPresent()
			.get().extracting(UserEntity::id, UserEntity::name)
			.containsExactly("00000000-0000-0000-0000-000000000000", "Test User");
	}

}
