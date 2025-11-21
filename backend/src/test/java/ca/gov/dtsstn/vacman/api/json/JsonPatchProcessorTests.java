package ca.gov.dtsstn.vacman.api.json;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.io.Serializable;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.json.Json;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.constraints.NotBlank;
import tools.jackson.databind.ObjectMapper;

/**
 * Tests for {@link JsonPatchProcessor}.
 * <p>
 * This is not <i>strictly</i> a unit test because it makes calls to Jackson's
 * {@link ObjectMapper}. The tests were designed in this way because of the very deep
 * reliance on ObjectMapper's configuration state and JSON parsing abilities.
 */
class JsonPatchProcessorTests {

	JsonPatchProcessor jsonPatchProcessor;

	@BeforeEach
	void setUp() throws Exception {
		this.jsonPatchProcessor = new JsonPatchProcessor(Validation.buildDefaultValidatorFactory().getValidator());
	}

	@Test
	void testPatchJsonMergePatch() {
		final var entity = new MyEntity("id", "name");
		final var patchObject = Json.createObjectBuilder().add("name", "updated name").build();
		final var jsonMergePatch = Json.createMergePatch(Json.createObjectBuilder(patchObject).build());
		final var patchedEntity = jsonPatchProcessor.patch(entity, jsonMergePatch);

		assertThat(patchedEntity)
			.isNotSameAs(entity)
			.hasFieldOrPropertyWithValue("id", "id")
			.hasFieldOrPropertyWithValue("name", "updated name");
	}

	@Test
	void testPatchJsonMergePatch_validationError_throws() {
		final var entity = new MyEntity("id", "name");
		final var patchObject = Json.createObjectBuilder().add("name", "").build();
		final var jsonMergePatch = Json.createMergePatch(Json.createObjectBuilder(patchObject).build());

		assertThatExceptionOfType(ConstraintViolationException.class)
			.isThrownBy(() -> jsonPatchProcessor.patch(entity, jsonMergePatch))
			.withMessage("name: must not be blank");
	}

	@Test
	void testPatchJsonPatch() {
		final var entity = new MyEntity("id", "name");
		final var patchObject = Json.createObjectBuilder().add("op", "replace").add("path", "/name").add("value", "updated name").build();
		final var jsonPatch = Json.createPatch(Json.createArrayBuilder().add(patchObject).build());
		final var patchedEntity = jsonPatchProcessor.patch(entity, jsonPatch);

		assertThat(patchedEntity)
			.isNotSameAs(entity)
			.hasFieldOrPropertyWithValue("id", "id")
			.hasFieldOrPropertyWithValue("name", "updated name");
	}

	@Test
	void testPatchJsonPatch_validationError_throws() {
		final var entity = new MyEntity("id", "name");
		final var patchObject = Json.createObjectBuilder().add("op", "replace").add("path", "/name").add("value", "").build();
		final var jsonPatch = Json.createPatch(Json.createArrayBuilder().add(patchObject).build());

		assertThatExceptionOfType(ConstraintViolationException.class)
			.isThrownBy(() -> jsonPatchProcessor.patch(entity, jsonPatch))
			.withMessage("name: must not be blank");
	}

	@SuppressWarnings({ "serial" })
	static class MyEntity implements Serializable {

		@NotBlank
		public String id;

		@NotBlank
		public String name;

		public MyEntity() {}

		public MyEntity(String id, String name) {
			this.id = id;
			this.name = name;
		}

	}

}
