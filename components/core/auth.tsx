import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const appearance = "dark";

export const ThemedOrgSwitcher = () => {
  return (
    <OrganizationSwitcher
      appearance={appearance === "dark" ? { baseTheme: dark } : {}}
      afterSwitchOrganizationUrl="/console/workflows"
    />
  );
};

export const ThemedUserButton = () => {
  return (
    <UserButton appearance={appearance === "dark" ? { baseTheme: dark } : {}} />
  );
};
