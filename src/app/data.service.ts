import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private offsetX = new BehaviorSubject(0);
  private offsetY = new BehaviorSubject(0);
  currentOffsetX = this.offsetX.asObservable();
  currentOffsetY = this.offsetY.asObservable();

  constructor() {}

  newOffsetX(message: number) {
    this.offsetX.next(message);
  }

  newOffsetY(message: number) {
    this.offsetY.next(message);
  }
}
