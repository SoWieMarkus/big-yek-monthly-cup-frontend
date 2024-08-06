import { Component, computed, inject, signal } from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { CsvValidatorService, type Row } from "../../../../services/csv-validator.service";
import { CdkDrag, type CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: "app-dialog-import-results",
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatButton, MatDialogTitle, CdkDrag, CdkDropList],
  templateUrl: "./dialog-import-results.component.html",
  styleUrl: "./dialog-import-results.component.css",
})
export class DialogImportResultsComponent {
  protected readonly dialogRef = inject(
    MatDialogRef<DialogImportResultsComponent>,
  );
  protected readonly content = signal<Row[]>([]);
  protected readonly firstRows = computed(() => {
    const content = this.content();
    return content.slice(0, 5);
  });
  protected readonly rest = computed(() => {
    const content = this.content();
    return content.slice(5);
  })
  private readonly csvValidator = inject(CsvValidatorService);

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

  protected drop(event: CdkDragDrop<Row>): void {
    if (event.previousIndex < 5 && event.currentIndex < 5) {
      const content = this.content();
      const updatedContent = [...content];
      moveItemInArray(updatedContent, event.previousIndex, event.currentIndex);

      let position = 1;
      for (const entry of updatedContent.slice(0, 5)) {
        entry[0] = position;
        position++;
      }

      this.content.set(updatedContent); // Set the new state
    }
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

      this.csvValidator.validate(csv)
        .then(data => this.content.set(data))
        .catch(error => console.error(error))
    }

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
