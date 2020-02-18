import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import ResizeObserver from "resize-observer-polyfill";
import { DataService } from "../data.service";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"]
})
export class ContentComponent implements OnInit {
  @ViewChild("text", { static: true }) text: ElementRef;
  @ViewChild("contentWrapper", { static: true }) wrapper: ElementRef;
  @ViewChild("canvasContent", { static: true }) c: ElementRef<
    HTMLCanvasElement
  >;

  private ctx: CanvasRenderingContext2D;

  private scale: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this._createGrid();
    this._elementObserver();
    this.dataService.currentScale.subscribe(message => {
      this.scale = message;
    });
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
    const c = this.ctx.canvas;
    c.width = this.wrapper.nativeElement.clientWidth;
    c.height = this.wrapper.nativeElement.clientHeight;

    this.ctx.translate(0.5, 0.5);
    this.ctx.clearRect(0, 0, c.width, c.height);

    // X-axis positive
    const offsetX: number = this.offsetX;
    const remainX: number = Math.abs(Math.floor(this.offsetX / this.scale));
    const cutoffX: number = offsetX - remainX * this.scale;

    for (let i = cutoffX; i < c.width; i += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, c.height);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    // X-axis negative
    for (let i = cutoffX; i > 0; i -= 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, c.height);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Y-axis positive
    const offsetY: number = this.offsetY;
    const remainY: number = Math.abs(Math.floor(this.offsetY / this.scale));
    const cutoffY: number = offsetY - remainY * this.scale;

    for (let i = cutoffY; i < c.height; i += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(c.width, i);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    // Y-axis negative
    for (let i = cutoffY; i > 0; i -= 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(c.width, i);
      this.ctx.strokeStyle = "#707070";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Set positions
    this.text.nativeElement.style.top = `${20 + offsetY}px`;
    this.text.nativeElement.style.left = `${30 + offsetX}px`;
  }
}
