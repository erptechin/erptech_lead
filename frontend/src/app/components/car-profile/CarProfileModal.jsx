import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { Button } from "components/ui";
import DynamicForms from 'app/components/form/dynamicForms';
import { Schema } from "app/components/form/schema";
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

const doctype = "Plot Detail";

// Section 1: Basic Plot Details
const displayFields1 = [
  'plot_no',
  'plot_id',
  'project_layout_name',
  'location_village',
  'survey_no',
  'plot_type',
  'plot_size',
  'length',
  'width',
  'facing'
];

// Section 2: Ownership & Legal
const displayFields2 = [
  'owner_name',
  'document_no',
  'registration_date',
  'patta_khata_no',
  'approval_authority',
  'legal_status'
];

// Section 3: Financial Details
const displayFields3 = [
  'rate_per_sqft',
  'total_plot_value',
  'booking_amount',
  'paid_amount',
  'balance_amount',
  'payment_mode',
  'payment_date',
  'agent_reference_name'
];

// Section 4: Status Tracking
const displayFields4 = [
  'plot_status',
  'booking_date',
  'sale_date',
  'handover_date',
  'remarks',
  'attach_file'
];

// Combine all fields for API calls and form
const allFields = [...displayFields1, ...displayFields2, ...displayFields3, ...displayFields4];

const tableFields = {
  "ignorFields": {}
};

const initialState = Object.fromEntries(
  allFields.map(field => [field, ""])
);

export default function CarProfileModal({ 
  isOpen, 
  onClose, 
  carProfileId,
  carProfileData = null,
  customerId, 
  customerName,
  leadId,
  leadName,
  isCreateMode = false,
  onSuccess 
}) {
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const { data: info, isFetching: isFetchingInfo } = useInfo({ 
    doctype, 
    fields: JSON.stringify(allFields) 
  });

  // No need for filtered info anymore - using direct info
  
  const { data, isFetching: isFetchingData, refetch } = useFeachSingle({ 
    doctype, 
    id: isOpen && carProfileId && !isCreateMode ? carProfileId : null, 
    fields: JSON.stringify(allFields)
  });
  
  // Refetch data when modal opens for editing/viewing (only in normal mode)
  useEffect(() => {
    if (isOpen && carProfileId && !isCreateMode) {
      refetch();
    }
  }, [isOpen, carProfileId, isCreateMode, refetch]);

  const mutationAdd = useAddData(() => {
    reset();
    if (onSuccess) onSuccess();
    onClose();
  });

  const mutationUpdate = useUpdateData(() => {
    reset();
    if (onSuccess) onSuccess();
    onClose();
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(Schema(info?.fields)),
    defaultValues: initialState,
    mode: 'onChange',
  });

  // Update form values when data is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode && carProfileData) {
        // Editing in create mode - use carProfileData prop
        reset(carProfileData);
      } else if (carProfileId && !isCreateMode) {
        // Editing/Viewing mode - wait for data to load
        if (data) {
          reset(data);
        }
      } else {
        // Creating new profile
        reset(initialState);
        // In create mode, don't set customer/lead (they'll be set later)
        // In normal mode, set customer and lead from props
        if (!isCreateMode) {
          if (customerId) {
            setValue('customer', customerId);
          }
          if (leadId) {
            setValue('lead', leadId);
          } else if (leadName) {
            setValue('lead', leadName);
          }
        }
      }
    } else {
      // Reset form when modal closes
      reset(initialState);
    }
  }, [isOpen, carProfileId, carProfileData, isCreateMode, data, customerId, customerName, leadId, leadName, reset, setValue]);

  const onSubmit = (formData) => {
    // Form validation is handled by react-hook-form
    // This function only runs if validation passes
    
    console.log('Form submitted with data:', formData);
    
    // In create mode, just return the data to parent component
    if (isCreateMode) {
      const submitData = { ...formData };
      // Set status based on context - from Lead it should be "New"
      if (leadId || leadName) {
        submitData.status = "New";
      }
      // Don't set customer/lead in create mode - they'll be set when lead is created
      if (onSuccess) {
        onSuccess(submitData);
      }
      return;
    }
    
    // Ensure lead, customer, and status are set when creating new profile (normal mode)
    const submitData = { ...formData };

    submitData.lead = leadId;
    submitData.customer = customerId;
    
    console.log('Submitting with data:', submitData);
    
    if (carProfileId) {
      console.log('Calling mutationUpdate...');
      mutationUpdate.mutate({ doctype, body: { ...submitData, id: carProfileId } });
    } else {
      submitData.status = "New";
      console.log('Calling mutationAdd...');
      mutationAdd.mutate({ doctype, body: submitData });
    }
    
    // IMPORTANT: Don't close modal here - wait for mutation success callback
    // The modal will only close when the API call succeeds
  };

  // Handle form submission errors
  const onError = (errors) => {
    console.log('Form validation errors:', errors);
    // Form validation errors are already displayed by DynamicForms component
  };

  if (isFetchingInfo || (isOpen && carProfileId && !isCreateMode && isFetchingData)) {
    return (
      <Transition show={isOpen}>
        <Dialog open={isOpen} onClose={onClose} static={false} autoFocus>
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="fixed inset-0 z-60 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
            onClick={() => {
              // Don't close if form is submitting
              if (!mutationAdd.isPending && !mutationUpdate.isPending) {
                onClose();
              }
            }}
          />
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed inset-y-0 right-0 z-61 flex w-screen max-w-3xl transform-gpu flex-col bg-white transition-transform duration-300 dark:bg-dark-700 sm:max-w-4xl lg:max-w-5xl"
        >
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                {carProfileId ? 'Edit' : 'New'} Plot Detail
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <Skeleton
                style={{
                  "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
                }}
              />
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
    );
  }

  return (
    <Transition show={isOpen}>
      <Dialog 
        open={isOpen} 
        onClose={(value) => {
          // Only allow closing if form is not submitting
          if (!mutationAdd.isPending && !mutationUpdate.isPending) {
            onClose();
          }
        }} 
        static={mutationAdd.isPending || mutationUpdate.isPending}
        autoFocus
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 z-60 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
          onClick={() => {
            // Only allow closing if form is not submitting
            if (!mutationAdd.isPending && !mutationUpdate.isPending) {
              onClose();
            }
          }}
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="fixed inset-y-0 right-0 z-61 flex w-screen max-w-3xl transform-gpu flex-col bg-white transition-transform duration-300 dark:bg-dark-700 sm:max-w-4xl lg:max-w-5xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
              {carProfileId ? 'Edit' : 'New'} Plot Detail
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* Content */}
          <form 
            onSubmit={handleSubmit(onSubmit, onError)} 
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            noValidate
          >
            <div className="scrollbar-sm flex-1 overflow-y-auto">
              <div className="grid grid-cols-12 gap-4 p-5 sm:gap-5 lg:gap-6">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                  {/* Section 1: Basic Plot Details */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                      Basic Plot Details
                    </h3>
                    <DynamicForms
                      infos={info}
                      fields={displayFields1}
                      register={register}
                      tables={tableFields}
                      control={control}
                      errors={errors}
                    />
                  </div>

                  {/* Section 2: Ownership & Legal */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                      Ownership & Legal
                    </h3>
                    <DynamicForms
                      infos={info}
                      fields={displayFields2}
                      register={register}
                      tables={tableFields}
                      control={control}
                      errors={errors}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                  {/* Section 3: Financial Details */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                      Financial Details
                    </h3>
                    <DynamicForms
                      infos={info}
                      fields={displayFields3}
                      register={register}
                      tables={tableFields}
                      control={control}
                      errors={errors}
                    />
                  </div>

                  {/* Section 4: Status Tracking */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-dark-100 border-b pb-2">
                      Status Tracking
                    </h3>
                    <DynamicForms
                      infos={info}
                      fields={displayFields4}
                      register={register}
                      tables={tableFields}
                      control={control}
                      errors={errors}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button
                variant="outlined"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="button"
                onClick={handleSubmit(onSubmit, onError)}
                disabled={isSubmitting || mutationAdd.isPending || mutationUpdate.isPending}
              >
                {isSubmitting || mutationAdd.isPending || mutationUpdate.isPending
                  ? 'Saving...' 
                  : (carProfileId ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

