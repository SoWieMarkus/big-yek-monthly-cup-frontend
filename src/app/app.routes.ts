import type { Routes } from "@angular/router";
import { AuthGuard } from "./auth.guard";
import { AdminComponent } from "./pages/admin/admin.component";
import { AdminCupComponent } from "./pages/admin/components/admin-cup/admin-cup.component";
import { AdminDashboardComponent } from "./pages/admin/components/admin-dashboard/admin-dashboard.component";
import { LoginComponent } from "./pages/login/login.component";
import { StandingsComponent } from "./pages/standings/standings.component";
import { PrivacyPolicyComponent } from "./pages/privacy-policy/privacy-policy.component";

export const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    title: "BYMC: Admin Panel",
    canActivate: [AuthGuard],
    children: [
      {
        path: "dashboard",
        component: AdminDashboardComponent,
      },
      {
        path: "cup/:id",
        component: AdminCupComponent,
      },
    ],
  },
  {
    path: "standings",
    component: StandingsComponent,
  },
  {
    path: "login",
    component: LoginComponent,
    title: "BYMC: Login",
  },
  {
    path: "privacy-policy",
    component: PrivacyPolicyComponent,
    title: "BYMC: Privacy Policy"
  },
  {
    path: "",
    redirectTo: "/standings",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "/standings",
    pathMatch: "full",
  },
];
