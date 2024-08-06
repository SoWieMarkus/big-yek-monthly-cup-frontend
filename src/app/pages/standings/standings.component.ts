import {
  Component,
  type OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { LoadingComponent } from "../../components/loading/loading.component";
import type { Cup } from "../../models/cup";
import type { LeaderboardEntry } from "../../models/leaderboard";
import { BackendService } from "../../services/backend.service";

@Component({
  selector: "app-standings",
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: "./standings.component.html",
  styleUrl: "./standings.component.css",
})
export class StandingsComponent implements OnInit {
  private readonly backend = inject(BackendService);

  protected readonly cup = signal<Cup | null>(null);

  protected readonly leaderboard = computed(() => {
    const cup = this.cup();
    if (cup === null) return [];
    return cup.leaderboard.entries;
  });

  protected readonly name = computed(() => {
    const cup = this.cup();
    if (cup === null) return "";
    return cup.name;
  });

  public ngOnInit(): void {
    this.backend.cups.getCurrentCup().subscribe({
      next: (entries) => {
        this.cup.set(entries);
      },
      error: (error) => {
        if (error.status === 404) {
          this.cup.set(null);
          return;
        }
        console.error(error.errors);
      },
    });
  }

  protected getPosition(entry: LeaderboardEntry) {
    if (entry.qualified) return "Qualified";
    return `${entry.position}.`;
  }

  protected getPoints(entry: LeaderboardEntry) {
    if (entry.qualified) return "-";
    return entry.points;
  }
}
