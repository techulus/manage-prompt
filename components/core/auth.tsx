import useColorScheme from "@/hooks/useColorScheme";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const ThemedOrgSwitcher = () => {
  const appearance = useColorScheme();

  return (
    <OrganizationSwitcher
      appearance={appearance === "dark" ? { baseTheme: dark } : {}}
      afterSwitchOrganizationUrl="/console/workflows"
    />
  );
};

export const ThemedUserButton = () => {
  const appearance = useColorScheme();

  return (
    <UserButton appearance={appearance === "dark" ? { baseTheme: dark } : {}} />
  );
};
