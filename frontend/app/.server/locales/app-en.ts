import type { Translations } from './index'

const appEn: Translations = {
  index: {
    about: "The VacMan initiative!",
    dashboard: "Dashboard",
    pageTitle: "Welcome to VacMan",
    navigate: "Go to the employee portal",
    register: "Register"
  },
  register: {
    employee: "Employee",
    hiringManager: "Hiring Manager",
    pageTitle: "Register as..."
  },
  profile: {
    about: "Your profile helps us understand your current position, referral preferences, and qualifications. You can update each section as needed. Your progress is saved automatically.",
    edit: "Edit",
    add: "Add",
    inProgress: "In progress",
    required: "Required",
    fieldsComplete: "{{completed}} out of {{total}} fields complete",
    personalInformation: {
      title: "Personal information",
      linkLabel: "personal information"
    },
    employment: {
      title: "Employment information",
      linkLabel: "employment information"
    },
    referral: {
      title: "Referral preferences",
      linkLabel: "referral preferences"
    },
    qualifications: {
      title: "Qualifications",
      linkLabel: "qualifications"
    },
    back: "Back to profile"
  },
  form: {
    save: "Save",
    submit: "Submit"
  },
  personalInformation: {
    pageTitle: "Personal information",
    preferredLanguage: "Preferred language of correspondence",
    workEmail: "Work email address",
    personalEmail: "Personal email address",
    workPhone: "Work phone number",
    personalPhone: "Personal phone number",
    education: "What is your highest level of education?",
    additionalInformation: "Additional information",
    additionalInfoHelpMessage: "Briefly note absences or other key information.",
    errors: {
      preferredLanguage_Required: "Preferred language of correspondence is Required.",
      personalEmail_Invalid: "Invalid personal email address.",
      personalEmail_Required: "Personal email address is Required.",
      workPhone_Invalid: "Invalid work phone number.",
      workPhone_Required: "Work phone number is Required.",
      personalPhone_Invalid: "Invalid personal phone number.",
      personalPhone_Required: "Personal phone number is Required.",
      education_Required: "Education level is Required."
    }
  },
  employmentInformation: {
    pageTitle: "Employment information",
    personalRecordIdentifier: "Personal record identifier (PRI)",
    substantivePositionHeading: "Substantive position",
    substantivePositionGroupAndLevel: "Group and level of your substantive position",
    substantiveGroup: "Group",
    substantiveLevel: "Level",
    branchOrServiceCanadaRegion: "Branch or Service Canada Region",
    directorate: "Directorate",
    provinces: "Province of the designated work location of your substantive position",
    city: "City of the designated work location of your substantive position",
    wfaDetailsHeading: "WFA Details",
    current_Wfa_Status: "Current WFA status",
    wfa_EffectiveDate: "Efftive date of your WFA status (if applicable)",
    wfa_EndDate: "End date of your WFA status (if applicable)",
    hrAdvisor: "HR advisor identified on your WFA letter",
    errors: {
      personalRecordIdentifier_Required: "Personal record identifier is required.",
      personalRecordIdentifier_Invalid: "Invalid personal record identifier.",
      substantiveGroup_Required: "Substantive group is required.",
      substantiveLevel_Required: "Substantive level is required.",
      branchOrServiceCanadaRegion_Required: "Branch or Service Canada Region is required.",
      directorate_Required: "Directorate is required.",
      provinces_Required: "Province of the designated work location is required.",
      city_Required: "City of the designated work location is required.",
      current_Wfa_Status_Required: "Current WFA status is required.",
      hrAdvisor_Required: "HR advisor is required."
    }
  }
}

export default appEn