package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.entity.UserTypeEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.repository.LanguageRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final UserTypeRepository userTypeRepository;
	private final LanguageRepository languageRepository;
	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	public UserService(UserRepository userRepository,
			UserTypeRepository userTypeRepository,
			LanguageRepository languageRepository) {
		this.userRepository = userRepository;
		this.userTypeRepository = userTypeRepository;
		this.languageRepository = languageRepository;
	}


	public UserEntity createUser(UserCreateModel createModel) {
		// Create user entity from model
		final var user = userModelMapper.toEntity(createModel);

		// Set user type based on role (validation ensures it exists)
		final var userType = userTypeRepository.findOne(Example.of(new UserTypeEntityBuilder().code(createModel.role()).build())).orElseThrow();
		user.setUserType(userType);

		// Set language based on languageCode (validation ensures it exists)
		final var language = languageRepository.findOne(Example.of(new LanguageEntityBuilder().code(createModel.languageCode()).build())).orElseThrow();
		user.setLanguage(language);

		// Save and return the user (profiles are created separately as needed)
		return userRepository.save(user);
	}


	public Optional<UserEntity> getUserById(Long id) {
		return userRepository.findById(id);
	}

	public Optional<UserEntity> getUserByActiveDirectoryId(String activeDirectoryId) {
		return userRepository.findOne(Example.of(new UserEntityBuilder().activeDirectoryId(activeDirectoryId).build()));
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
			final var userType = userTypeRepository.findOne(Example.of(new UserTypeEntityBuilder().code(updateModel.role()).build())).orElseThrow();
			existingUser.setUserType(userType);
		}

		// Handle language update if provided (validation ensures it exists)
		if (updateModel.languageCode() != null) {
			final var language = languageRepository.findOne(Example.of(new LanguageEntityBuilder().code(updateModel.languageCode()).build())).orElseThrow();
			existingUser.setLanguage(language);
		}

		return userRepository.save(existingUser);
	}

}
