import { useState, useEffect } from "react";
import { DataTable } from "app/components/listing/DataTable";
import { useInfo, useFeachData } from "hooks/useApiHook";

const doctype = "Lead";
const fields = ['lead_name', 'custom_lead_status', 'custom_next_follow_up_date', 'custom_assigned_user', 'source', 'email', 'mobile_no'];

export default function ListData() {
  const getPageName = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const salesPurchaseType = localStorage.getItem('salesPurchaseType') || 'sales';
      return salesPurchaseType === 'sales' ? 'Customer' : 'Land Owner';
    }
    return 'Land Owner';
  };

  const pageName = getPageName();
  const [orders, setOrders] = useState([]);

  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 10, fields: null, filters: JSON.stringify([["custom_lead_type", "=", pageName === 'Customer' ? 'sales' : 'purchase']]) });
  const { data } = useFeachData(search);

  useEffect(() => {
    if (info?.fields) {
      const fieldnames = info?.fields.map(field => field.fieldname);
      setSearch(prev => ({ ...prev, fields: JSON.stringify([...fieldnames, "name"]) }));
    }
  }, [info]);

  useEffect(() => {
    if (data?.data) {
      setOrders(data?.data);
    }
  }, [data]);

  const handleDeleteRow = (row) => {
    setOrders((old) =>
      old.filter((oldRow) => oldRow.order_id !== row.original.order_id),
    );
  };

  const handleDeleteRows = (rows) => {
    const rowIds = rows.map((row) => row.original.order_id);
    setOrders((old) => old.filter((row) => !rowIds.includes(row.order_id)));
  };

  return (
    <DataTable
      pageName={pageName}
      doctype={doctype}
      fields={fields}
      addNewRoute="add-new"
      storageKey="customers"
      data={orders}
      info={info}
      search={search}
      setSearch={setSearch}
      onDeleteRow={handleDeleteRow}
      onDeleteRows={handleDeleteRows}
    />
  );
}

