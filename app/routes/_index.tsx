import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Typography } from "~/ui/Typography";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/ui/navigation-menu";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
      <div className="p-4 border-b-border border-b w-full flex justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/upload">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Upload
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/create">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Create
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link to="/login" className={navigationMenuTriggerStyle()}>
          Login
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Typography variant="h1" className="mt-12">
            Kifu.io
          </Typography>
        </div>
      </div>
    </>
  );
}
