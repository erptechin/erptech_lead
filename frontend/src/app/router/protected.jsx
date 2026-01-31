// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            }
          ],
        },
        {
          path: "sales",
          children: [
            {
              index: true,
              element: <Navigate to="/sales/customers" />,
            },
            {
              path: "customers",
              lazy: async () => ({
                Component: (await import("app/pages/sales/customers"))
                  .default,
              }),
            },
            {
              path: "customers/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/customers/form"))
                  .default,
              }),
            },
            {
              path: "customers/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/customers/form"))
                  .default,
              }),
            },
            {
              path: "legal",
              lazy: async () => ({
                Component: (await import("app/pages/sales/legal"))
                  .default,
              }),
            },
            {
              path: "legal/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/legal/form"))
                  .default,
              }),
            },
            {
              path: "legal/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/legal/form"))
                  .default,
              }),
            },
            {
              path: "legal-plot",
              lazy: async () => ({
                Component: (await import("app/pages/sales/legal_plot"))
                  .default,
              }),
            },
            {
              path: "legal-plot/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/legal_plot/form"))
                  .default,
              }),
            },
            {
              path: "legal-plot/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/legal_plot/form"))
                  .default,
              }),
            },
            {
              path: "approval",
              lazy: async () => ({
                Component: (await import("app/pages/sales/approval"))
                  .default,
              }),
            },
            {
              path: "approval/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/approval/form"))
                  .default,
              }),
            },
            {
              path: "approval/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/approval/form"))
                  .default,
              }),
            },
            {
              path: "sales-manager",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-manager"))
                  .default,
              }),
            },
            {
              path: "sales-manager/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-manager/form"))
                  .default,
              }),
            },
            {
              path: "sales-manager/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-manager/form"))
                  .default,
              }),
            },
            {
              path: "sales-agent",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-agent"))
                  .default,
              }),
            },
            {
              path: "sales-agent/add-new",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-agent/form"))
                  .default,
              }),
            },
            {
              path: "sales-agent/edit/:id",
              lazy: async () => ({
                Component: (await import("app/pages/sales/sales-agent/form"))
                  .default,
              }),
            },

          ]
        }
      ]
    },
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
            {
              path: "sessions",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Sessions")
                ).default,
              }),
            }
          ],
        },
      ],
    },
  ]
};

export { protectedRoutes };
