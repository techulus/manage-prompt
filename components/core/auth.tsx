import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const ThemedOrgSwitcher = ({ appearance }) => {
  return (
    <OrganizationSwitcher
      appearance={appearance === "dark" ? { baseTheme: dark } : {}}
      afterSwitchOrganizationUrl="/console/workflows"
    />
  );
};

export const ThemedUserButton = ({ appearance }) => {
  return (
    <UserButton appearance={appearance === "dark" ? { baseTheme: dark } : {}} />
  );
};
