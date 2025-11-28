package ca.gov.dtsstn.vacman.api.web.model.mapper;

import java.io.ByteArrayOutputStream;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.stream.IntStream;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.dom.element.style.StyleTableColumnPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.pkg.OdfElement;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.web.model.MatchReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchSummaryReadModel;

@Mapper(uses = { CodeModelMapper.class, ProfileModelMapper.class }, unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MatchModelMapper {

	@Mapping(target = "profile.firstName", source = "profile.user.firstName")
	@Mapping(target = "profile.lastName", source = "profile.user.lastName")
	@Mapping(target = "profile.email", source = "profile.user.businessEmailAddress")
	@Mapping(target = "request.id", source = "request.id")
	@Mapping(target = "request.requestStatus", source = "request.requestStatus")
	@Mapping(target = "request.requestDate", source = "request.createdDate")
	@Mapping(target = "request.hiringManagerFirstName", source = "request.hiringManager.firstName")
	@Mapping(target = "request.hiringManagerLastName", source = "request.hiringManager.lastName")
	@Mapping(target = "request.hiringManagerEmail", source = "request.hiringManager.businessEmailAddress")
	@Mapping(target = "request.hrAdvisorId", source = "request.hrAdvisor.id")
	@Mapping(target = "request.hrAdvisorFirstName", source = "request.hrAdvisor.firstName")
	@Mapping(target = "request.hrAdvisorLastName", source = "request.hrAdvisor.lastName")
	@Mapping(target = "request.hrAdvisorEmail", source = "request.hrAdvisor.businessEmailAddress")
	MatchSummaryReadModel toSummaryModel(MatchEntity entity);

	@Mapping(target = "request.englishLanguageProfile", source = "request.languageProfileEn")
	@Mapping(target = "request.englishStatementOfMerit", source = "request.somcAndConditionEmploymentEn")
	@Mapping(target = "request.englishTitle", source = "request.nameEn")
	@Mapping(target = "request.equityNeeded", source = "request.employmentEquityNeedIdentifiedIndicator")
	@Mapping(target = "request.frenchLanguageProfile", source = "request.languageProfileFr")
	@Mapping(target = "request.frenchStatementOfMerit", source = "request.somcAndConditionEmploymentFr")
	@Mapping(target = "request.frenchTitle", source = "request.nameFr")
	@Mapping(target = "request.hasMatches", constant = "true")
	@Mapping(target = "request.languageOfCorrespondence", source = "request.language")
	@Mapping(target = "request.projectedEndDate", source = "request.endDate")
	@Mapping(target = "request.projectedStartDate", source = "request.startDate")
	@Mapping(target = "request.status", source = "request.requestStatus")
	MatchReadModel toModel(MatchEntity entity);

	/**
	 * Generate an ODS spreadsheet from a collection of match summaries.
	 */
	default byte[] toOds(Collection<MatchSummaryReadModel> matches) {
		// A simple data structure to hold column metadata
		record Column(String header, Function<MatchSummaryReadModel, String> valueExtractor, String validationName) {
			Column(String header, Function<MatchSummaryReadModel, String> valueExtractor) {
				this(header, valueExtractor, null);
			}
		}

		// The possible values for a Match Feedback (used in dropdown validation)
		final var matchFeedbackValues = """
			"No response";
			"Not interested";
			"Not qualified - Competency";
			"Not qualified - Education";
			"Not qualified - Other";
			"Qualified - Accepted offer (indeterminate)";
			"Qualified - Refused offer";
			"Qualified - Not selected";
		""";

		// the common XML NS used by the ODS format
		final var TABLE_NS = "urn:oasis:names:tc:opendocument:xmlns:table:1.0";

		//
		// The idea here is to create an ordered list of headers and column extractors so that
		// they can be moved around freely within the spreadsheet without changing the logic below.
		//
		// The ODS library requires cell indexes when creating cells, which makes refactoring
		// (ie: moving columns around) exceedingly difficult.
		//
		// This data structure alleviates some of that pain.
		//

		final var columns = List.of(
			new Column("First Name", match -> match.profile().firstName()),
			new Column("Last Name", match -> match.profile().lastName()),
			new Column("Email", match -> match.profile().email()),
			new Column("WFA Status", match -> match.profile().wfaStatus().nameEn()),
			new Column("Match Status", match -> match.matchStatus().nameEn()),
			// XXX ::: GjB ::: I have intentionally removed the `MatchFeedbackValidation` validator from this column because it doesn't work with excel
			//                 I am leaving the code that handles the validation here in case we want to revisit this in the future
			new Column("Match Feedback", match -> match.matchFeedback() != null ? match.matchFeedback().nameEn() : ""),
			new Column("Hiring Manager Comment", match -> match.hiringManagerComment() != null ? match.hiringManagerComment() : "")
		);

		try {
			// Create a new spreadsheet document
			final var spreadsheet = OdfSpreadsheetDocument.newSpreadsheetDocument();
			final var table = spreadsheet.getTableByName("Sheet1");

			// The Match Feedback validation has to be anchored to a cell, so we find its index here
			final var matchFeedbackColumnIndex = IntStream.range(0, columns.size())
				// XXX ::: GjB ::: the validator name here is intentionally altered to prevent it from being applied
				//                 see comment above where the columns are defined (I want to keep the code for future consideration)
				.filter(i -> "xxMatchFeedbackValidation".equals(columns.get(i).validationName()))
				.findFirst().orElse(-1);

			if (matchFeedbackColumnIndex != -1) {
				final var baseCellAddress = String.format("Sheet1.%s1", (char) ('A' + matchFeedbackColumnIndex));

				// disallow values other than those in the list
				final var errorElement = spreadsheet.getContentDom().createElementNS(TABLE_NS, "table:error-message");
				errorElement.setAttributeNS(TABLE_NS, "table:message-type", "stop");
				errorElement.setAttributeNS(TABLE_NS, "table:display", "true");

				// create the content validation element
				final var validationElement = spreadsheet.getContentDom().createElementNS(TABLE_NS, "table:content-validation");
				validationElement.setAttributeNS(TABLE_NS, "table:name", "MatchFeedbackValidation");
				validationElement.setAttributeNS(TABLE_NS, "table:condition", String.format("of:cell-content-is-in-list(%s)", matchFeedbackValues));
				validationElement.setAttributeNS(TABLE_NS, "table:allow-empty-cell", "true");
				validationElement.setAttributeNS(TABLE_NS, "table:display-list", "unsorted");
				validationElement.setAttributeNS(TABLE_NS, "table:base-cell-address", baseCellAddress);
				validationElement.appendChild(errorElement);

				final var validationsElement = spreadsheet.getContentDom().createElementNS(TABLE_NS, "table:content-validations");
				validationsElement.appendChild(validationElement);

				// add the validation to the spreadsheet
				final var root = spreadsheet.getContentDom().getRootElement();
				final var body = (OdfElement) root.getElementsByTagName("office:body").item(0);
				final var officeSpreadsheet = body.getElementsByTagName("office:spreadsheet").item(0);
				officeSpreadsheet.insertBefore(validationsElement, table.getOdfElement());
			}

			// Create a bold style for the header row
			final var boldStyle = spreadsheet.getContentDom().getAutomaticStyles().newStyle(OdfStyleFamily.TableCell);
			boldStyle.setProperty(StyleTextPropertiesElement.FontWeight, "bold");
			// Create a normal style for data rows
			final var normalStyle = spreadsheet.getContentDom().getAutomaticStyles().newStyle(OdfStyleFamily.TableCell);
			normalStyle.setProperty(StyleTextPropertiesElement.FontWeight, "normal");

			// Create the header row
			for (int i = 0; i < columns.size(); i++) {
				final var cell = table.getRowByIndex(0).getCellByIndex(i);
				cell.setStringValue(columns.get(i).header());
				cell.getOdfElement().setStyleName(boldStyle.getStyleNameAttribute());
			}

			// Create the data rows
			for (final var match : matches) {
				final var row = table.appendRow();

				for (int i = 0; i < columns.size(); i++) {
					final var cell = row.getCellByIndex(i);
					final var column = columns.get(i);
					final var value = column.valueExtractor().apply(match);
					cell.setStringValue(value);
					cell.getOdfElement().setStyleName(normalStyle.getStyleNameAttribute());

					if (column.validationName() != null) {
						cell.getOdfElement().setAttributeNS(TABLE_NS, "table:content-validation-name", column.validationName());
					}
				}
			}

			// Set the column widths
			for (int i = 0; i < columns.size(); i++) {
				final var columnStyle = spreadsheet.getContentDom().getAutomaticStyles().newStyle(OdfStyleFamily.TableColumn);
				columnStyle.setProperty(StyleTableColumnPropertiesElement.ColumnWidth, "2.5in");
				table.getColumnByIndex(i).getOdfElement().setStyleName(columnStyle.getStyleNameAttribute());
			}

			// Save the document to a byte array
			final var baos = new ByteArrayOutputStream();
			spreadsheet.save(baos);
			spreadsheet.close();
			return baos.toByteArray();
		}
		catch (final Exception exception) {
			// the various ODS methods generate a generic Exception, so we have to catch that
			throw new RuntimeException("Failed to generate ODS document", exception);
		}
	}

}
