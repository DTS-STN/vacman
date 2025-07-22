package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
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
	private final UserModelMapper userModelMapper;

	public UserService(UserRepository userRepository,
					   UserTypeRepository userTypeRepository,
					   LanguageRepository languageRepository,
					   UserModelMapper userModelMapper) {
		this.userRepository = userRepository;
		this.userTypeRepository = userTypeRepository;
		this.languageRepository = languageRepository;
		this.userModelMapper = userModelMapper;
	}


	public UserEntity createUser(UserCreateModel createModel) {
		// Create user entity from model
		UserEntity user = userModelMapper.toEntity(createModel);

		// Set user type based on role (validation ensures it exists)
		user.setUserType(userTypeRepository.findByCode(createModel.role())
			.orElseThrow());

		// Set language based on languageCode (validation ensures it exists)
		user.setLanguage(languageRepository.findByCode(createModel.languageCode())
				.orElseThrow());

		// Save and return the user (profiles are created separately as needed)
		return userRepository.save(user);
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

	public Optional<UserEntity> updateUser(UserUpdateModel updateModel) {
		Optional<UserEntity> optionalUser = userRepository.findById(updateModel.id());

		if (optionalUser.isEmpty()) {
			return Optional.empty();
		}

		UserEntity existingUser = optionalUser.get();

		// Update the user entity using the mapper
		userModelMapper.updateEntityFromModel(updateModel, existingUser);

		// Handle role update if provided (validation ensures it exists)
		if (updateModel.role() != null) {
			existingUser.setUserType(userTypeRepository.findByCode(updateModel.role())
				.orElseThrow());
		}

		// Handle language update if provided (validation ensures it exists)
		if (updateModel.languageCode() != null) {
			existingUser.setLanguage(languageRepository.findByCode(updateModel.languageCode())
				.orElseThrow());
		}

		// Save and return updated user
		UserEntity savedUser = userRepository.save(existingUser);
		return Optional.of(savedUser);
	}

}
