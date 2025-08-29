package ca.gov.dtsstn.vacman.api.json;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

/**
 * A SpringDoc Schema for a single JSON Patch operation as defined by
 * <a href="https://datatracker.ietf.org/doc/html/rfc6902">RFC 6902</a>.
 *
 * Note: a JSON Patch is a sequence (array) of these operations.
 */
public class JsonPatchOperation {

	@Schema(
		allowableValues = { "add", "copy", "move", "remove", "replace", "test" },
		description = """
			The operation to perform.

			Supported operations (from RFC 6902):
			- `add` — Adds a value at the target location.
			- `remove` — Removes the value at the target location.
			- `replace` — Replaces the value at the target location with a new value.
			- `copy` — Copies a value from a specified source location to a target location.
			- `move` — Moves a value from a specified source location to a target location.
			- `test` — Tests that a value at the target location is equal to a specified value.
		""",
		example = "replace",
		requiredMode = RequiredMode.REQUIRED
	)
	public String op;

	@Schema(
		description = """
			A JSON Pointer string (RFC 6901) that identifies the location within the target
			document where the operation is performed.

			For example:
			- `/name` — the `name` property of the root object
			- `/addresses/0/city` — the `city` property of the first element in the `addresses` array
		""",
		example = "/name",
		requiredMode = RequiredMode.REQUIRED)
	public String path;

	@Schema(
		description = """
			The source location (a JSON Pointer string, RFC 6901) used by `move` and `copy` operations.
			Required for `move` and `copy`, ignored otherwise.
		""",
		example = "/oldName"
	)
	public String from;

	@Schema(
		description = """
			The value to apply within the operation. Required for `add`, `replace`, and `test` operations.
			The value can be any valid JSON type (string, number, object, array, boolean, or null).
		""",
		requiredMode = RequiredMode.NOT_REQUIRED)
	public Object value;

}