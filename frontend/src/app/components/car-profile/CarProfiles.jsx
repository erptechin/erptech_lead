import React, { useState, useEffect, useMemo } from "react";
import { Button, Card } from "components/ui";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useFeachData, useDeleteData } from "hooks/useApiHook";
import CarProfileModal from './CarProfileModal';
import CarProfileViewModal from './CarProfileViewModal';
import { ConfirmModal } from "components/shared/ConfirmModal";

export default function CarProfiles({
  customerId,
  customerName,
  leadId,
  leadName,
  isCreateMode = false,
  carProfilesToCreate = [],
  setCarProfilesToCreate = null
}) {
  // Determine filter type and value
  const filterBy = customerName ? 'customer' : 'lead';
  const filterValue = filterBy === 'customer' ? customerId : leadId;

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCarProfileId, setSelectedCarProfileId] = useState(null);
  const [selectedCarProfileIndex, setSelectedCarProfileIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carProfileToDelete, setCarProfileToDelete] = useState(null);
  const [carProfileIndexToDelete, setCarProfileIndexToDelete] = useState(null);

  // All fields from plot_detail.json organized by sections
  const displayFields1 = useMemo(() => {
    return [
      "name",
      "lead",
      "lead_status",
      // Basic Plot Details
      "plot_no",
      "plot_id",
      "project_layout_name",
      "location_village",
      "survey_no",
      "plot_type",
      "plot_size",
      "length",
      "width",
      "facing"
    ];
  }, []);

  const displayFields2 = useMemo(() => {
    return [
      // Ownership & Legal
      "owner_name",
      "document_no",
      "registration_date",
      "patta_khata_no",
      "approval_authority",
      "legal_status"
    ];
  }, []);

  const displayFields3 = useMemo(() => {
    return [
      // Financial Details
      "rate_per_sqft",
      "total_plot_value",
      "booking_amount",
      "paid_amount",
      "balance_amount",
      "payment_mode",
      "payment_date",
      "agent_reference_name"
    ];
  }, []);

  const displayFields4 = useMemo(() => {
    return [
      // Status Tracking
      "plot_status",
      "booking_date",
      "sale_date",
      "handover_date",
      "remarks"
    ];
  }, []);

  // Combine all fields for API calls
  const displayFields = useMemo(() => {
    return [...displayFields1, ...displayFields2, ...displayFields3, ...displayFields4];
  }, [displayFields1, displayFields2, displayFields3, displayFields4]);

  const [search, setSearch] = useState({
    doctype: "Plot Detail",
    page: 1,
    page_length: 10,
    fields: isCreateMode ? null : JSON.stringify(displayFields),
    filters: null
  });

  const { data, isFetching: isLoading, refetch } = useFeachData(search);
  const [carProfiles, setCarProfiles] = useState([]);

  // Update search when filter value becomes available (only if not in create mode)
  useEffect(() => {
    if (!isCreateMode && filterValue) {
      // Build filters based on context
      const filters = [[filterBy, "=", filterValue]];

      // Lead: show only "New" and "Pending" lead_status
      // Customer: show all except "New" and "Pending" lead_status
      if (filterBy === 'lead') {
        // Use "in" operator to show only New and Pending
        filters.push(["lead_status", "in", ["New", "Pending"]]);
      } else if (filterBy === 'customer') {
        // Use multiple "!=" filters (ANDed together) to exclude New and Pending
        filters.push(["lead_status", "!=", "New"]);
        filters.push(["lead_status", "!=", "Pending"]);
      }

      const fieldsString = JSON.stringify(displayFields);
      const filtersString = JSON.stringify(filters);

      setSearch(prev => {
        // Only update if something actually changed to prevent infinite loops
        if (prev.filters === filtersString && prev.fields === fieldsString) {
          return prev;
        }
        return {
          ...prev,
          filters: filtersString,
          fields: fieldsString
        };
      });
    }
  }, [filterValue, filterBy, isCreateMode, displayFields]);

  // Use carProfilesToCreate in create mode, otherwise use fetched data
  useEffect(() => {
    if (isCreateMode) {
      // In create mode, use carProfilesToCreate prop
      setCarProfiles(carProfilesToCreate || []);
    } else {
      // In normal mode, use fetched data
      if (data?.data) {
        setCarProfiles(data.data);
      } else {
        setCarProfiles([]);
      }
    }
  }, [isCreateMode, carProfilesToCreate, data?.data]);

  const handleAddNew = () => {
    setSelectedCarProfileId(null);
    setSelectedCarProfileIndex(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCarProfileId(null);
    setSelectedCarProfileIndex(null);
  };

  const handleViewModalClose = () => {
    setShowViewModal(false);
    setSelectedCarProfileId(null);
    setSelectedCarProfileIndex(null);
  };

  const handleSuccess = (carProfileData) => {
    if (isCreateMode && setCarProfilesToCreate) {
      // In create mode, add to local state
      if (selectedCarProfileIndex !== null) {
        // Editing existing profile in create mode
        const updated = [...carProfilesToCreate];
        updated[selectedCarProfileIndex] = { ...carProfileData, lead_status: "New" };
        setCarProfilesToCreate(updated);
      } else {
        // Adding new profile in create mode
        setCarProfilesToCreate([...carProfilesToCreate, { ...carProfileData, lead_status: "New" }]);
      }
    } else {
      // In normal mode, refetch from API
      refetch();
    }
    handleModalClose();
  };

  const mutationDelete = useDeleteData((data) => {
    if (data && data.success) {
      setShowDeleteModal(false);
      setCarProfileToDelete(null);
      refetch();
    }
  });

  const handleEdit = (e, carProfileId, index = null) => {
    e.stopPropagation(); // Prevent row click
    setSelectedCarProfileId(carProfileId);
    setSelectedCarProfileIndex(index);
    setShowModal(true);
  };

  const handleView = (e, carProfileId) => {
    e.stopPropagation(); // Prevent row click
    setSelectedCarProfileId(carProfileId);
    setShowViewModal(true);
  };

  const handleDeleteClick = (e, carProfileId, index = null) => {
    e.stopPropagation(); // Prevent row click
    setCarProfileToDelete(carProfileId);
    setCarProfileIndexToDelete(index);
    setShowDeleteModal(true);
  };

  const handleShare = (e, profile) => {
    e.stopPropagation(); // Prevent row click

    // Format plot details for WhatsApp
    const details = [
      `*Plot Details*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `*Plot No:* ${profile.plot_no || 'N/A'}`,
      `*Plot ID:* ${profile.plot_id || 'N/A'}`,
      `*Project/Layout:* ${profile.project_layout_name || 'N/A'}`,
      `*Location:* ${profile.location_village || 'N/A'}`,
      `*Plot Size:* ${profile.plot_size || 'N/A'}`,
      `*Plot Type:* ${profile.plot_type || 'N/A'}`,
      `*Facing:* ${profile.facing || 'N/A'}`,
      `*Total Value:* ${profile.total_plot_value ? `AED ${parseFloat(profile.total_plot_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Rate per Sqft:* ${profile.rate_per_sqft ? `AED ${parseFloat(profile.rate_per_sqft).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Booking Amount:* ${profile.booking_amount ? `AED ${parseFloat(profile.booking_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Paid Amount:* ${profile.paid_amount ? `AED ${parseFloat(profile.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Balance Amount:* ${profile.balance_amount ? `AED ${parseFloat(profile.balance_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}`,
      `*Plot Status:* ${profile.plot_status || 'N/A'}`,
      `*Lead Status:* ${profile.lead_status || 'N/A'}`,
      profile.remarks ? `*Remarks:* ${profile.remarks}` : '',
    ].filter(Boolean).join('\n');

    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(details);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  const handleConfirmDelete = () => {
    if (isCreateMode && setCarProfilesToCreate && carProfileIndexToDelete !== null) {
      // In create mode, remove from local state
      const updated = carProfilesToCreate.filter((_, index) => index !== carProfileIndexToDelete);
      setCarProfilesToCreate(updated);
      setShowDeleteModal(false);
      setCarProfileToDelete(null);
      setCarProfileIndexToDelete(null);
    } else if (carProfileToDelete) {
      // In normal mode, delete via API
      mutationDelete.mutate({
        doctype: "Plot Detail",
        ids: [carProfileToDelete]
      });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCarProfileToDelete(null);
  };

  return (
    <Card className="p-4 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-50">
          Plot Details
        </h3>
        {(filterBy === 'lead' || isCreateMode) && (
          <Button
            size="sm"
            color="primary"
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <PlusIcon className="size-4" />
            Add Plot Detail
          </Button>
        )}
      </div>

      {!isCreateMode && !filterValue ? (
        <div className="py-4 text-center text-sm text-gray-500">
          Loading information...
        </div>
      ) : !isCreateMode && isLoading ? (
        <div className="py-4 text-center text-sm text-gray-500">
          Loading plot details...
        </div>
      ) : carProfiles.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-dark-300">
          {isCreateMode
            ? 'No plot details added yet. Please add at least one plot detail before creating the lead.'
            : `No plot details found ${filterBy === 'customer' ? 'for this customer' : 'for this lead'}.`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Plot No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Plot ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Project/Layout</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Plot Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Total Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Plot Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Lead Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-dark-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-200">
              {[...carProfiles].reverse().map((profile, reversedIndex) => {
                const originalIndex = carProfiles.length - 1 - reversedIndex;
                return (
                  <tr
                    key={isCreateMode ? originalIndex : profile.name}
                    className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.plot_no || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.plot_id || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.project_layout_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.location_village || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.plot_size || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.total_plot_value ? `AED ${parseFloat(profile.total_plot_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.plot_status || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">
                      {profile.lead_status || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCreateMode && (
                          <Button
                            size="sm"
                            variant="outlined"
                            onClick={(e) => handleView(e, profile.name)}
                            className="p-1.5"
                          >
                            <EyeIcon className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={(e) => handleShare(e, profile)}
                          className="p-1.5"
                          title="Share on WhatsApp"
                        >
                          <ShareIcon className="size-4" />
                        </Button>
                        {(filterBy === 'lead' || isCreateMode) && (
                          <Button
                            size="sm"
                            variant="outlined"
                            onClick={(e) => handleEdit(e, isCreateMode ? null : profile.name, isCreateMode ? originalIndex : null)}
                            className="p-1.5"
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outlined"
                          color="error"
                          onClick={(e) => handleDeleteClick(e, isCreateMode ? null : profile.name, isCreateMode ? originalIndex : null)}
                          className="p-1.5"
                          disabled={!isCreateMode && mutationDelete.isPending}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Car Profile Edit/Add Modal */}
      <CarProfileModal
        isOpen={showModal}
        onClose={handleModalClose}
        carProfileId={selectedCarProfileId}
        carProfileData={isCreateMode && selectedCarProfileIndex !== null ? carProfilesToCreate[selectedCarProfileIndex] : null}
        customerId={customerId}
        customerName={customerName}
        leadId={leadId}
        leadName={leadName}
        isCreateMode={isCreateMode}
        onSuccess={handleSuccess}
      />

      {/* Car Profile View Modal */}
      <CarProfileViewModal
        isOpen={showViewModal}
        onClose={handleViewModalClose}
        carProfileId={selectedCarProfileId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={handleCancelDelete}
        onOk={handleConfirmDelete}
        confirmLoading={mutationDelete.isPending}
        state={mutationDelete.isError ? "error" : "pending"}
        messages={{
          pending: {
            title: "Delete Plot Detail?",
            description: "Are you sure you want to delete this plot detail? This action cannot be undone.",
            actionText: "Delete"
          }
        }}
      />
    </Card>
  );
}

