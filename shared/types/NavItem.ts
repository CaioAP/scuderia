import type { RouteRecordName } from "vue-router";

export interface NavItem {
  icon: string;
  name: string;
  to: RouteRecordName;
}
