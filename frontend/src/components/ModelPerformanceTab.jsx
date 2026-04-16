import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * ModelPerformanceTab — Metrics cards with D3 bar chart.
 */
export default function ModelPerformanceTab({ metrics }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!metrics || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    const metricList = [
      { name: "Accuracy", value: metrics.accuracy, color: "#6366f1" },
      { name: "Precision", value: metrics.precision, color: "#8b5cf6" },
      { name: "Recall", value: metrics.recall, color: "#06b6d4" },
      { name: "F1 Score", value: metrics.f1_score, color: "#10b981" },
      { name: "F-beta", value: metrics.fbeta_score, color: "#f59e0b" },
    ];

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 520 - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
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
      .attr("stroke", "rgba(148, 163, 184, 0.15)")
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
      .attr("rx", 6)
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
        d3.select(this).transition().duration(150).attr("opacity", 0.8);
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
      .attr("fill", "#e2e8f0")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
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
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");

    svg.selectAll(".domain, .tick line").attr("stroke", "rgba(148,163,184,0.3)");

    // Y axis
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px");

    return () => d3.select(container).selectAll("*").remove();
  }, [metrics]);

  if (!metrics) return null;

  const cards = [
    { label: "Accuracy", value: metrics.accuracy, icon: "\uD83C\uDFAF", color: "#6366f1" },
    { label: "Precision", value: metrics.precision, icon: "\u2705", color: "#8b5cf6" },
    { label: "Recall", value: metrics.recall, icon: "\uD83D\uDD0D", color: "#06b6d4" },
    { label: "F1 Score", value: metrics.f1_score, icon: "\u26A1", color: "#10b981" },
    { label: "F-beta (0.5)", value: metrics.fbeta_score, icon: "\uD83D\uDCD0", color: "#f59e0b" },
  ];

  return (
    <div>
      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col" key={c.label}>
            <div className="glass-card p-3 text-center h-100 metric-card">
              <div className="fs-4 mb-1">{c.icon}</div>
              <h4 className="mb-1 fw-bold" style={{ color: c.color }}>
                {(c.value * 100).toFixed(1)}%
              </h4>
              <small className="text-muted">{c.label}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card p-4">
        <h5 className="card-title text-center mb-3">Model Performance Comparison</h5>
        <div ref={chartRef} className="d-flex justify-content-center"></div>
      </div>
    </div>
  );
}
