// Local Imports
import { Avatar, Card } from "components/ui";
import { useState, useEffect } from "react";
import { useInfo, useFeachData } from "hooks/useApiHook";
// ----------------------------------------------------------------------

const doctype = "Sales Invoice"
const fields = ['posting_date', 'custom_site', 'total', 'grand_total']

export function RecentPayments() {

  const [lists, setLists] = useState([]);

  const { data: info } = useInfo({ doctype, fields: JSON.stringify(fields) });
  const [search, setSearch] = useState({ doctype, page: 1, page_length: 10, fields: null });
  const { data } = useFeachData(search);

  useEffect(() => {
    if (info?.fields) {
      const fieldnames = info?.fields.map(field => field.fieldname);
      setSearch({ ...search, fields: JSON.stringify([...fieldnames, "name"]) })
    }
  }, [info])

  useEffect(() => {
    if (data?.data) {
      setLists(data?.data)
    }
  }, [data])

  return (
    <Card className="px-4 pb-4 sm:px-5">
      <div className="flex h-14 min-w-0 items-center justify-between py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Recent Payments
        </h2>
      </div>
      <div className="space-y-3.5">
        {lists.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <Avatar
                size={10}
                name={payment.name}
                initialColor="auto"
                src={payment.custom_site}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 dark:text-dark-100">
                  {payment.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-dark-300">
                  {payment.custom_site}
                </span>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-dark-100">
              {payment.total}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
