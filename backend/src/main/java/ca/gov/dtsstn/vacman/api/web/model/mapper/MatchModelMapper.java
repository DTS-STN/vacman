package ca.gov.dtsstn.vacman.api.web.model.mapper;

import java.io.ByteArrayOutputStream;
import java.util.Collection;
import java.util.List;
import java.util.function.Function;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.dom.element.style.StyleTableColumnPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.web.model.MatchReadModel;
import ca.gov.dtsstn.vacman.api.web.model.MatchSummaryReadModel;

@Mapper(uses = { CodeModelMapper.class, ProfileModelMapper.class }, unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MatchModelMapper {

	@Mapping(target = "profile.firstName", source = "profile.user.firstName")
	@Mapping(target = "profile.lastName", source = "profile.user.lastName")
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
		// Define the columns for the spreadsheet
		record Column(String header, Function<MatchSummaryReadModel, String> valueExtractor) {}

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
			new Column("Request ID", match -> match.request().id().toString()),
			new Column("Match ID", match -> match.id().toString()),
			new Column("Profile ID", match -> match.profile().id().toString()),
			new Column("First Name", match -> match.profile().firstName()),
			new Column("Last Name", match -> match.profile().lastName()),
			new Column("WFA Status", match -> match.profile().wfaStatus().nameEn()),
			new Column("Request Status", match -> match.request().requestStatus().nameEn()),
			new Column("Request Date", match -> match.request().requestDate().toString()),
			new Column("Hiring Manager First Name", match -> match.request().hiringManagerFirstName()),
			new Column("Hiring Manager Last Name", match -> match.request().hiringManagerLastName()),
			new Column("Hiring Manager Email", match -> match.request().hiringManagerEmail()),
			new Column("HR Advisor ID", match -> match.request().hrAdvisorId() != null ? match.request().hrAdvisorId().toString() : ""),
			new Column("HR Advisor First Name", match -> match.request().hrAdvisorFirstName()),
			new Column("HR Advisor Last Name", match -> match.request().hrAdvisorLastName()),
			new Column("HR Advisor Email", match -> match.request().hrAdvisorEmail()),
			new Column("Match Status", match -> match.matchStatus().nameEn()),
			new Column("Match Feedback", match -> match.matchFeedback() != null ? match.matchFeedback().nameEn() : ""),
			new Column("Hiring Manager Comment", match -> match.hiringManagerComment() != null ? match.hiringManagerComment() : ""),
			new Column("HR Advisor Comment", match -> match.hrAdvisorComment() != null ? match.hrAdvisorComment() : ""),
			new Column("Created Date", match -> match.createdDate().toString())
		);

		try {
			// Create a new spreadsheet document
			final var spreadsheet = OdfSpreadsheetDocument.newSpreadsheetDocument();
			final var table = spreadsheet.getTableByName("Sheet1");

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
					final var value = columns.get(i).valueExtractor().apply(match);
					cell.setStringValue(value);
					cell.getOdfElement().setStyleName(normalStyle.getStyleNameAttribute());
				}
			}

			// Set the column widths
			for (int i = 0; i < columns.size(); i++) {
				final var columnStyle = spreadsheet.getContentDom().getAutomaticStyles().newStyle(OdfStyleFamily.TableColumn);
				columnStyle.setProperty(StyleTableColumnPropertiesElement.UseOptimalColumnWidth, "true");
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
