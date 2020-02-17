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

  private ctxC: CanvasRenderingContext2D;
  private ctxL: CanvasRenderingContext2D;

  private downFlg: boolean = false;
  private resizeFlg: boolean = false;
  private prevX: number = 0;
  private prevY: number = 0;
  private prevOffsetX: number = 0;
  private prevOffsetY: number = 0;
  private newOffsetX: number = 0;
  private newOffsetY: number = 0;

  public offsetX: number = 0;
  public offsetY: number = 0;

  constructor(private dataService: DataService) {}

  onEvent(event: MouseEvent): void {
    if (event.type !== "mouseleave") {
      this.downFlg = event.type === "mousedown" ? true : false;
    } else {
      this.downFlg = false;
    }
    this.prevX = event.type === "mousedown" ? event.clientX : 0;
    this.prevY = event.type === "mousedown" ? event.clientY : 0;
  }

  onMousemove(event: MouseEvent): void {
    if (this.downFlg && !this.resizeFlg) {
      const newOffsetX = event.clientX - this.prevX;
      const newOffsetY = event.clientY - this.prevY;
      this._createLine(newOffsetX);
      this._createColumn(newOffsetY);
      this._showMousePos(event.clientX, event.clientY);
    } else {
      this.resizeFlg = false;
      this.prevOffsetX = this.newOffsetX;
      this.prevOffsetY = this.newOffsetY;
    }

    this._showMousePos(event.clientX, event.clientY);
  }

  ngOnInit() {
    this._createLine(0);
    this._createColumn(0);
    this._elementObserver();
  }

  // https://stackoverflow.com/questions/40659090/element-height-and-width-change-detection-in-angular-2
  _elementObserver(): void {
    const ro = new ResizeObserver(() => {
      this.resizeFlg = true;
      this._createLine(0);
      this._createColumn(0);
    });

    ro.observe(this.wrapper.nativeElement);
  }

  _showMousePos(clientX, clientY) {
    // Line
    if (!this.downFlg) {
      this.ctxL.clearRect(clientX, 0, 3, 20);
      this._createLine(0);
    }
    this.ctxL.beginPath();
    this.ctxL.setLineDash([3, 2]);
    this.ctxL.moveTo(clientX, 0);
    this.ctxL.lineTo(clientX, 20);
    this.ctxL.stroke();
    // Empty box
    this.ctxL.strokeStyle = "#606060";
    this.ctxL.strokeRect(0, 0, 20, 20);
    this.ctxL.fillStyle = "#333333";
    this.ctxL.fillRect(0, 0, 20, 20);

    // Column
    if (!this.downFlg) {
      this.ctxL.clearRect(0, clientY, 3, 20);
      this._createColumn(0);
    }
    this.ctxC.beginPath();
    this.ctxC.setLineDash([3, 2]);
    this.ctxC.moveTo(0, clientY);
    this.ctxC.lineTo(20, clientY);
    this.ctxC.stroke();
    // Empty box
    this.ctxC.strokeStyle = "#606060";
    this.ctxC.strokeRect(0, 0, 20, 20);
    this.ctxC.fillStyle = "#333333";
    this.ctxC.fillRect(0, 0, 20, 20);
  }

  _createLine(newOffsetX: number): void {
    this.ctxL = this.l.nativeElement.getContext("2d");
    const l = this.ctxL.canvas;
    l.width = this.wrapper.nativeElement.clientWidth;
    l.height = 20;

    this.ctxL.translate(0.5, 0.5);
    this.ctxL.clearRect(0, 0, l.width, 20);

    // Frame
    this.ctxL.strokeStyle = "#606060";
    this.ctxL.strokeRect(20, 0, l.width - 20, 20);
    // Frame background color
    this.ctxL.fillStyle = "#333333";
    this.ctxL.fillRect(20, 0, l.width - 20, 20);

    // Parents
    this.ctxL.fillText("0", 20 + 5, 10);
    this.ctxL.font = "bold sans-serif";
    this.ctxL.fillStyle = "#9e9e9e";
    const offsetX = this.prevOffsetX + newOffsetX;
    this.dataService.newOffsetX(offsetX);
    this.newOffsetX = offsetX;
    // Parents - positive
    for (let i = 20 + offsetX; i < l.width; i += 50) {
      this.ctxL.moveTo(i, 0);
      this.ctxL.lineTo(i, 20);
      this.ctxL.fillText(`${i - 20 - offsetX}`, i + 5, 10);
      this.ctxL.strokeStyle = "#606060";
      this.ctxL.lineWidth = 1;
      this.ctxL.stroke();
    }
    // Parents - nagative
    for (let i = 20 + offsetX; i > 0; i -= 50) {
      this.ctxL.moveTo(i, 0);
      this.ctxL.lineTo(i, 20);
      this.ctxL.fillText(`${-(i - 20 - offsetX)}`, i + 5, 10);
      this.ctxL.strokeStyle = "#606060";
      this.ctxL.lineWidth = 1;
      this.ctxL.stroke();
    }

    // Children - positive
    for (let i = 20 + offsetX; i < l.width; i += 10) {
      this.ctxL.moveTo(i, 15);
      this.ctxL.lineTo(i, 20);
      this.ctxL.strokeStyle = "#606060";
      this.ctxL.lineWidth = 1;
      this.ctxL.stroke();
    }
    // Children - negative
    for (let i = 20 + offsetX; i > 0; i -= 10) {
      this.ctxL.moveTo(i, 15);
      this.ctxL.lineTo(i, 20);
      this.ctxL.strokeStyle = "#606060";
      this.ctxL.lineWidth = 1;
      this.ctxL.stroke();
    }

    // Empty box
    this.ctxL.strokeStyle = "#606060";
    this.ctxL.strokeRect(0, 0, 20, 20);
    this.ctxL.fillStyle = "#333333";
    this.ctxL.fillRect(0, 0, 20, 20);
  }

  _createColumn(newOffsetY: number): void {
    this.ctxC = this.c.nativeElement.getContext("2d");
    const c = this.ctxC.canvas;
    c.width = 20;
    c.height = this.wrapper.nativeElement.clientHeight;

    this.ctxC.translate(0.5, 0.5);

    // Frame
    this.ctxC.strokeStyle = "#606060";
    this.ctxC.strokeRect(0, 20, 20, c.height - 20);
    // Frame background color
    this.ctxC.fillStyle = "#333333";
    this.ctxC.fillRect(0, 20, 20, c.height - 20);

    // Parents
    this.ctxC.fillText("0", 5, 20 + 10);
    this.ctxC.font = "bold sans-serif";
    this.ctxC.fillStyle = "#9e9e9e";
    const offsetY = this.prevOffsetY + newOffsetY;
    this.dataService.newOffsetY(offsetY);
    this.newOffsetY = offsetY;
    // Parents - positive
    for (let i = 20 + offsetY; i < c.height; i += 50) {
      this.ctxC.moveTo(0, i);
      this.ctxC.lineTo(20, i);
      this._fillTextLine(this.ctxC, `${i - 20 - offsetY}`, 4, i + 10);
      this.ctxC.strokeStyle = "#606060";
      this.ctxC.lineWidth = 1;
      this.ctxC.stroke();
    }
    // Parents - negative
    for (let i = 20 + offsetY; i > 0; i -= 50) {
      this.ctxC.moveTo(0, i);
      this.ctxC.lineTo(20, i);
      this._fillTextLine(this.ctxC, `${-(i - 20 - offsetY)}`, 4, i + 10);
      this.ctxC.strokeStyle = "#606060";
      this.ctxC.lineWidth = 1;
      this.ctxC.stroke();
    }

    // Children - positive
    for (let i = 20 + offsetY; i < c.height; i += 10) {
      this.ctxC.moveTo(15, i);
      this.ctxC.lineTo(20, i);
      this.ctxC.strokeStyle = "#606060";
      this.ctxC.lineWidth = 1;
      this.ctxC.stroke();
    }
    // Children - nagative
    for (let i = 20 + offsetY; i > 0; i -= 10) {
      this.ctxC.moveTo(15, i);
      this.ctxC.lineTo(20, i);
      this.ctxC.strokeStyle = "#606060";
      this.ctxC.lineWidth = 1;
      this.ctxC.stroke();
    }

    // Empty box
    this.ctxC.strokeStyle = "#606060";
    this.ctxC.strokeRect(0, 0, 20, 20);
    this.ctxC.fillStyle = "#333333";
    this.ctxC.fillRect(0, 0, 20, 20);
  }

  _fillTextLine(ctx, text, x, y): void {
    const textList = text.toString().split("");
    const lineHeight = ctx.measureText("あ").width;
    textList.forEach((text, i) => {
      const resY = y + lineHeight * i - lineHeight * textList.length - 5;
      ctx.fillText(text, x, resY);
    });
  }
}
