package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public UserEntity createUser(UserEntity user) {
		return userRepository.save(UserEntity.builder(user)
			.id(UUID.randomUUID().toString())
			.build());
	}

	public List<UserEntity> getAllUsers() {
		return List.copyOf(userRepository.findAll());
	}

}
