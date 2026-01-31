import DualFormsIcon from 'assets/dualicons/forms.svg?react'
import UserIcon from 'assets/nav-icons/user.svg?react'
import PeopleMonitorIcon from 'assets/nav-icons/people-monitor.svg?react'
import MegaphoneIcon from 'assets/nav-icons/megaphone.svg?react'
import OrderTimerIcon from 'assets/nav-icons/order-timer.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_MASTERS = '/sales'

const path = (root, item) => `${root}${item}`;

// Get salesPurchaseType from localStorage
const getSalesPurchaseType = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('salesPurchaseType') || 'sales';
    }
    return 'sales';
};

const salesPurchaseType = getSalesPurchaseType();

// Define all possible child items
const allChilds = [
    {
        id: 'sales.customers',
        path: path(ROOT_MASTERS, salesPurchaseType == "sales" ? '/customers' : salesPurchaseType == "legal" ? '/legal' : '/customers'),
        type: NAV_TYPE_ITEM,
        title: 'Customers',
        transKey: salesPurchaseType === 'sales' ? 'nav.sales.customers' : salesPurchaseType == "legal" ? 'nav.sales.legal' : 'nav.sales.land-owners',
        Icon: MegaphoneIcon,
    },
    {
        id: 'sales.legal-plot',
        path: path(ROOT_MASTERS, '/legal-plot'),
        type: NAV_TYPE_ITEM,
        title: 'Legal Plot',
        transKey: 'nav.sales.legal-plot',
        Icon: MegaphoneIcon,
    },
    {
        id: 'sales.approval',
        path: path(ROOT_MASTERS, '/approval'),
        type: NAV_TYPE_ITEM,
        title: 'Sales Order',
        transKey: 'nav.sales.approval',
        Icon: OrderTimerIcon,
    },
    {
        id: 'sales.sales-agent',
        path: path(ROOT_MASTERS, '/sales-agent'),
        type: NAV_TYPE_ITEM,
        title: 'Sales Agent',
        transKey: 'nav.sales.sales-agent',
        Icon: UserIcon,
    },
];

// Filter childs based on salesPurchaseType
// If salesPurchaseType == "legal", show Legal + Legal Plot only; else show all except Legal Plot
const filteredChilds = salesPurchaseType === 'legal'
    ? allChilds.filter(child => child.id === 'sales.customers' || child.id === 'sales.legal-plot')
    : allChilds.filter(child => child.id !== 'sales.legal-plot');

export const sales = {
    id: 'sales',
    type: NAV_TYPE_ROOT,
    path: '/sales',
    title: 'Sales',
    transKey: 'nav.sales.sales',
    Icon: DualFormsIcon,
    childs: filteredChilds
}
