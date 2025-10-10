"use client";

import React, { useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import { ChartConfiguration } from "chart.js";

// plugin for donut center text
export const doughnutCenterText = {
  id: "doughnutCenterText",
  afterDraw(chart: any, _args: any, opts?: { text?: string }) {
    if (!opts?.text) return;

    const meta = chart.getDatasetMeta(0);
    const arc = meta?.data?.[0];
    if (!arc) return;

    const centerX = arc.x;
    const centerY = arc.y;
    const inner = arc.innerRadius as number;

    const [main, sub] = String(opts.text).split("\n");

    const ctx = chart.ctx;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // sizes tied to inner radius (clamped so they never blow up)
    const mainSize = Math.max(14, Math.round(inner * 0.45));
    const subSize  = Math.max(10, Math.round(inner * 0.22));

    ctx.fillStyle = "#374151";
    ctx.font = `600 ${mainSize}px Inter`;
    ctx.fillText(main, centerX, sub ? centerY - inner * 0.15 : centerY);

    if (sub) {
      ctx.fillStyle = "#6B7280";
      ctx.font = `500 ${subSize}px Inter`;
      ctx.fillText(sub, centerX, centerY + inner * 0.22);
    }

    ctx.restore();
  },
};


type Props = {
  config: ChartConfiguration;
  height?: number;
};

export default function BaseChart({ config, height = 256 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // global defaults similar to your HTML
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.font.family = "Inter";
    Chart.defaults.plugins.legend.display = false;

    // register plugin once
    if (!Chart.registry.plugins.get("doughnutCenterText")) {
      Chart.register(doughnutCenterText);
    }

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current!, config);

    return () => chartRef.current?.destroy();
  }, [config]);

  return (
    <div style={{ height }} className="relative w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
