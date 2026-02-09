// Import Dependencies
import { useNavigate } from "react-router";
import {
  PencilIcon,
  PrinterIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCallback, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import { useDeleteData } from "hooks/useApiHook";
// ----------------------------------------------------------------------

export function RowActions({ row, table, isPrint, showPrint = false, showOnlyPrint = false }) {
  const navigate = useNavigate();
  const doctype = table.options.doctype
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const mutation = useDeleteData((data) => {
    if (data && data.success) {
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    } else {
      setConfirmDeleteLoading(false);
    }
  });

  const confirmMessages = {
    pending: {
      description:
        `Are you sure you want to delete this ${doctype}? Once deleted, it cannot be restored.`,
    },
    success: {
      title: `${doctype} Deleted`,
    },
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRows = useCallback(() => {
    setConfirmDeleteLoading(true);
    mutation.mutate({ doctype, ids: [row.original.id] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  const handlePrint = () => {
    window.open(`/printview?doctype=${doctype}&name=${row.original.id}&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en`, "_blank");
  };

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex justify-center gap-1">
        {showOnlyPrint ? (
          <Button
            variant="flat"
            isIcon
            className="size-7 rounded-full"
            onClick={handlePrint}
            title="Print"
          >
            <PrinterIcon className="size-4.5 stroke-1 text-yellow-600" />
          </Button>
        ) : (
          <>
            <Button
              variant="flat"
              isIcon
              className="size-7 rounded-full"
              onClick={() => navigate(`edit/${row.original.id}`)}
              title="Edit"
            >
              <PencilIcon className="size-4.5 stroke-1 text-green-600" />
            </Button>
            {showPrint && (
              <Button
                variant="flat"
                isIcon
                className="size-7 rounded-full"
                onClick={handlePrint}
                title="Print"
              >
                <PrinterIcon className="size-4.5 stroke-1 text-yellow-600" />
              </Button>
            )}
            <Button
              variant="flat"
              isIcon
              className={clsx(
                "size-7 rounded-full text-this dark:text-this-light",
                "hover:bg-this/10 dark:hover:bg-this-light/10",
              )}
              onClick={openModal}
              title="Delete"
            >
              <TrashIcon className="size-4.5 stroke-1 text-red-600" />
            </Button>
          </>
        )}
      </div>

      {!showOnlyPrint && (
        <ConfirmModal
          show={deleteModalOpen}
          onClose={closeModal}
          messages={confirmMessages}
          onOk={handleDeleteRows}
          confirmLoading={confirmDeleteLoading}
          state={state}
        />
      )}
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
  isPrint: PropTypes.bool,
  showPrint: PropTypes.bool,
  showOnlyPrint: PropTypes.bool,
};
