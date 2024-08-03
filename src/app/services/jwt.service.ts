// jwt.service.ts
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
	providedIn: "root",
})
export class JwtService {
	private readonly router = inject(Router);

	public getToken(): string | null {
		return localStorage.getItem("token");
	}

	public setToken(token: string): void {
		localStorage.setItem("token", token);
	}

	public removeToken(): void {
		localStorage.removeItem("token");
		this.router.navigate(["/login"]);
	}

	public isTokenExpired(): boolean {
		const token = this.getToken();
		if (!token) {
			return true;
		}

		const expiry = this.getTokenExpiry(token);
		return expiry ? expiry < Date.now() / 1000 : false;
	}

	private getTokenExpiry(token: string): number | null {
		try {
			const decodedToken = JSON.parse(atob(token.split(".")[1]));
			return decodedToken.exp || null;
		} catch (e) {
			return null;
		}
	}
}
