import {
	Component,
	type OnInit,
	computed,
	inject,
	signal,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import type { AdminCupDetails } from "../../../../models/cup";
import { BackendService } from "../../../../services/backend.service";
import { DialogImportResultsComponent } from "../dialog-import-results/dialog-import-results.component";

@Component({
	selector: "app-admin-cup",
	standalone: true,
	imports: [MatIcon, RouterLink],
	templateUrl: "./admin-cup.component.html",
	styleUrl: "./admin-cup.component.css",
})
export class AdminCupComponent implements OnInit {
	private readonly backend = inject(BackendService);
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);
	private readonly dialog = inject(MatDialog);
	private readonly snackbar = inject(MatSnackBar);

	protected readonly cup = signal<null | AdminCupDetails>(null);
	protected readonly qualifier = computed(() => {
		const cup = this.cup();
		if (cup === null) return [];
		return cup.qualifier;
	});
	protected readonly header = computed(() => {
		const cup = this.cup();
		if (cup === null) return "";
		return cup.name;
	});

	public ngOnInit(): void {
		this.refresh();
	}

	protected openUploadDialog(qualifierId: number) {
		this.dialog
			.open(DialogImportResultsComponent)
			.afterClosed()
			.subscribe((data) => {
				if (data === null || data === undefined) return;
				this.backend.admin.uploadResults(qualifierId, data).subscribe({
					next: (data) => {
						this.refresh();
					},
					error: (error) => {
						if (error.status === 401) {
							this.router.navigate(["/login"]);
							return;
						}
						this.snackbar.open(
							"Illegal Format. Please contact SoWieMarkus.",
							undefined,
							{ duration: 5000 },
						);
						console.error(error);
					},
				});
			});
	}

	protected clear(qualifierId: number) {
		this.backend.admin.clearResults(qualifierId).subscribe({
			next: (data) => {
				this.refresh();
			},
			error: (error) => {
				if (error.status === 401) {
					this.router.navigate(["/login"]);
					return;
				}
				this.snackbar.open(
					`Failed to clear the Results of Qualifier ${qualifierId}`,
					undefined,
					{ duration: 5000 },
				);
				console.error(error);
			},
		});
	}

	protected refresh() {
		const cupId = this.route.snapshot.paramMap.get("id");
		if (cupId === null) {
			this.router.navigate(["/admin"]);
			return;
		}
		const id = Number.parseInt(cupId);
		this.backend.admin.getCupDetails(id).subscribe({
			next: (data) => this.cup.set(data),
			error: (error) => {
				if (error.status === 401) {
					this.router.navigate(["/login"]);
					return;
				}
				console.error(error);
				this.snackbar.open(`Failed to refresh.`, undefined, { duration: 5000 });
			},
		});
	}

	protected getColorByAmount(results: number) {
		return results > 0 ? "green" : "red";
	}
}
