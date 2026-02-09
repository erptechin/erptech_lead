import React, { useState } from "react";
import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useUpdateData } from "hooks/useApiHook";

export default function FollowUpHistory({ id, data, setValue, refetchData, doctype }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    followup_date: new Date().toISOString().split("T")[0],
    followup_type: "",
    followup_with: "",
    contact_number: "",
    purpose: "",
    followup_status: "Pending",
    remarks: "",
    next_followup_date: "",
    action_required: "No"
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      if (showAddModal) {
        setShowAddModal(false);
        refetchData();
      }
    }
  });

  const handleAddFollowUp = () => {
    if (newRecord.followup_date && newRecord.followup_type && newRecord.followup_status) {
      const currentRecords = data?.all_followup || [];
      const updatedRecords = [...currentRecords, {
        ...newRecord,
        idx: currentRecords.length + 1
      }];
      mutationUpdate.mutate({ 
        doctype, 
        body: { 
          id, 
          all_followup: updatedRecords
        } 
      });
      setValue("all_followup", updatedRecords);
      setNewRecord({
        followup_date: new Date().toISOString().split("T")[0],
        followup_type: "",
        followup_with: "",
        contact_number: "",
        purpose: "",
        followup_status: "Pending",
        remarks: "",
        next_followup_date: "",
        action_required: "No"
      });
    }
  };

  if (!id) return null;

  return (
    <>
      <div className="col-span-12 lg:col-span-12">
        <Card className="p-4 sm:px-5">
          <div className="mt-5 space-y-5">
            {/* Display Follow-up History Records */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Follow-up History Records
              </h3>
              <Button
                onClick={() => setShowAddModal(true)}
                color="primary"
                className="flex items-center gap-2"
              >
                <PlusIcon className="size-4" />
                Add New Record
              </Button>
            </div>
            {data?.all_followup && data?.all_followup?.length > 0 ? (
              <div className="hide-scrollbar overflow-x-auto">
                <Table hoverable className="w-full min-w-[800px] text-left rtl:text-right">
                  <THead>
                    <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        #
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Follow-Up Date
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Type
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Follow-Up With
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Contact Number
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Purpose
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Status
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Next Follow-Up Date
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Remarks
                      </Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {data?.all_followup.map((record, index) => (
                      <Tr
                        key={index}
                        className="border-b border-gray-200 dark:border-dark-500"
                      >
                        <Td className="text-gray-700 dark:text-dark-200">
                          {index + 1}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.followup_date
                            ? new Date(record.followup_date).toLocaleDateString()
                            : '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.followup_type || '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.followup_with || '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.contact_number || '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.purpose || '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.followup_status || '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.next_followup_date
                            ? new Date(record.next_followup_date).toLocaleDateString()
                            : '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.remarks || '-'}
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 dark:text-dark-300">
                  No follow-up records yet. Click &quot;Add New Record&quot; to add one.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Follow-up History Modal */}
      <Transition appear show={showAddModal} as={Dialog} onClose={() => setShowAddModal(false)}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        >
          <div className="scrollbar-sm relative flex w-full max-w-2xl flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Add Follow-up History
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Follow-Up Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newRecord.followup_date}
                    onChange={(e) => setNewRecord({ ...newRecord, followup_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Follow-Up Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRecord.followup_type}
                    onChange={(e) => setNewRecord({ ...newRecord, followup_type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Office Visit">Office Visit</option>
                    <option value="Court Visit">Court Visit</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Follow-Up With (Name)
                  </label>
                  <input
                    type="text"
                    value={newRecord.followup_with}
                    onChange={(e) => setNewRecord({ ...newRecord, followup_with: e.target.value })}
                    placeholder="Enter name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={newRecord.contact_number}
                    onChange={(e) => setNewRecord({ ...newRecord, contact_number: e.target.value })}
                    placeholder="Enter contact number"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Purpose of Follow-Up
                  </label>
                  <textarea
                    value={newRecord.purpose}
                    onChange={(e) => setNewRecord({ ...newRecord, purpose: e.target.value })}
                    placeholder="Enter purpose..."
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Follow-Up Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRecord.followup_status}
                    onChange={(e) => setNewRecord({ ...newRecord, followup_status: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={newRecord.next_followup_date}
                    onChange={(e) => setNewRecord({ ...newRecord, next_followup_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Action Required
                  </label>
                  <select
                    value={newRecord.action_required}
                    onChange={(e) => setNewRecord({ ...newRecord, action_required: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Remarks / Notes
                  </label>
                  <textarea
                    value={newRecord.remarks}
                    onChange={(e) => setNewRecord({ ...newRecord, remarks: e.target.value })}
                    placeholder="Enter remarks..."
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddModal(false);
                  setNewRecord({
                    followup_date: new Date().toISOString().split("T")[0],
                    followup_type: "",
                    followup_with: "",
                    contact_number: "",
                    purpose: "",
                    followup_status: "Pending",
                    remarks: "",
                    next_followup_date: "",
                    action_required: "No"
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleAddFollowUp}
                disabled={!newRecord.followup_date || !newRecord.followup_type || !newRecord.followup_status}
              >
                Add Record
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Transition>
    </>
  );
}
