import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { BackendService } from "../../services/backend.service";
import { JwtService } from "../../services/jwt.service";

@Component({
	selector: "app-login",
	standalone: true,
	imports: [FormsModule],
	templateUrl: "./login.component.html",
	styleUrl: "./login.component.css",
})
export class LoginComponent {
	private readonly backend = inject(BackendService);
	private readonly jwt = inject(JwtService);
	private readonly router = inject(Router);

	protected username = "";
	protected password = "";

	protected login(event: Event) {
		event.preventDefault();
		console.log(this.username, this.password);
		this.backend.authentication.login(this.username, this.password).subscribe({
			next: (data) => {
				this.jwt.setToken(data.token);
				this.router.navigate(["/admin/dashboard"]);
			},
			error: (error) => {
				this.password = "";
				console.error(error);
			},
		});
	}
}
