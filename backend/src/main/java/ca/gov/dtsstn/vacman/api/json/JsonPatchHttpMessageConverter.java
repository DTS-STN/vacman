package ca.gov.dtsstn.vacman.api.json;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.stereotype.Component;

import jakarta.json.Json;
import jakarta.json.JsonPatch;

/**
 * An {@link AbstractHttpMessageConverter} that can read and write {@link JsonPatch} objects.
 *
 * @see <a href="https://tools.ietf.org/html/rfc6902">RFC 6902: JavaScript Object Notation (JSON) Patch</a>
 */
@Component
public class JsonPatchHttpMessageConverter extends AbstractHttpMessageConverter<JsonPatch> {

	public JsonPatchHttpMessageConverter() {
		super(JsonPatchMediaTypes.JSON_PATCH);
	}

	@Override
	protected boolean supports(Class<?> clazz) {
		return JsonPatch.class.isAssignableFrom(clazz);
	}

	@Override
	protected JsonPatch readInternal(Class<? extends JsonPatch> clazz, HttpInputMessage httpInputMessage) {
		try (final var jsonReader = Json.createReader(httpInputMessage.getBody())) {
			return Json.createPatch(jsonReader.readArray());
		}
		catch (final Exception exception) {
			throw new HttpMessageNotReadableException("Could not read JSON patch: " + exception.getMessage(), exception, httpInputMessage);
		}
	}

	@Override
	protected void writeInternal(JsonPatch jsonPatch, HttpOutputMessage httpOutputMessage) {
		try (final var jsonWriter = Json.createWriter(httpOutputMessage.getBody())) {
			jsonWriter.write(jsonPatch.toJsonArray());
		}
		catch (final Exception exception) {
			throw new HttpMessageNotWritableException("Could not write JSON patch: " + exception.getMessage(), exception);
		}
	}

}
