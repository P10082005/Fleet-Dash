import { useEffect, useRef } from "react";
import type { Telemetry, MapBounds } from "../types/telemetry";

interface CanvasMapProps {
  telemetry: Telemetry;
  bounds: MapBounds;
}

export function CanvasMap({ telemetry, bounds }: CanvasMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define drawMap function BEFORE useEffect
  function drawMap(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    telemetry: Telemetry,
    bounds: MapBounds
  ) {
    const { minLatitude, maxLatitude, minLongitude, maxLongitude } = bounds;
    const { latitude, longitude, heading, speed, vehicleId } = telemetry;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map background (Google Maps style - light beige)
    ctx.fillStyle = "#f1f3f4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw map features
    drawMapFeatures(ctx, canvas);

    // Draw roads
    drawRoads(ctx, canvas);

    // Draw geofence
    ctx.strokeStyle = "#1a73e8";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
    ctx.setLineDash([]);

    // Convert coordinates to canvas position
    const x =
      ((longitude - minLongitude) / (maxLongitude - minLongitude)) *
      (canvas.width - 200) +
      100;
    const y =
      ((maxLatitude - latitude) / (maxLatitude - minLatitude)) *
      (canvas.height - 200) +
      100;

    // Draw vehicle marker
    drawVehicleMarker(ctx, x, y, heading, vehicleId, speed, latitude, longitude);

    // Draw map controls
    drawMapControls(ctx, canvas);

    // Draw scale bar
    drawScaleBar(ctx, canvas);
  }

  function drawMapFeatures(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Draw parks (green areas)
    ctx.fillStyle = "#c7e7b5";
    ctx.fillRect(100, 100, 150, 120);
    ctx.fillRect(canvas.width - 200, 150, 180, 140);
    ctx.fillRect(200, canvas.height - 180, 160, 130);

    // Draw water bodies (blue areas)
    ctx.fillStyle = "#aadaff";
    ctx.beginPath();
    ctx.ellipse(canvas.width - 150, canvas.height - 100, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw buildings (gray blocks)
    ctx.fillStyle = "#d3d3d3";
    ctx.fillRect(300, 200, 80, 60);
    ctx.fillRect(450, 180, 100, 80);
    ctx.fillRect(250, 350, 90, 70);
    ctx.fillRect(550, 300, 110, 90);
  }

  function drawRoads(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Highways (yellow/orange)
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";

    // Horizontal highway
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Vertical highway
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Main roads (white)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;

    for (let i = 0; i <= 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 6; i++) {
      const x = (canvas.width / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Secondary roads (light gray)
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 4;

    for (let i = 0; i <= 8; i++) {
      const y = (canvas.height / 8) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 12; i++) {
      const x = (canvas.width / 12) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  function drawVehicleMarker(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    heading: number,
    vehicleId: string,
    speed: number,
    latitude: number,
    longitude: number
  ) {
    // Drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(x + 6, y + 6, 30, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marker circle (Google Maps blue)
    const gradient = ctx.createRadialGradient(x - 10, y - 10, 5, x, y, 35);
    gradient.addColorStop(0, "#4285f4");
    gradient.addColorStop(1, "#1a73e8");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    // White border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Outer ring
    ctx.strokeStyle = "#1a73e8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.stroke();

    // Pulsing effect rings
    ctx.strokeStyle = "rgba(26, 115, 232, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(26, 115, 232, 0.15)";
    ctx.beginPath();
    ctx.arc(x, y, 58, 0, Math.PI * 2);
    ctx.stroke();

    // Heading arrow
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((heading * Math.PI) / 180);

    // Arrow
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(-15, -20);
    ctx.lineTo(15, -20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Info card
    const cardX = x - 110;
    const cardY = y + 55;
    const cardWidth = 220;
    const cardHeight = 100;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(cardX + 4, cardY + 4, cardWidth, cardHeight);

    // Card background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

    // Card border
    ctx.strokeStyle = "#dadce0";
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

    // Card header
    ctx.fillStyle = "#1a73e8";
    ctx.fillRect(cardX, cardY, cardWidth, 35);

    // Vehicle ID
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(vehicleId, x, cardY + 24);

    // Speed
    ctx.fillStyle = "#3c4043";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Speed: ${speed} km/h`, cardX + 15, cardY + 60);

    // Coordinates
    ctx.fillStyle = "#5f6368";
    ctx.font = "12px Arial";
    ctx.fillText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, cardX + 15, cardY + 80);

    // Heading
    ctx.fillStyle = "#5f6368";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Heading: ${heading}°`, cardX + cardWidth - 15, cardY + 80);
  }

  function drawMapControls(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Zoom controls (top right)
    const controlX = canvas.width - 60;
    const controlY = 20;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(controlX, controlY, 44, 80);

    // Border
    ctx.strokeStyle = "#dadce0";
    ctx.lineWidth = 1;
    ctx.strokeRect(controlX, controlY, 44, 80);

    // Plus button
    ctx.fillStyle = "#3c4043";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("+", controlX + 22, controlY + 35);

    // Separator
    ctx.strokeStyle = "#dadce0";
    ctx.beginPath();
    ctx.moveTo(controlX, controlY + 40);
    ctx.lineTo(controlX + 44, controlY + 40);
    ctx.stroke();

    // Minus button
    ctx.fillStyle = "#3c4043";
    ctx.font = "bold 24px Arial";
    ctx.fillText("−", controlX + 22, controlY + 75);

    // My Location button (bottom right)
    const locBtnX = canvas.width - 60;
    const locBtnY = canvas.height - 140;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(locBtnX, locBtnY, 44, 44);
    ctx.strokeStyle = "#dadce0";
    ctx.strokeRect(locBtnX, locBtnY, 44, 44);

    // Location icon
    ctx.fillStyle = "#4285f4";
    ctx.beginPath();
    ctx.arc(locBtnX + 22, locBtnY + 22, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(locBtnX + 22, locBtnY + 22, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawScaleBar(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const x = 20;
    const y = canvas.height - 30;

    // Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(x, y - 20, 140, 40);

    // Border
    ctx.strokeStyle = "#dadce0";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 20, 140, 40);

    // Scale line
    ctx.strokeStyle = "#3c4043";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 130, y);
    ctx.stroke();

    // Ticks
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 8);
    ctx.lineTo(x + 10, y + 8);
    ctx.moveTo(x + 130, y - 8);
    ctx.lineTo(x + 130, y + 8);
    ctx.stroke();

    // Label
    ctx.fillStyle = "#3c4043";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("5 km", x + 70, y + 18);
  }

  // Now useEffect can call drawMap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawMap(ctx, canvas, telemetry, bounds);
  }, [telemetry, bounds]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={550}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        borderRadius: "8px"
      }}
    />
  );
}