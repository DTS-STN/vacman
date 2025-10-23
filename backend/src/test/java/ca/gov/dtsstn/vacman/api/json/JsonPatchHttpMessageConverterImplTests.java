package ca.gov.dtsstn.vacman.api.json;

import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;

import jakarta.json.Json;
import jakarta.json.JsonPatch;

/**
 * Tests for {@link JsonPatchHttpMessageConverter}.
 */
class JsonPatchHttpMessageConverterTests {

	JsonPatchHttpMessageConverter jsonPatchHttpMessageConverter;

	@BeforeEach
	void setUp() throws Exception {
		this.jsonPatchHttpMessageConverter = new JsonPatchHttpMessageConverter();
	}

	@Test
	void testSupportsClass() {
		assertThat(jsonPatchHttpMessageConverter.supports(JsonPatch.class)).isTrue();
		assertThat(jsonPatchHttpMessageConverter.supports(Object.class)).isFalse();
	}

	@Test
	void testReadInternal() throws Exception {
		final var httpInputMessage = mock(HttpInputMessage.class);
		when(httpInputMessage.getBody()).thenReturn(new ByteArrayInputStream("[{ \"op\":\"replace\", \"path\":\"/id\", \"value\":\"value\" }]".getBytes()));

		final var jsonObject = jsonPatchHttpMessageConverter.readInternal(JsonPatch.class, httpInputMessage).toJsonArray().get(0).asJsonObject();

		assertThat(jsonObject.getString("op")).isEqualTo("replace");
		assertThat(jsonObject.getString("path")).isEqualTo("/id");
		assertThat(jsonObject.getString("value")).isEqualTo("value");
	}

	@Test
	void testWriteInternal() throws Exception {
		final Map<String, String> map = Map.of("op", "replace", "path", "/id", "value", "value");

		final var jsonPatchObject = Json.createArrayBuilder(singleton(map)).build();
		final var byteArrayOutputStream = new ByteArrayOutputStream();

		final var httpOutputMessage = mock(HttpOutputMessage.class);
		when(httpOutputMessage.getBody()).thenReturn(byteArrayOutputStream);

		jsonPatchHttpMessageConverter.writeInternal(Json.createPatch(jsonPatchObject), httpOutputMessage);

		assertThat(byteArrayOutputStream).hasToString("[{\"op\":\"replace\",\"path\":\"/id\",\"value\":\"value\"}]");
	}

}
