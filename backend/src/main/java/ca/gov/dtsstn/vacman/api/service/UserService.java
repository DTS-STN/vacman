package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractBaseEntity.byId;
import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.EntraIdProperties.RolesProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.UserTypes;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.UserDeletedEvent;
import ca.gov.dtsstn.vacman.api.event.UserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserUpdatedEvent;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.mapper.UserEntityMapper;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final ApplicationEventPublisher eventPublisher;

	private final CodeService codeService;

	private final RolesProperties entraRoles;

	private final UserEntityMapper userEntityMapper;

	private final UserRepository userRepository;

	private final UserTypes userTypeCodes;

	public UserService(
			ApplicationProperties applicationProperties,
			CodeService codeService,
			ApplicationEventPublisher eventPublisher,
			UserEntityMapper userEntityMapper,
			UserRepository userRepository,
			LookupCodes lookupCodes) {
		this.entraRoles = applicationProperties.entraId().roles();
		this.codeService = codeService;
		this.eventPublisher = eventPublisher;
		this.userEntityMapper = userEntityMapper;
		this.userRepository = userRepository;
		this.userTypeCodes = lookupCodes.userTypes();
	}

	public UserEntity createUser(UserEntity user, long languageId) {
		// Set language based on languageCode (validation ensures it exists)
		user.setLanguage(codeService.getLanguages(Pageable.unpaged()).stream()
			.filter(byId(languageId))
			.findFirst().orElseThrow());

		final var userTypeCode = SecurityUtils.hasAuthority(entraRoles.hrAdvisor())
			? userTypeCodes.hrAdvisor()
			: userTypeCodes.employee();

		user.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
			.filter(byCode(userTypeCode))
			.findFirst().orElseThrow());

		// Save the user (profiles are created separately as needed)
		final var createdUser = userRepository.save(user);

		// Publish created event
		eventPublisher.publishEvent(new UserCreatedEvent(createdUser));
		log.info("User created with ID: {}", createdUser.getId());

		return createdUser;
	}

	public Optional<UserEntity> getUserById(long id) {
		return userRepository.findById(id).map(user -> {
			eventPublisher.publishEvent(new UserReadEvent(user));
			return user;
		});
	}

	public Optional<UserEntity> getUserByMicrosoftEntraId(String entraId) {
		// No need to emit an event here because this is used
		// in intermediary steps by other methods that emit events

		// XXX ::: GjB ::: I think we should still consider emitting an event here

		final var example = Example.of(UserEntity.builder()
			.microsoftEntraId(entraId)
			.build());

		return userRepository.findOne(example);
	}

	public Page<UserEntity> getUsers(Pageable pageable) {
		final var users = userRepository.findAll(pageable);
		users.forEach(user -> eventPublisher.publishEvent(new UserReadEvent(user)));
		return users;
	}

	public Page<UserEntity> getHrAdvisors(Pageable pageable) {
		final var userType = codeService.getUserTypes(Pageable.unpaged())
			.filter(byCode("HRA")).stream()
			.findFirst().orElseThrow();

		final var example = Example.of(UserEntity.builder().userType(userType).build());

		final Page<UserEntity> users = userRepository.findAll(example, pageable);
		users.forEach(user -> eventPublisher.publishEvent(new UserReadEvent(user)));

		return users;
	}

	public UserEntity overwriteUser(long id, UserEntity updates) {
		final var existingUser = userRepository.findById(id).orElseThrow();
		userEntityMapper.overwrite(updates, existingUser);
		final var updatedUser = userRepository.save(existingUser);
		eventPublisher.publishEvent(new UserUpdatedEvent(updatedUser));
		log.info("User updated with ID: {}", updatedUser.getId());
		return updatedUser;
	}

	public UserEntity updateUser(long id, UserEntity updates) {
		final var existingUser = userRepository.findById(id).orElseThrow();
		userEntityMapper.update(updates, existingUser);
		final var updatedUser = userRepository.save(existingUser);
		eventPublisher.publishEvent(new UserUpdatedEvent(updatedUser));
		log.info("User updated with ID: {}", updatedUser.getId());
		return updatedUser;
	}

	public void deleteUser(long id) {
		userRepository.findById(id).ifPresent(user -> {
			userRepository.deleteById(id);
			eventPublisher.publishEvent(new UserDeletedEvent(user));
			log.info("User deleted with ID: {}", id);
		});
	}

}
