package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.service.CodeService;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final UserRepository userRepository;
	private final UserTypeRepository userTypeRepository;
	private final LanguageRepository languageRepository;
	private final ApplicationEventPublisher eventPublisher;
	private final CodeService codeService;
	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	public UserService(UserRepository userRepository,
			UserTypeRepository userTypeRepository,
			LanguageRepository languageRepository,
			ApplicationEventPublisher eventPublisher,
			CodeService codeService) {
		this.userRepository = userRepository;
		this.userTypeRepository = userTypeRepository;
		this.languageRepository = languageRepository;
		this.eventPublisher = eventPublisher;
		this.codeService = codeService;
	}

	public UserEntity createUser(UserCreateModel createModel) {
		// Create user entity from model
		final var user = userModelMapper.toEntity(createModel);

		// Set user type based on role (validation ensures it exists)
		user.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
			.filter(userType -> userType.getCode().equals(createModel.role()))
			.findFirst().orElseThrow());

		// Set language based on languageCode (validation ensures it exists)
		user.setLanguage(codeService.getLanguages(Pageable.unpaged()).stream()
			.filter(language -> language.getCode().equals(createModel.languageCode()))
			.findFirst().orElseThrow());

		// Save the user (profiles are created separately as needed)
		final var createdUser = userRepository.save(user);

		// Publish created event
		eventPublisher.publishEvent(new UserCreatedEvent(createdUser));
		log.info("User created with ID: {}", createdUser.getId());

		return createdUser;
	}


	public Optional<UserEntity> getUserById(Long id) {
		return userRepository.findById(id);
	}

	public Optional<UserEntity> getUserByActiveDirectoryId(String activeDirectoryId) {
		return userRepository.findByActiveDirectoryId(activeDirectoryId);
	}

	public List<UserEntity> getAllUsers() {
		return List.copyOf(userRepository.findAll());
	}

	public Page<UserEntity> getUsers(Pageable pageable) {
		return userRepository.findAll(pageable);
	}

	public UserEntity updateUser(UserUpdateModel updateModel) {
		final var existingUser = userRepository.findById(updateModel.id()).orElseThrow();
		userModelMapper.updateEntityFromModel(updateModel, existingUser);

		// Handle role update if provided (validation ensures it exists)
		if (updateModel.role() != null) {
			existingUser.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
				.filter(userType -> userType.getCode().equals(updateModel.role()))
				.findFirst().orElseThrow());
		}

		// Handle language update if provided (validation ensures it exists)
		if (updateModel.languageCode() != null) {
			existingUser.setLanguage(codeService.getLanguages(Pageable.unpaged()).stream()
				.filter(language -> language.getCode().equals(updateModel.languageCode()))
				.findFirst().orElseThrow());
		}

		return userRepository.save(existingUser);
	}

}
