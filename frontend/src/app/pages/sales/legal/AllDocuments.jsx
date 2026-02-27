import React, { useState } from "react";
import { Button, Card, Table, THead, TBody, Th, Tr, Td, Upload } from "components/ui";
import { PlusIcon, XMarkIcon, CloudArrowUpIcon, PaperClipIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useUpdateData } from "hooks/useApiHook";
import clsx from "clsx";

export default function AllDocuments({ id, data, setValue, refetchData, doctype }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDeleteIndex, setDocToDeleteIndex] = useState(null);
  const [newRecord, setNewRecord] = useState({
    title: "",
    file: ""
  });

  const mutationUpdate = useUpdateData((data) => {
    if (data) {
      if (showAddModal) {
        setShowAddModal(false);
        refetchData();
      }
    }
  });

  const handleAddDocument = () => {
    if (newRecord.file) {
      const currentRecords = data?.all_document || [];
      const updatedRecords = [...currentRecords, {
        ...newRecord,
        idx: currentRecords.length + 1
      }];
      mutationUpdate.mutate({ 
        doctype, 
        body: { 
          id, 
          all_document: updatedRecords
        } 
      });
      setValue("all_document", updatedRecords);
      setNewRecord({
        title: "",
        file: ""
      });
    }
  };

  const handleFileChange = (fileUrl) => {
    setNewRecord({ ...newRecord, file: fileUrl });
  };

  const openDeleteModal = (index) => {
    setDocToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (docToDeleteIndex === null) return;

    const currentRecords = data?.all_document || [];
    if (!currentRecords.length) return;

    const updatedRecords = currentRecords
      .filter((_, i) => i !== docToDeleteIndex)
      .map((record, idx) => ({ ...record, idx: idx + 1 }));

    mutationUpdate.mutate({
      doctype,
      body: {
        id,
        all_document: updatedRecords,
      },
    });
    setValue("all_document", updatedRecords);
    setShowDeleteModal(false);
    setDocToDeleteIndex(null);
  };

  // if (!id) return null;

  return (
    <>
      <div className="col-span-12 lg:col-span-12">
        <Card className="p-4 sm:px-5">
          <div className="mt-5 space-y-5">
            {/* Display Documents */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                All Documents
              </h3>
              <Button
                onClick={() => setShowAddModal(true)}
                color="primary"
                className="flex items-center gap-2"
              >
                <PlusIcon className="size-4" />
                Add New Document
              </Button>
            </div>
            {data?.all_document && data?.all_document?.length > 0 ? (
              <div className="hide-scrollbar overflow-x-auto">
                <Table hoverable className="w-full min-w-[600px] text-left rtl:text-right">
                  <THead>
                    <Tr className="border-y border-transparent border-b-gray-200 dark:border-b-dark-500">
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        #
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        Title
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100">
                        File
                      </Th>
                      <Th className="bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 text-center">
                        Actions
                      </Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {data?.all_document.map((record, index) => (
                      <Tr
                        key={index}
                        className="border-b border-gray-200 dark:border-dark-500"
                      >
                        <Td className="text-gray-700 dark:text-dark-200">
                          {index + 1}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.title || '-'}
                        </Td>
                        <Td className="text-gray-700 dark:text-dark-200">
                          {record.file ? (
                            <a
                              href={record.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                            >
                              <PaperClipIcon className="size-4" />
                              <span className="truncate max-w-xs">View File</span>
                            </a>
                          ) : '-'}
                        </Td>
                        <Td className="text-center">
                          <Button
                            size="sm"
                            variant="outlined"
                            color="error"
                            onClick={() => openDeleteModal(index)}
                            className="p-1.5"
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 dark:text-dark-300">
                  No documents yet. Click &quot;Add New Document&quot; to add one.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Document Modal */}
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
          <div className="scrollbar-sm relative flex w-full max-w-lg flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Add Document
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewRecord({
                    title: "",
                    file: ""
                  });
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                    placeholder="Enter document title..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-400 dark:bg-dark-500 dark:text-dark-50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-dark-100">
                    File <span className="text-red-500">*</span>
                  </label>
                  <Upload onChange={handleFileChange}>
                    {({ onClick, disabled }) => (
                      <Button
                        onClick={onClick}
                        disabled={disabled}
                        unstyled
                        className={clsx(
                          "mt-3 w-full shrink-0 flex-col rounded-lg border-2 border-dashed py-10 border-gray-300 dark:border-dark-450",
                          newRecord.file && "border-primary-500 dark:border-primary-500"
                        )}
                      >
                        <CloudArrowUpIcon className="size-12" />
                        <span className={clsx("pointer-events-none mt-2 text-gray-600 dark:text-dark-200")}>
                          {newRecord.file ? (
                            <span className="text-primary-600 dark:text-primary-400">
                              File uploaded successfully
                            </span>
                          ) : (
                            <>
                              <span className="text-primary-600 dark:text-primary-400">Browse</span>
                              <span> or drop your file here</span>
                            </>
                          )}
                        </span>
                      </Button>
                    )}
                  </Upload>
                  {newRecord.file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-dark-300">
                      <PaperClipIcon className="size-4" />
                      <a
                        href={newRecord.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate"
                      >
                        View uploaded file
                      </a>
                    </div>
                  )}
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
                    title: "",
                    file: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleAddDocument}
                disabled={!newRecord.file}
              >
                Add Document
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Transition>

      {/* Delete Document Confirmation Modal */}
      <Transition appear show={showDeleteModal} as={Dialog} onClose={() => setShowDeleteModal(false)}>
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
          <div className="scrollbar-sm relative flex w-full max-w-md flex-col rounded-lg bg-white transition-opacity duration-300 dark:bg-dark-700">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-500">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-50">
                Delete Document
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocToDeleteIndex(null);
                }}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-dark-100">
                  Are you sure you want to delete this document?
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-300">
                  This action cannot be undone. The file link will be removed from this record.
                </p>
                {docToDeleteIndex !== null && data?.all_document?.[docToDeleteIndex] && (
                  <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs dark:border-dark-500 dark:bg-dark-600">
                    <p className="font-medium text-gray-800 dark:text-dark-50">
                      {data.all_document[docToDeleteIndex].title || "Untitled document"}
                    </p>
                    {data.all_document[docToDeleteIndex].file && (
                      <p className="mt-1 truncate text-gray-500 underline dark:text-dark-200">
                        {data.all_document[docToDeleteIndex].file}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-dark-500">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDocToDeleteIndex(null);
                }}
              >
                Cancel
              </Button>
              <Button
                color="error"
                onClick={handleConfirmDelete}
                disabled={docToDeleteIndex === null}
              >
                Delete
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Transition>
    </>
  );
}
