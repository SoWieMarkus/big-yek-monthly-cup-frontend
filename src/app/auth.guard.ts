import { Injectable, inject } from "@angular/core";
import {
	type ActivatedRouteSnapshot,
	type CanActivateFn,
	Router,
	type RouterStateSnapshot,
} from "@angular/router";
import { JwtService } from "./services/jwt.service";

@Injectable({
	providedIn: "root",
})
class PermissionsService {
	private readonly router = inject(Router);
	private readonly jwt = inject(JwtService);

	constructor() {}

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): boolean {
		if (this.jwt.isTokenExpired()) {
			this.router.navigate(["/login"]);
			return false;
		}
		return true;
	}
}

export const AuthGuard: CanActivateFn = (
	next: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
): boolean => {
	return inject(PermissionsService).canActivate(next, state);
};
