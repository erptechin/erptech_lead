// Local Imports
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

// Import Dependencies
import DashboardCheck from "assets/illustrations/dashboard-check.svg?react";
import { Button, Checkbox, Input, InputErrorMsg, Radio } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";

// ----------------------------------------------------------------------

export default function SignIn() {
  const {
    primaryColorScheme: primary,
    lightColorScheme: light,
    darkColorScheme: dark,
    isDark,
  } = useThemeContext();

  const { login, errorMessage, isLoading } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Radio button state for sales/purchase
  const [selectedType, setSelectedType] = useState(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem("salesPurchaseType");
    return stored || "sales";
  });

  // Save to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem("salesPurchaseType", selectedType);
  }, [selectedType]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const onSubmit = (data) => {
    login({
      usr: data.username,
      pwd: data.password
    });
  };

  return (
    <main className="min-h-100vh flex">
      <div className="fixed top-0 hidden p-6 lg:block lg:px-12">
        <div className="flex items-center gap-2">
          <img src={"/assets/erptech_lead/images/logo.png"} alt="" className="w-30" />
        </div>
      </div>
      <div className="hidden w-full place-items-center lg:grid">
        <div className="w-full max-w-lg p-6">
          <DashboardCheck
            style={{
              "--primary": primary[500],
              "--dark-500": isDark ? dark[500] : light[200],
              "--dark-600": isDark ? dark[600] : light[100],
              "--dark-700": isDark ? dark[700] : light[300],
              "--dark-450": isDark ? dark[450] : light[400],
              "--dark-800": isDark ? dark[800] : light[400],
            }}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex w-full flex-col items-center ltr:border-l rtl:border-r border-gray-150 bg-white dark:border-transparent dark:bg-dark-700 lg:max-w-md">
        <div className="flex w-full max-w-sm grow flex-col justify-center p-5">
          <div className="text-center">
            <img src={"/assets/erptech_lead/images/logo.png"} alt="" className="w-30 mx-auto lg:hidden" />
            <div className="mt-4 lg:mt-0">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Welcome Back
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Please sign in to continue
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter Username"
                prefix={
                  <EnvelopeIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
                {...register("username")}
                error={errors?.username?.message}
              />
              <Input
                label="Password"
                placeholder="Enter Password"
                type="password"
                prefix={
                  <LockClosedIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
                {...register("password")}
                error={errors?.password?.message}
              />

              <div className="space-y-2">
                <div className="flex gap-4">
                  <Radio
                    name="salesPurchaseType"
                    value="sales"
                    checked={selectedType === "sales"}
                    onChange={handleTypeChange}
                    label="Sales"
                  />
                  <Radio
                    name="salesPurchaseType"
                    value="purchase"
                    checked={selectedType === "purchase"}
                    onChange={handleTypeChange}
                    label="Purchase"
                  />
                  <Radio
                    name="salesPurchaseType"
                    value="legal"
                    checked={selectedType === "legal"}
                    onChange={handleTypeChange}
                    label="Legal"
                  />
                </div>
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={errorMessage && errorMessage?.message !== ""}
                >
                  {errorMessage?.message}
                </InputErrorMsg>
              </div>

              {/* <div className="flex items-center justify-between space-x-2">
                <Checkbox label="Remember me" />
                <Link
                  className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                  to="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div> */}
            </div>
            <Button
              type="submit"
              color="primary"
              className="mt-2 h-10 w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-xs-plus">
            <p className="line-clamp-1">
              <span>Dont have Account?</span>{" "}
              <Link
                className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                to="/sign-up"
              >
                Create account
              </Link>
            </p>
          </div>


        </div>

        <div className="mb-3 mt-5 flex justify-center text-xs text-gray-400 dark:text-dark-300">
          <a href="https://erptech.in/privacy-policy">Privacy Notice</a>
          <div className="mx-2.5 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
          <a href="https://erptech.in/terms">Term of service</a>
        </div>
      </div>
    </main>
  );
}
