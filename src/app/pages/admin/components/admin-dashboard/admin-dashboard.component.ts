import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, RouterLink } from "@angular/router";
import { LoadingComponent } from "../../../../components/loading/loading.component";
import type { AdminCup } from "../../../../models/cup";
import { BackendService } from "../../../../services/backend.service";

const getCurrentYearAndMonth = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;

	return month < 10 ? `${year}-0${month}` : `${year}-${month}`;
};

@Component({
	selector: "app-admin-dashboard",
	standalone: true,
	imports: [FormsModule, RouterLink, MatIconButton, MatIcon, LoadingComponent],
	templateUrl: "./admin-dashboard.component.html",
	styleUrl: "./admin-dashboard.component.css",
})
export class AdminDashboardComponent {
	private readonly backend = inject(BackendService);

	private readonly snackbar = inject(MatSnackBar);
	private readonly router = inject(Router);

	protected yearAndMonth = getCurrentYearAndMonth();

	protected readonly cups = signal<AdminCup[]>([]);

	protected readonly loading = signal(true);

	protected createCup() {
		const [year, month] = this.yearAndMonth.split("-");
		this.loading.set(true);
		this.backend.admin
			.createCup(Number.parseInt(year), Number.parseInt(month))
			.subscribe({
				next: (data) => this.refresh(),
				error: (error) => {
					if (error.status === 401) {
						this.router.navigate(["/login"]);
						return;
					}
					this.snackbar.open(
						"Can't create cup. Does it already exist?",
						undefined,
						{ duration: 3000 },
					);
					console.error(error);
					this.loading.set(false);
				},
			});
	}

	public ngAfterViewInit(): void {
		this.refresh();
	}

	protected refresh() {
		this.loading.set(true);
		this.backend.admin.getAllCups().subscribe({
			next: (data) => {
				this.cups.set(data);
				this.loading.set(false);
			},
			error: (error) => {
				if (error.status === 401) {
					this.router.navigate(["/login"]);
					return;
				}
				this.snackbar.open("Failed to refresh.", undefined, { duration: 3000 });
				console.error(error);
				this.loading.set(false);
			},
		});
	}

	protected getRedirect(id: number) {
		return `/admin/cup/${id}`;
	}

	protected getIconPublic(isPublic: boolean) {
		return isPublic ? "public" : "visibility_off";
	}

	protected getIconCurrent(isCurrent: boolean) {
		return isCurrent ? "star" : "star_border";
	}

	protected delete(cup: AdminCup) {
		const confirmMessage = `Are you sure you want to delete the Cup "${cup.name}"?`;
		if (confirm(confirmMessage)) {
			this.loading.set(true);
			this.backend.admin.deleteCup(cup.id).subscribe({
				next: (_) => this.refresh(),
				error: (error) => {
					if (error.status === 401) {
						this.router.navigate(["/login"]);
						return;
					}
					this.snackbar.open("Failed to delete the cup.", undefined, {
						duration: 3000,
					});
					console.error(error);
					this.loading.set(false);
				},
			});
		}
	}

	protected changeCupVisibility(cup: AdminCup) {
		const newVisibility = cup.public ? "private" : "public";
		const confirmMessage = `Are you sure you want to make the Cup "${cup.name}" ${newVisibility}?`;
		if (confirm(confirmMessage)) {
			this.loading.set(true);
			this.backend.admin.changeCupVisibility(cup.id, !cup.public).subscribe({
				next: (_) => this.refresh(),
				error: (error) => {
					if (error.status === 401) {
						this.router.navigate(["/login"]);
						return;
					}
					this.snackbar.open(
						"Failed to change the visibility of the cup.",
						undefined,
						{ duration: 3000 },
					);
					console.error(error);
					this.loading.set(false);
				},
			});
		}
	}

	protected changeCurrentCup(cup: AdminCup) {
		const confirmMessage = `Are you sure you want to make the Cup "${cup.name}" the new current cup?`;
		if (confirm(confirmMessage)) {
			this.loading.set(true);
			this.backend.admin.setCurrentCup(cup.id).subscribe({
				next: (_) => this.refresh(),
				error: (error) => {
					if (error.status === 401) {
						this.router.navigate(["/login"]);
						return;
					}
					this.snackbar.open("Failed to change the current cup.", undefined, {
						duration: 3000,
					});
					console.error(error);
					this.loading.set(false);
				},
			});
		}
	}

	protected rename(cup: AdminCup) {
		const name = prompt(`New name of cup "${cup.name}"`);
		if (name === null || name === undefined) return;
		this.loading.set(true);
		this.backend.admin.renameCup(cup.id, name).subscribe({
			next: () => this.refresh(),
			error: (error) => {
				if (error.status === 401) {
					this.router.navigate(["/login"]);
					return;
				}
				this.snackbar.open("Failed to rename the cup.", undefined, {
					duration: 3000,
				});
				console.error(error);
				this.loading.set(false);
			},
		});
	}
}
