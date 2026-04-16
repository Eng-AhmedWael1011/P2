import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useThemeColors } from "../hooks/useThemeColors";

/**
 * ModelPerformanceTab — Metric cards grid with D3 bar chart.
 * Dashboard design system: metrics grid, glass panels, 8pt spacing.
 */
export default function ModelPerformanceTab({ metrics }) {
  const chartRef = useRef(null);
  const colors = useThemeColors();

  useEffect(() => {
    if (!metrics || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    const metricList = [
      { name: "Accuracy", value: metrics.accuracy, color: "#0C5CAB" },
      { name: "Precision", value: metrics.precision, color: "#0a4a8a" },
      { name: "Recall", value: metrics.recall, color: "#10b981" },
      { name: "F1 Score", value: metrics.f1_score, color: "#1d8cf8" },
      { name: "F-beta", value: metrics.fbeta_score, color: "#f59e0b" },
    ];

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 520 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img")
      .attr("aria-label", "Model performance bar chart")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(metricList.map((d) => d.name))
      .range([0, width])
      .padding(0.35);

    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    // Grid lines
    svg
      .selectAll("line.grid")
      .data(y.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", colors.borderSubtle)
      .attr("stroke-dasharray", "3,3");

    // Bars
    svg
      .selectAll("rect")
      .data(metricList)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("rx", 4)
      .attr("fill", (d) => d.color)
      .style("cursor", "pointer")
      .transition()
      .duration(800)
      .delay((_d, i) => i * 120)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value));

    // Bar hover
    svg
      .selectAll("rect")
      .on("mouseenter", function () {
        d3.select(this).transition().duration(150).attr("opacity", 0.75);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(150).attr("opacity", 1);
      });

    // Value labels
    svg
      .selectAll("text.val")
      .data(metricList)
      .enter()
      .append("text")
      .attr("class", "val")
      .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", colors.textPrimary)
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .text((d) => (d.value * 100).toFixed(1) + "%")
      .style("opacity", 0)
      .transition()
      .delay(800)
      .duration(400)
      .style("opacity", 1);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", colors.textMuted)
      .attr("font-size", "11px")
      .attr("font-family", "IBM Plex Sans, sans-serif");

    svg.selectAll(".domain, .tick line").attr("stroke", colors.borderSubtle);

    // Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .attr("fill", colors.textMuted)
      .attr("font-size", "11px")
      .attr("font-family", "IBM Plex Sans, sans-serif");

    return () => d3.select(container).selectAll("*").remove();
  }, [metrics, colors]);

  if (!metrics) return null;

  const cards = [
    { label: "Accuracy",  value: metrics.accuracy,    icon: "🎯", color: "#0C5CAB" },
    { label: "Precision", value: metrics.precision,   icon: "✅", color: "#0a4a8a" },
    { label: "Recall",    value: metrics.recall,       icon: "🔍", color: "#10b981" },
    { label: "F1 Score",  value: metrics.f1_score,    icon: "⚡", color: "#1d8cf8" },
    { label: "F-beta",    value: metrics.fbeta_score,  icon: "📐", color: "#f59e0b" },
  ];

  return (
    <div>
      {/* Metric Cards */}
      <div className="metrics-grid">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={`glass-card glass-card-interactive metric-card animate-in animate-in-delay-${i + 1}`}
          >
            <div className="metric-icon" aria-hidden="true">{c.icon}</div>
            <div className="metric-value" style={{ color: c.color }}>
              {(c.value * 100).toFixed(1)}%
            </div>
            <div className="metric-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="glass-card chart-panel animate-in">
        <div className="chart-panel-header">
          <h3 className="chart-panel-title">Performance Comparison</h3>
        </div>
        <div ref={chartRef} className="chart-container"></div>
      </div>
    </div>
  );
}
