import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useThemeColors } from "../hooks/useThemeColors";

/**
 * ConfusionMatrixTab — D3 heatmap visualization of the confusion matrix.
 * Dashboard design system: glass panel, design-token colors, IBM Plex Sans.
 */
export default function ConfusionMatrixTab({ metrics }) {
  const chartRef = useRef(null);
  const colors = useThemeColors();

  useEffect(() => {
    if (!metrics?.confusion_matrix || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    const cm = metrics.confusion_matrix;
    const labels = ["\u226450K", ">50K"];
    const margin = { top: 50, right: 30, bottom: 70, left: 80 };
    const size = 280;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${size + margin.left + margin.right} ${size + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img")
      .attr("aria-label", "Confusion matrix heatmap")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand().domain(labels).range([0, size]).padding(0.1);
    const y = d3.scaleBand().domain(labels).range([0, size]).padding(0.1);

    const maxVal = Math.max(...cm.flat());
    const baseBg = colors.theme === "dark" ? "#18181b" : "#e4e4e7";
    const colorScale = d3
      .scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolateRgbBasis([baseBg, "#0a4a8a", "#0C5CAB", "#10b981"]));

    // Cells
    const cellData = [];
    cm.forEach((row, i) => {
      row.forEach((val, j) => {
        cellData.push({ actual: labels[i], predicted: labels[j], value: val });
      });
    });

    svg
      .selectAll("rect")
      .data(cellData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.predicted))
      .attr("y", (d) => y(d.actual))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("rx", 8)
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", colors.theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")
      .attr("stroke-width", 1)
      .style("opacity", 0)
      .transition()
      .duration(600)
      .delay((_d, i) => i * 150)
      .style("opacity", 1);

    // Cell values — always white since they sit on colored cells
    svg
      .selectAll("text.cell")
      .data(cellData)
      .enter()
      .append("text")
      .attr("class", "cell")
      .attr("x", (d) => x(d.predicted) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.actual) + y.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#fff")
      .attr("font-size", "20px")
      .attr("font-weight", "800")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .text((d) => d.value.toLocaleString())
      .style("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .style("opacity", 1);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${size + 5})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("fill", colors.textMuted)
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .attr("font-family", "IBM Plex Sans, sans-serif");

    svg
      .append("text")
      .attr("x", size / 2)
      .attr("y", size + 48)
      .attr("text-anchor", "middle")
      .attr("fill", colors.textMuted)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .attr("letter-spacing", "0.05em")
      .text("PREDICTED");

    // Y axis
    svg
      .append("g")
      .attr("transform", "translate(-5, 0)")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("fill", colors.textMuted)
      .attr("font-size", "13px")
      .attr("font-weight", "500")
      .attr("font-family", "IBM Plex Sans, sans-serif");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -size / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("fill", colors.textMuted)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .attr("letter-spacing", "0.05em")
      .text("ACTUAL");

    svg.selectAll(".domain").remove();

    return () => d3.select(container).selectAll("*").remove();
  }, [metrics, colors]);

  if (!metrics?.confusion_matrix) return null;

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      <div className="glass-card chart-panel animate-in">
        <div className="chart-panel-header">
          <h3 className="chart-panel-title">Confusion Matrix</h3>
        </div>
        <div ref={chartRef} className="chart-container"></div>
      </div>
    </div>
  );
}
