// Import Dependencies
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Schema } from "app/components/form/schema";
import { Page } from "components/shared/Page";
import { Button, Card } from "components/ui";
import DynamicForms from "app/components/form/dynamicForms";
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import FollowUpHistory from './FollowUpHistory';

const pageName = "Legal Plot";
const doctype = "Legal Plot";

// A. LEGAL ACTIVITY TRACKING (CORE PAGE)
const basicActivityFields = [
  "activity_date",
  "activity_type",
  "property_id",
  "property_location",
];

// C. REVENUE & LAND RECORD ACTIVITIES
const revenueFields = [
  "revenue_office_name",
  "application_type",
  "revenue_application_number",
  "date_of_application",
  "fee_paid",
  "expected_disposal_date",
  "current_status",
  "objection_details",
  "next_hearing_visit_date",
  "outcome_order_summary",
  "certified_copy_required",
  "certified_copy_collected",
];

// D. CIVIL / COURT CASE TRACKING
const civilCourtFields = [
  "civil_case_type",
  "case_number",
  "court_name",
  "plaintiff_name",
  "defendant_name",
  "advocate_handling",
  "date_of_filing",
  "next_hearing_date",
  "last_order_date",
  "last_order_summary",
  "interim_relief",
  "stay_status",
  "risk_level",
  "impact_on_project",
];

// E. CERTIFIED COPY & DOCUMENT TRACKING
const certifiedCopyFields = [
  "doc_document_type",
  "doc_application_date",
  "doc_application_number",
  "office_applied_at",
  "expected_delivery_date",
  "collected_date",
  "pending_reason",
  "urgency_level",
  "uploaded_copy",
];

// F. DAILY LEGAL ACTIVITY LOG
const dailyLogFields = [
  "person_responsible",
  "office_visited",
  "purpose_of_visit",
  "time_spent",
  "remarks_field_notes",
];

// G. COST & PAYMENT TRACKING
const costFields = [
  "fee_type",
  "amount_paid",
  "payment_mode",
  "payment_date",
  "receipt_uploaded",
  "budget_head",
];

// H. RISK, COMPLIANCE & ALERTS
const riskFields = [
  "legal_risk_category",
  "critical_deadline",
  "alert_required",
  "alert_sent_to",
  "escalation_level",
  "compliance_status",
];

// I. MANAGEMENT DAILY REPORT (read-only - optional display)
const managementReportFields = [
  "activities_completed_today",
  "activities_pending",
  "new_cases_filed",
  "orders_received",
  "revenue_approvals_received",
  "high_risk_properties",
  "legal_spend_today",
  "key_management_notes",
];

// J. SYSTEM & AUDIT FIELDS
const systemFields = [
  "entered_by",
  "entered_on",
  "verified_by",
  "verified_date",
  "last_updated_on",
  "activity_status",
];

const allFields = [
  ...basicActivityFields,
  ...revenueFields,
  ...civilCourtFields,
  ...certifiedCopyFields,
  ...dailyLogFields,
  ...costFields,
  ...riskFields,
  ...managementReportFields,
  ...systemFields,
  "all_document",
  "all_followup",
];

const tableFields = {
  fields: {
    all_document: true,
    all_followup: true,
  },
  ignorFields: {
    all_document: true,
    all_followup: true,
  },
};

const initialState = Object.fromEntries(allFields.map((field) => [field, ""]));
initialState.all_document = [];
initialState.all_followup = [];

export default function AddEditForm() {
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: info, isFetching: isFetchingInfo } = useInfo({
    doctype,
    fields: JSON.stringify(allFields),
  });
  const { data, isFetching: isFetchingData, refetch: refetchData } = useFeachSingle({
    doctype,
    id,
    fields: JSON.stringify(allFields),
  });

  const mutationAdd = useAddData((data) => {
    if (data) {
      reset();
      navigate(-1);
    }
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      reset();
      navigate(-1);
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
      mutationUpdate.mutate({ doctype, body: { ...data, id } });
    } else {
      mutationAdd.mutate({ doctype, body: data });
    }
  };

  if (isFetchingInfo || isFetchingData) {
    return (
      <Skeleton
        style={{
          "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
        }}
      />
    );
  }

  return (
    <Page title={(id ? "Edit " : "New ") + pageName}>
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <DocumentPlusIcon className="size-6" />
            <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
              {id ? "Edit" : "New"} {pageName}
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
              form="legal-plot-form"
            >
              Save
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="legal-plot-form"
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

            {/* Left Column */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              {/* A. LEGAL ACTIVITY TRACKING (CORE PAGE) */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  LEGAL ACTIVITY TRACKING (CORE PAGE)
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={basicActivityFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* C. REVENUE & LAND RECORD ACTIVITIES */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  REVENUE & LAND RECORD ACTIVITIES (Tahasil / Revenue Offices)
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={revenueFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* D. CIVIL / COURT CASE TRACKING */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  CIVIL / COURT CASE TRACKING
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={civilCourtFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

             
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              {/* G. COST & PAYMENT TRACKING */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  COST & PAYMENT TRACKING
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={costFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* H. RISK, COMPLIANCE & ALERTS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  RISK, COMPLIANCE & ALERTS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={riskFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* J. SYSTEM & AUDIT FIELDS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  SYSTEM & AUDIT FIELDS
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={systemFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

               {/* E. CERTIFIED COPY & DOCUMENT TRACKING */}
               <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  CERTIFIED COPY & DOCUMENT TRACKING
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={certifiedCopyFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* F. DAILY LEGAL ACTIVITY LOG */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  DAILY LEGAL ACTIVITY LOG (HUMAN WORK TRACKING)
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={dailyLogFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

            </div>

            {/* Full width - Management Report (read-only) */}
            <div className="col-span-12 space-y-6">
              {/* I. MANAGEMENT DAILY REPORT */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  MANAGEMENT DAILY REPORT (AUTO-GENERATED)
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={managementReportFields}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>

              {/* K. ALL DOCUMENTS */}
              <Card className="p-4 sm:px-5">
                <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:text-dark-100">
                  All Documents
                </h3>
                <div className="mt-5 space-y-5">
                  <DynamicForms
                    infos={info}
                    fields={["all_document"]}
                    tables={tableFields}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
}
