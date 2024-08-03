import { Component, inject, signal } from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
	MatDialogActions,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle,
} from "@angular/material/dialog";
import Papa from "papaparse";
import { BackendService } from "../../../../services/backend.service";

@Component({
	selector: "app-dialog-import-results",
	standalone: true,
	imports: [MatDialogContent, MatDialogActions, MatButton, MatDialogTitle],
	templateUrl: "./dialog-import-results.component.html",
	styleUrl: "./dialog-import-results.component.css",
})
export class DialogImportResultsComponent {
	protected readonly dialogRef = inject(
		MatDialogRef<DialogImportResultsComponent>,
	);
	protected readonly content = signal<string[]>([]);
	private readonly backend = inject(BackendService);

	protected async onChange(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement)) {
			throw new Error("Target is not of type HTMLInputElement!");
		}

		const files = target.files;
		if (files === null || files === undefined) return;
		this.import(files);
	}

	protected onDragOver(event: DragEvent) {
		event.stopPropagation();
		event.preventDefault();

		const dataTransfer = event.dataTransfer;
		if (dataTransfer === null || dataTransfer === undefined) return;
		dataTransfer.dropEffect = "copy";
	}

	protected async onDrop(event: DragEvent) {
		event.stopPropagation();
		event.preventDefault();

		const dataTransfer = event.dataTransfer;
		if (dataTransfer === null || dataTransfer === undefined) return;

		const files = dataTransfer.files;
		this.import(files);
	}

	public import(files: FileList) {
		const file = files[0];
		if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
			alert("Only .csv files are allowed.");
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const target = event.target;

			if (target === null) {
				console.error("Error reading file");
				return;
			}

			const csv = target.result;
			if (typeof csv !== "string") {
				console.error("Error reading file");
				return;
			}

			Papa.parse<string>(csv, {
				dynamicTyping: true,
				complete: (result) => {
					if (result.errors.length > 0) {
						for (const error of result.errors) {
							console.error(error);
						}
					}
					this.content.set(result.data);
				},
			});
		};

		reader.onerror = () => {
			console.error("Error reading file");
		};

		reader.readAsText(file);
	}

	protected onCancel() {
		this.dialogRef.close(null);
	}

	protected onUpload() {
		this.dialogRef.close(this.content());
	}
}
