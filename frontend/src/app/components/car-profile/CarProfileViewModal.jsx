import React, { useEffect, useState } from "react";
import { XMarkIcon, ShareIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { Button } from "components/ui";
import { useInfo, useFeachSingle } from "hooks/useApiHook";
import { Skeleton } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { JWT_HOST_API } from "configs/auth.config";

const doctype = "Plot Detail";
const fields = [
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
const subFields = [
  'status',
  'owner_name',
  'document_no',
  'registration_date',
  'patta_khata_no',
  'approval_authority',
  'legal_status',
  'rate_per_sqft',
  'total_plot_value',
  'booking_amount',
  'paid_amount',
  'balance_amount',
  'payment_mode',
  'payment_date',
  'buyer_name',
  'contact_number',
  'email_id',
  'address',
  'agent_reference_name',
  'plot_status',
  'booking_date',
  'sale_date',
  'handover_date',
  'remarks'
];
const plotDocumentFields = [
  'plot_document'
];

// Helper function to get field label
const getFieldLabel = (info, fieldname) => {
  const field = info?.fields?.find(f => f.fieldname === fieldname);
  return field?.label || fieldname;
};

// Helper function to format field value
const formatFieldValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return value;
};

export default function CarProfileViewModal({
  isOpen,
  onClose,
  carProfileId
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const { isDark, darkColorScheme, lightColorScheme } = useThemeContext();
  const { data: info, isFetching: isFetchingInfo } = useInfo({
    doctype,
    fields: JSON.stringify([...fields, ...subFields, ...plotDocumentFields])
  });

  const { data, isFetching: isFetchingData, refetch } = useFeachSingle({
    doctype,
    id: isOpen && carProfileId ? carProfileId : null,
    fields: JSON.stringify([...fields, ...subFields, ...plotDocumentFields])
  });

  // Refetch data when modal opens
  useEffect(() => {
    if (isOpen && carProfileId) {
      refetch();
    }
  }, [isOpen, carProfileId, refetch]);

  const handleShare = () => {
    if (!data) return;
    
    // Format plot documents
    const plotDocuments = data?.plot_document && Array.isArray(data.plot_document) && data.plot_document.length > 0
      ? data.plot_document.map((doc, index) => {
          const docTitle = doc?.title || `Document ${index + 1}`;
          const docFile = doc?.file ? `${JWT_HOST_API}${doc.file}` : '';
          return docFile ? `  • ${docTitle}: ${docFile}` : `  • ${docTitle}`;
        }).join('\n')
      : 'N/A';
    
    // Format plot details for WhatsApp
    const details = [
      `*Plot Details*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `*Plot No:* ${data.plot_no || 'N/A'}`,
      `*Plot ID:* ${data.plot_id || 'N/A'}`,
      `*Project/Layout:* ${data.project_layout_name || 'N/A'}`,
      `*Location:* ${data.location_village || 'N/A'}`,
      `*Plot Size:* ${data.plot_size || 'N/A'}`,
      `*Plot Type:* ${data.plot_type || 'N/A'}`,
      `*Facing:* ${data.facing || 'N/A'}`,
      `*Total Value:* ${data.total_plot_value ? `AED ${parseFloat(data.total_plot_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Rate per Sqft:* ${data.rate_per_sqft ? `AED ${parseFloat(data.rate_per_sqft).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Booking Amount:* ${data.booking_amount ? `AED ${parseFloat(data.booking_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Paid Amount:* ${data.paid_amount ? `AED ${parseFloat(data.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Balance Amount:* ${data.balance_amount ? `AED ${parseFloat(data.balance_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Plot Status:* ${data.plot_status || 'N/A'}`,
      data.remarks ? `*Remarks:* ${data.remarks}` : '',
      `\n*All Documents:*`,
      plotDocuments,
    ].filter(Boolean).join('\n');

    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(details);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  if (isFetchingInfo || (isOpen && carProfileId && isFetchingData)) {
    return (
      <Transition show={isOpen}>
        <Dialog
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        >
          <TransitionChild
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
            onClick={onClose}
          />
          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-dark-700"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                View Plot Detail
              </h2>
            </div>
            <div className="mt-4">
              <Skeleton
                style={{
                  "--sk-color": isDark ? darkColorScheme[700] : lightColorScheme[300],
                }}
              />
            </div>
          </TransitionChild>
        </Dialog>
      </Transition>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Transition show={isOpen}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
      >
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
          onClick={onClose}
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="scrollbar-sm relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-dark-700"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-500">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
              View Car Profile
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Main Fields */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-dark-100">
                  Car Information
                </h3>
                <div className="space-y-3">
                  {fields.map((fieldname) => (
                    <div key={fieldname} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-dark-300">
                        {getFieldLabel(info, fieldname)}
                      </span>
                      <span className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                        {formatFieldValue(data[fieldname])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub Fields */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-dark-100">
                  Additional Information
                </h3>
                <div className="space-y-3">
                  {subFields.map((fieldname) => (
                    <div key={fieldname} className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-dark-300">
                        {getFieldLabel(info, fieldname)}
                      </span>
                      <span className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                        {formatFieldValue(data[fieldname])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-dark-100">
                  All Documents
                </h3>
                <div className="space-y-3">
                  {data?.plot_document?.map((fieldname, index) => {
                    const fileUrl = JWT_HOST_API + fieldname?.file;

                    if (!fileUrl) {
                      return null;
                    }

                    return (
                    <div key={index} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-dark-300 mb-1">
                          {fieldname?.title}
                      </span>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(fileUrl)}
                          className="inline-flex w-max overflow-hidden rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-dark-500 dark:bg-dark-600 dark:hover:bg-dark-500"
                        >
                          <img
                            src={fileUrl}
                            alt={fileUrl}
                            className="h-24 w-24 object-cover"
                          />
                        </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Image preview popup */}
          {previewImage && (
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70"
              onClick={() => setPreviewImage(null)}
            >
              <div
                className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white p-2 dark:bg-dark-700"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={previewImage}
                  alt="Document preview"
                  className="max-h-[80vh] max-w-[80vw] object-contain"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-dark-500">
            <Button
              variant="outlined"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <ShareIcon className="size-4" />
              Share
            </Button>
            <Button
              color="primary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
