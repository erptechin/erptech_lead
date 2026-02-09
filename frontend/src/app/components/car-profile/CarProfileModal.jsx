import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { XMarkIcon, PlusIcon, TrashIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { Button, Upload, Input } from "components/ui";
import { Controller } from "react-hook-form";
import DynamicForms from 'app/components/form/dynamicForms';
import { Schema } from "app/components/form/schema";
import { useInfo, useAddData, useFeachSingle, useUpdateData } from "hooks/useApiHook";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { JWT_HOST_API } from "configs/auth.config";
import clsx from "clsx";

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
  'remarks'
];

// Combine all fields for API calls and form
const allFields = [...displayFields1, ...displayFields2, ...displayFields3, ...displayFields4];

const tableFields = {
  "ignorFields": { "plot_document": true }
};

const initialState = Object.fromEntries(
  allFields.map(field => [field, ""])
);
initialState.plot_document = [];

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

  // Use useFieldArray for plot_document
  const { fields, append, remove } = useFieldArray({
    control,
    name: "plot_document"
  });

  // Update form values when data is loaded or modal opens
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode && carProfileData) {
        // Editing in create mode - use carProfileData prop
        const formData = {
          ...carProfileData,
          plot_document: Array.isArray(carProfileData.plot_document)
            ? carProfileData.plot_document
            : []
        };
        reset(formData);
      } else if (carProfileId && !isCreateMode) {
        // Editing/Viewing mode - wait for data to load
        if (data) {
          const formData = {
            ...data,
            plot_document: Array.isArray(data.plot_document)
              ? data.plot_document
              : []
          };
          reset(formData);
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
                  
              {/* All Documents Section */}
              <div className="px-6">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-100">
                    All Documents
                  </h3>
                  <Button
                    type="button"
                    variant="flat"
                    size="sm"
                    onClick={() => append({ title: "", file: "" })}
                    className="gap-1"
                  >
                    <PlusIcon className="size-4" />
                    Add Document
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-dark-500"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-dark-300">
                          Document {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="flat"
                          size="sm"
                          color="error"
                          onClick={() => remove(index)}
                          className="gap-1"
                        >
                          <TrashIcon className="size-4" />
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          label="Title"
                          placeholder="Enter document title"
                          {...register(`plot_document.${index}.title`)}
                          error={errors?.plot_document?.[index]?.title?.message}
                        />
                        <div>
                          <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-200">
                            File
                          </label>
                          <Controller
                            name={`plot_document.${index}.file`}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <div className="flex gap-4">
                                <div className={clsx("flex-1", value && "max-w-[60%]")}>
                                  <Upload onChange={onChange} accept="image/*">
                                    {({ onClick, disabled, ...props }) => (
                                      <Button
                                        {...props}
                                        type="button"
                                        unstyled
                                        onClick={onClick}
                                        disabled={disabled}
                                        className={clsx(
                                          "mt-1 w-full shrink-0 flex-col rounded-lg border-2 border-dashed py-6 border-gray-300 dark:border-dark-450",
                                          "hover:border-primary-400 dark:hover:border-primary-500"
                                        )}
                                      >
                                        <CloudArrowUpIcon className="size-8 text-gray-400 dark:text-dark-400" />
                                        <span className={clsx("pointer-events-none mt-2 text-sm text-gray-600 dark:text-dark-200")}>
                                          <span className="text-primary-600 dark:text-primary-400">Browse</span>
                                          <span> or drop your file here</span>
                                        </span>
                                        {value && (
                                          <span className="mt-2 text-xs text-gray-500 dark:text-dark-300">
                                            File selected
                                          </span>
                                        )}
                                      </Button>
                                    )}
                                  </Upload>
                                </div>
                                {value && (
                                  <div className="mt-1 flex-shrink-0">
                                    <img
                                      src={value.startsWith('http') ? value : `${JWT_HOST_API}${value}`}
                                      alt="Preview"
                                      className="h-32 w-32 rounded border border-gray-200 object-cover dark:border-dark-500"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-dark-500">
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        No documents added. Click &quot;Add Document&quot; to add one.
                      </p>
                    </div>
                  )}
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

