import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import ResizeObserver from "resize-observer-polyfill";
import { DataService } from "../data.service";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"]
})
export class ContentComponent implements OnInit {
  @ViewChild("contentWrapper", { static: true }) wrapper: ElementRef;
  @ViewChild("canvasContent", { static: true }) c: ElementRef<
    HTMLCanvasElement
  >;

  private ctx: CanvasRenderingContext2D;

  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this._createGrid();
    this._elementObserver();
    this.dataService.currentOffsetX.subscribe(message => {
      this.offsetX = message;
      this._createGrid();
    });
    this.dataService.currentOffsetY.subscribe(message => {
      this.offsetY = message;
      this._createGrid();
    });
  }

  // https://stackoverflow.com/questions/40659090/element-height-and-width-change-detection-in-angular-2
  _elementObserver(): void {
    const ro = new ResizeObserver(() => {
      this._createGrid();
    });

    ro.observe(this.wrapper.nativeElement);
  }

  _createGrid(): void {
    this.ctx = this.c.nativeElement.getContext("2d");
    const l = this.ctx.canvas;
    l.width = this.wrapper.nativeElement.clientWidth;
    l.height = this.wrapper.nativeElement.clientHeight;

    this.ctx.translate(0.5, 0.5);
    this.ctx.clearRect(0, 0, l.width, l.height);

    // X-axis positive
    for (let i = this.offsetX; i < l.width; i += 10) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, l.height);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    // X-axis negative
    for (let i = this.offsetX; i > 0; i -= 10) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, l.height);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Y-axis positive
    for (let i = this.offsetY; i < l.height; i += 10) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(l.width, i);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    // Y-axis negative
    for (let i = this.offsetY; i > 0; i -= 10) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(l.width, i);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }
}
