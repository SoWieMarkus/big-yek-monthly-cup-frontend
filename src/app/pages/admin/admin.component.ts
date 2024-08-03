import { Component, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { JwtService } from "../../services/jwt.service";

@Component({
	selector: "app-admin",
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: "./admin.component.html",
	styleUrl: "./admin.component.css",
})
export class AdminComponent {
	private readonly jwt = inject(JwtService);
	private readonly router = inject(Router);

	protected logout() {
		this.jwt.removeToken();
	}

	protected toStandings() {
		this.router.navigate(["/standings"]);
	}
}
