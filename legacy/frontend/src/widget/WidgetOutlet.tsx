// Copyright © 2024 Navarrotech

import { Outlet } from "react-router";
import { Topbar } from "./Topbar";

export function WidgetOutlet(){
  return <>
    <Topbar />
    <Outlet />
  </>
}
