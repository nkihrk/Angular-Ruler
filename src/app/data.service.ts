import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private scale = new BehaviorSubject(0);
  private offsetX = new BehaviorSubject(0);
  private offsetY = new BehaviorSubject(0);

  currentScale = this.scale.asObservable();
  currentOffsetX = this.offsetX.asObservable();
  currentOffsetY = this.offsetY.asObservable();

  constructor() {}

  newScale(message: number) {
    this.scale.next(message);
  }

  newOffsetX(message: number) {
    this.offsetX.next(message);
  }

  newOffsetY(message: number) {
    this.offsetY.next(message);
  }
}
