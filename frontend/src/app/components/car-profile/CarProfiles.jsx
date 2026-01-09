import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
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
  const filterBy =  customerName ? 'customer' : 'lead';
  const filterValue = filterBy === 'customer' ? customerId : leadId;
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCarProfileId, setSelectedCarProfileId] = useState(null);
  const [selectedCarProfileIndex, setSelectedCarProfileIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carProfileToDelete, setCarProfileToDelete] = useState(null);
  const [carProfileIndexToDelete, setCarProfileIndexToDelete] = useState(null);
  
  // Determine which fields to show based on filter type (memoized to prevent infinite loops)
  const displayFields = useMemo(() => {
    return filterBy === 'customer' 
      ? ["name", "plot_no", "plot_id", "project_layout_name", "location_village", "plot_type", "plot_size", "plot_status", "status"]
      : ["name", "plot_no", "plot_id", "project_layout_name", "location_village", "plot_type", "plot_size", "plot_status", "status"];
  }, [filterBy]);
  
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
      
      // Lead: show only "New" and "Pending" status
      // Customer: show all except "New" and "Pending" status
      if (filterBy === 'lead') {
        // Use "in" operator to show only New and Pending
        filters.push(["status", "in", ["New", "Pending"]]);
      } else if (filterBy === 'customer') {
        // Use multiple "!=" filters (ANDed together) to exclude New and Pending
        filters.push(["status", "!=", "New"]);
        filters.push(["status", "!=", "Pending"]);
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
        updated[selectedCarProfileIndex] = carProfileData;
        setCarProfilesToCreate(updated);
      } else {
        // Adding new profile in create mode
        setCarProfilesToCreate([...carProfilesToCreate, carProfileData]);
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
          <Table>
            <THead>
              <Tr>
                <Th>Plot No</Th>
                <Th>Plot ID</Th>
                <Th>Project / Layout</Th>
                <Th>Location / Village</Th>
                <Th>Plot Type</Th>
                <Th>Plot Size</Th>
                <Th>Plot Status</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {carProfiles.map((profile, index) => (
                <Tr
                  key={isCreateMode ? index : profile.name}
                  className="hover:bg-gray-50 dark:hover:bg-dark-700"
                >
                  <Td>{profile.plot_no || "-"}</Td>
                  <Td>{profile.plot_id || "-"}</Td>
                  <Td>{profile.project_layout_name || "-"}</Td>
                  <Td>{profile.location_village || "-"}</Td>
                  <Td>{profile.plot_type || "-"}</Td>
                  <Td>{profile.plot_size || "-"}</Td>
                  <Td>{profile.plot_status || "-"}</Td>
                  <Td>{profile.status || "-"}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
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
                      {(filterBy === 'lead' || isCreateMode) && (
                        <Button
                          size="sm"
                          variant="outlined"
                          onClick={(e) => handleEdit(e, isCreateMode ? null : profile.name, isCreateMode ? index : null)}
                          className="p-1.5"
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outlined"
                        color="error"
                        onClick={(e) => handleDeleteClick(e, isCreateMode ? null : profile.name, isCreateMode ? index : null)}
                        className="p-1.5"
                        disabled={!isCreateMode && mutationDelete.isPending}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
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

