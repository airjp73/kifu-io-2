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
      <div className="p-4 border-b-border border-b flex items-center">
        <Typography variant="largeText" className="mr-8 text-primary">
          Kifu.io
        </Typography>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link to="/upload">Upload</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link to="/create">Create</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link
          to="/login"
          className={navigationMenuTriggerStyle({ className: "ml-auto" })}
        >
          Login
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Typography variant="h1" className="mt-12">
            Welcome to Kifu.io
          </Typography>
        </div>
      </div>
    </>
  );
}
