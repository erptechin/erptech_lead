// Import Dependencies
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { JWT_HOST_API } from 'configs/auth.config';

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import FollowUpHistory from './FollowUpHistory';
import AllDocuments from './AllDocuments';

const pageName = "Legal"
const doctype = "Legal"

// Section A: BASIC CASE IDENTIFICATION
const basicCaseFields = [
  'case_type',
  'fir_case_number',
  'year',
  'police_station_court_name',
  'district',
  'state',
  'date_of_registration_filing',
  'jurisdiction_type'
]

// Section B: PARTY DETAILS
const partyFields = [
  'complainant_name',
  'complainant_address',
  'complainant_contact_number',
  'complainant_email',
  'relationship_with_organisation'
]

// Section C: ORGANISATION DETAILS
const organisationFields = [
  'organisation_name',
  'organisation_type',
  'cin_gst',
  'authorised_signatory',
  'business_locations'
]

// Section D: OFFENCE & LEGAL DETAILS
const offenceFields = [
  'sections_invoked',
  'nature_of_offence',
  'brief_gist_allegations',
  'detailed_case_summary',
  'amount_involved',
  'property_asset_involved',
  'documents_involved'
]

// Section E: FINANCIAL & TRANSACTION DETAILS
const financialFields = [
  'transaction_type',
  'cheque_number',
  'cheque_date',
  'cheque_amount',
  'bank_name_branch',
  'account_number',
  'transaction_date',
  'disputed_amount',
  'admitted_amount',
  'settlement_status'
]

// Section F: INVESTIGATION & PROCEDURAL STATUS
const investigationFields = [
  'io_name',
  'io_contact',
  'stage_of_case',
  'arrest_made',
  'custody_type',
  'seizure_details',
  'case_diary_reference_numbers',
  'next_investigation_date'
]

// Section G: COURT PROCEEDINGS
const courtFields = [
  'court_name',
  'case_number_court',
  'presiding_judge',
  'advocate_name',
  'advocate_contact',
  'date_of_hearing',
  'last_order_date',
  'last_order_summary',
  'next_date_of_hearing',
  'bail_status',
  'stay_interim_order'
]

// Section H: THREAT & RISK ASSESSMENT
const threatFields = [
  'threat_perception_level',
  'type_of_threat',
  'threat_incidents_recorded',
  'protection_requested',
  'police_protection_granted'
]

// Section I: DOCUMENT MANAGEMENT
const documentFields = [
  'uploaded_documents',
  'document_date',
  'document_category',
  'seizure_list_attached',
  'evidence_status'
]

// Section J: INTERNAL LEGAL STRATEGY
const strategyFields = [
  'case_strength_assessment',
  'risk_exposure',
  'recommended_action',
  'linked_counter_cases',
  'limitation_date_alerts',
  'next_legal_action_due',
  'remarks_advocate_notes'
]

// Combine all fields
const allFields = [
  ...basicCaseFields,
  ...partyFields,
  ...organisationFields,
  ...offenceFields,
  ...financialFields,
  ...investigationFields,
  ...courtFields,
  ...threatFields,
  ...documentFields,
  ...strategyFields,
]

const tableFields = {
  "all_document": { file: true },
  "ignorFields": {}
}

// ----------------------------------------------------------------------

const initialState = Object.fromEntries(
  allFields.map(field => [field, ""])
);
initialState.accused_details = [];
initialState.all_document = [];
initialState.all_followup = [];

export default function AddEditFrom() {
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: info, isFetching: isFetchingInfo } = useInfo({ doctype, fields: JSON.stringify(allFields) });
  const { data, isFetching: isFetchingData, refetch: refetchData } = useFeachSingle({ doctype, id, fields: JSON.stringify(allFields) });

  const mutationAdd = useAddData((data) => {
    if (data) {
      reset();
      navigate(-1)
    }
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      reset();
      navigate(-1)
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(Schema(info?.fields)),
    values: id ? data : initialState,
  });

  const onSubmit = (data) => {
    if (id) {
      mutationUpdate.mutate({ doctype, body: { ...data, id } })
    } else {
      mutationAdd.mutate({ doctype, body: data })
    }
  };

  if (isFetchingInfo || isFetchingData) {
    return <Skeleton
      style={{
        "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
      }}
    />
  };

  return (
    <Page title={(id ? 'Edit ' : "New ") + pageName}>
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <DocumentPlusIcon className="size-6" />
            <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
              {id ? 'Edit' : "New"} {pageName}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              className="min-w-[7rem]"
              variant="outlined"
              color="error"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              className="min-w-[7rem]"
              color="primary"
              type="submit"
              form="new-post-form"
            >
              Save
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="new-post-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            {/* Follow-Up History Records */}
            <FollowUpHistory
              id={id}
              data={data}
              setValue={setValue}
              refetchData={refetchData}
              doctype={doctype}
            />

            {/* All Documents */}
            <AllDocuments
              id={id}
              data={data}
              setValue={setValue}
              refetchData={refetchData}
              doctype={doctype}
            />

            {/* Left Column - Main Fields */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              {/* Section A: BASIC CASE IDENTIFICATION */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  BASIC CASE IDENTIFICATION (Mandatory)
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={basicCaseFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section B: PARTY DETAILS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  PARTY DETAILS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={partyFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section C: ORGANISATION DETAILS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  ORGANISATION DETAILS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={organisationFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section D: OFFENCE & LEGAL DETAILS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  OFFENCE & LEGAL DETAILS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={offenceFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section E: FINANCIAL & TRANSACTION DETAILS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  FINANCIAL & TRANSACTION DETAILS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={financialFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>



            </div>

            {/* Right Column - Sidebar Fields */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              {/* Section H: THREAT & RISK ASSESSMENT */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  THREAT & RISK ASSESSMENT
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={threatFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section I: DOCUMENT MANAGEMENT */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  DOCUMENT MANAGEMENT
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={documentFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section J: INTERNAL LEGAL STRATEGY */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  INTERNAL LEGAL STRATEGY (Restricted Access)
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={strategyFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>


              {/* Section G: COURT PROCEEDINGS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  COURT PROCEEDINGS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={courtFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* Section F: INVESTIGATION & PROCEDURAL STATUS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                  INVESTIGATION & PROCEDURAL STATUS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={investigationFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

            </div>

            <div className="col-span-12 lg:col-span-12 space-y-6">

            </div>

          </div>
        </form>
      </div>
    </Page>
  );
};
