import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import ResizeObserver from "resize-observer-polyfill";
import { DataService } from "../data.service";

@Component({
  selector: "app-ng-ruler",
  templateUrl: "./ng-ruler.component.html",
  styleUrls: ["./ng-ruler.component.scss"]
})
export class NgRulerComponent implements OnInit {
  @ViewChild("canvasWrapper", { static: true }) wrapper: ElementRef;
  @ViewChild("canvasC", { static: true }) c: ElementRef<HTMLCanvasElement>;
  @ViewChild("canvasL", { static: true }) l: ElementRef<HTMLCanvasElement>;

  private rulerThickness: number = 25; // Thickness of the window ruler
  private parentScale: number = 50; // Parent scale of the window ruler
  private childScale: number = 10; // Child scale of the window ruler
  private rulerColor: string = "#333333"; // Background color of the window ruler
  private scaleColor: string = "#606060"; // Color of the scale of the window ruler
  private numColor: string = "#9e9e9e"; // Color of the number printed in the window ruler
  private borderColor: string = "#606060"; // Border color of the window ruler
  private fontType: string = "bold sans-serif"; // Font of the window ruler

  private ctxC: CanvasRenderingContext2D;
  private ctxL: CanvasRenderingContext2D;

  private downFlg: boolean = false;
  private prevX: number = 0;
  private prevY: number = 0;
  private prevOffsetX: number = 0;
  private prevOffsetY: number = 0;
  private newOffsetX: number = 0;
  private newOffsetY: number = 0;

  constructor(private dataService: DataService) {}

  onEvents($event: any): void {
    const isTouchDevice: boolean = !!$event.touches;
    const event: any = isTouchDevice ? $event.touches[0] : $event;
    const eventType: string = isTouchDevice ? "touchstart" : "mousedown";
    if (isTouchDevice) $event.preventDefault();

    if ($event.type !== "mouseleave") {
      this.downFlg = $event.type === eventType ? true : false;
    } else {
      this.downFlg = false;
    }

    if (
      $event.type === "mouseup" ||
      $event.type == "touchend" ||
      !this.downFlg
    ) {
      this.prevOffsetX = this.newOffsetX;
      this.prevOffsetY = this.newOffsetY;
    }

    this.prevX = $event.type === eventType ? event.clientX : 0;
    this.prevY = $event.type === eventType ? event.clientY : 0;
  }

  onMoveEvent($event: any): void {
    const isTouchDevice: boolean = !!$event.touches;
    const event: any = isTouchDevice ? $event.touches[0] : $event;
    if (isTouchDevice) $event.preventDefault();

    if (this.downFlg) {
      const newOffsetX: number = event.clientX - this.prevX;
      const newOffsetY: number = event.clientY - this.prevY;
      this._createLine(newOffsetX);
      this._createColumn(newOffsetY);
      this._showMousePos(event.clientX, event.clientY);
    }

    this._showMousePos(event.clientX, event.clientY);
  }

  ngOnInit() {
    this._init();

    this._createLine(0);
    this._createColumn(0);
    this._elementObserver();
  }

  _init() {
    this.dataService.newScale(this.parentScale);
  }

  // https://stackoverflow.com/questions/40659090/element-height-and-width-change-detection-in-angular-2
  _elementObserver(): void {
    const ro: any = new ResizeObserver(() => {
      this._createLine(0);
      this._createColumn(0);
    });

    ro.observe(this.wrapper.nativeElement);
  }

  _showMousePos(clientX, clientY): void {
    // Line
    if (!this.downFlg) {
      this.ctxL.clearRect(clientX, 0, 3, this.rulerThickness);
      this._createLine(0);
    }
    this.ctxL.beginPath();
    this.ctxL.setLineDash([3, 2]);
    this.ctxL.moveTo(clientX, 0);
    this.ctxL.lineTo(clientX, this.rulerThickness);
    this.ctxL.stroke();
    // Empty box
    this.ctxL.beginPath();
    this.ctxL.strokeStyle = this.borderColor;
    this.ctxL.setLineDash([]);
    this.ctxL.strokeRect(0, 0, this.rulerThickness, this.rulerThickness);
    this.ctxL.fillStyle = this.rulerColor;
    this.ctxL.fillRect(0, 0, this.rulerThickness, this.rulerThickness);
    this.ctxL.stroke();

    // Column
    if (!this.downFlg) {
      this.ctxL.clearRect(0, clientY, 3, this.rulerThickness);
      this._createColumn(0);
    }
    this.ctxC.beginPath();
    this.ctxC.setLineDash([3, 2]);
    this.ctxC.moveTo(0, clientY);
    this.ctxC.lineTo(this.rulerThickness, clientY);
    this.ctxC.stroke();
    // Empty box
    this.ctxC.beginPath();
    this.ctxC.strokeStyle = this.borderColor;
    this.ctxC.setLineDash([]);
    this.ctxC.strokeRect(0, 0, this.rulerThickness, this.rulerThickness);
    this.ctxC.fillStyle = this.rulerColor;
    this.ctxC.fillRect(0, 0, this.rulerThickness, this.rulerThickness);
    this.ctxC.stroke();
  }

  _createLine(newOffsetX: number): void {
    this.ctxL = this.l.nativeElement.getContext("2d");
    const l: any = this.ctxL.canvas;
    l.width = this.wrapper.nativeElement.clientWidth;
    l.height = this.rulerThickness;
    const offsetX: number = this.prevOffsetX + newOffsetX;

    this.ctxL.translate(0.5, 0.5);
    this.ctxL.clearRect(0, 0, l.width, l.height);

    // Frame
    this.ctxL.beginPath();
    this.ctxL.strokeStyle = this.borderColor;
    this.ctxL.strokeRect(l.height, 0, l.width - l.height, l.height);
    this.ctxL.fillStyle = this.rulerColor;
    this.ctxL.fillRect(l.height, 0, l.width - l.height, l.height);
    this.ctxL.stroke();

    this.dataService.newOffsetX(offsetX);
    this.newOffsetX = offsetX;

    // Parents - positive
    const offset: number = l.height + offsetX;
    const remain: number = Math.abs(Math.floor(offsetX / this.parentScale));
    const cutoff: number = offset - remain * this.parentScale;
    let scaleCount: number = 0;

    for (let i = cutoff; i < l.width; i += this.parentScale) {
      this.ctxL.beginPath();
      this.ctxL.moveTo(i, 0);
      this.ctxL.lineTo(i, l.height);
      this.ctxL.fillText(
        `${Math.abs((remain - scaleCount) * this.parentScale)}`,
        i + 5,
        10
      );
      this.ctxL.strokeStyle = this.scaleColor;
      this.ctxL.lineWidth = 1;
      this.ctxL.font = this.fontType;
      this.ctxL.fillStyle = this.numColor;
      this.ctxL.stroke();

      scaleCount++;
    }
    // // Parents - nagative
    scaleCount = 0;
    for (let i = cutoff; i > 0; i -= this.parentScale) {
      this.ctxL.beginPath();
      this.ctxL.moveTo(i, 0);
      this.ctxL.lineTo(i, l.height);
      this.ctxL.fillText(
        `${Math.abs((remain - scaleCount) * this.parentScale)}`,
        i + 5,
        10
      );
      this.ctxL.strokeStyle = this.scaleColor;
      this.ctxL.lineWidth = 1;
      this.ctxL.font = this.fontType;
      this.ctxL.fillStyle = this.numColor;
      this.ctxL.stroke();

      scaleCount++;
    }

    // Children - positive
    for (let i = cutoff; i < l.width; i += this.parentScale / this.childScale) {
      this.ctxL.beginPath();
      this.ctxL.moveTo(i, 15);
      this.ctxL.lineTo(i, l.height);
      this.ctxL.strokeStyle = this.scaleColor;
      this.ctxL.lineWidth = 1;
      this.ctxL.stroke();
    }
    // // Children - negative
    for (let i = cutoff; i > 0; i -= this.parentScale / this.childScale) {
      this.ctxL.beginPath();
      this.ctxL.moveTo(i, 15);
      this.ctxL.lineTo(i, l.height);
      this.ctxL.strokeStyle = this.scaleColor;
      this.ctxL.lineWidth = 1;
      this.ctxL.stroke();
    }

    // Empty box
    this.ctxL.beginPath();
    this.ctxL.strokeStyle = this.borderColor;
    this.ctxL.strokeRect(0, 0, l.height, l.height);
    this.ctxL.fillStyle = this.rulerColor;
    this.ctxL.fillRect(0, 0, l.height, l.height);
    this.ctxL.stroke();
  }

  _createColumn(newOffsetY: number): void {
    this.ctxC = this.c.nativeElement.getContext("2d");
    const c: any = this.ctxC.canvas;
    c.width = this.rulerThickness;
    c.height = this.wrapper.nativeElement.clientHeight;
    const offsetY: number = this.prevOffsetY + newOffsetY;

    this.ctxC.translate(0.5, 0.5);
    this.ctxL.clearRect(0, 0, c.width, c.height);

    // Frame
    this.ctxC.beginPath();
    this.ctxC.strokeStyle = this.borderColor;
    this.ctxC.strokeRect(0, c.width, c.width, c.height - c.width);
    this.ctxC.fillStyle = this.rulerColor;
    this.ctxC.fillRect(0, c.width, c.width, c.height - c.width);
    this.ctxC.stroke();

    this.dataService.newOffsetY(offsetY);
    this.newOffsetY = offsetY;

    // Parents - positive
    const offset: number = c.width + offsetY;
    const remain: number = Math.abs(Math.floor(offsetY / this.parentScale));
    const cutoff: number = offset - remain * this.parentScale;
    let scaleCount: number = 0;

    for (let i = cutoff; i < c.height; i += this.parentScale) {
      this.ctxC.beginPath();
      this.ctxC.moveTo(0, i);
      this.ctxC.lineTo(c.width, i);
      this._fillTextLine(
        this.ctxC,
        `${Math.abs((remain - scaleCount) * this.parentScale)}`,
        4,
        i + 10
      );
      this.ctxC.strokeStyle = this.scaleColor;
      this.ctxC.lineWidth = 1;
      this.ctxC.font = this.fontType;
      this.ctxC.fillStyle = this.numColor;
      this.ctxC.stroke();

      scaleCount++;
    }
    // Parents - negative
    scaleCount = 0;
    for (let i = cutoff; i > 0; i -= this.parentScale) {
      this.ctxC.beginPath();
      this.ctxC.moveTo(0, i);
      this.ctxC.lineTo(c.width, i);
      this._fillTextLine(
        this.ctxC,
        `${Math.abs((remain - scaleCount) * this.parentScale)}`,
        4,
        i + 10
      );
      this.ctxC.strokeStyle = this.scaleColor;
      this.ctxC.lineWidth = 1;
      this.ctxC.font = this.fontType;
      this.ctxC.fillStyle = this.numColor;
      this.ctxC.stroke();

      scaleCount++;
    }

    // Children - positive
    for (
      let i = cutoff;
      i < c.height;
      i += this.parentScale / this.childScale
    ) {
      this.ctxC.beginPath();
      this.ctxC.moveTo(15, i);
      this.ctxC.lineTo(c.width, i);
      this.ctxC.strokeStyle = this.scaleColor;
      this.ctxC.lineWidth = 1;
      this.ctxC.stroke();
    }
    // Children - nagative
    for (let i = cutoff; i > 0; i -= this.parentScale / this.childScale) {
      this.ctxC.beginPath();
      this.ctxC.moveTo(15, i);
      this.ctxC.lineTo(c.width, i);
      this.ctxC.strokeStyle = this.scaleColor;
      this.ctxC.lineWidth = 1;
      this.ctxC.stroke();
    }

    // Empty box
    this.ctxC.beginPath();
    this.ctxC.strokeStyle = this.borderColor;
    this.ctxC.strokeRect(0, 0, c.width, c.width);
    this.ctxC.fillStyle = this.rulerColor;
    this.ctxC.fillRect(0, 0, c.width, c.width);
    this.ctxC.stroke();
  }

  _fillTextLine(ctx, text, x, y): void {
    const textList: Array<String> = text.toString().split("");
    const lineHeight: number = ctx.measureText("あ").width;
    textList.forEach((text, i) => {
      const resY: number =
        y + lineHeight * i - lineHeight * textList.length - 5;
      ctx.fillText(text, x, resY);
    });
  }
}
