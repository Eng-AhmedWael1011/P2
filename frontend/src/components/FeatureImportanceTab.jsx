import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * FeatureImportanceTab — Horizontal bar chart of SHAP feature importance.
 */
export default function FeatureImportanceTab({ importance }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!importance || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    // Take top 15 features
    const entries = Object.entries(importance).slice(0, 15);
    const data = entries.map(([name, value]) => ({
      name: name.replace(/^(num__|cat__)/, ""),
      value,
    }));

    const margin = { top: 10, right: 40, bottom: 30, left: 200 };
    const barHeight = 28;
    const height = data.length * barHeight + margin.top + margin.bottom;
    const width = 600;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const maxVal = d3.max(data, (d) => d.value);

    const x = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, innerWidth]);
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, data.length * barHeight])
      .padding(0.25);

    const colorScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range(["#06b6d4", "#6366f1"]);

    // Bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", (d) => y(d.name))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", 0)
      .attr("rx", 4)
      .attr("fill", (_d, i) => colorScale(i))
      .style("cursor", "pointer")
      .transition()
      .duration(800)
      .delay((_d, i) => i * 50)
      .attr("width", (d) => x(d.value));

    // Hover
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
      .data(data)
      .enter()
      .append("text")
      .attr("class", "val")
      .attr("x", (d) => x(d.value) + 6)
      .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
      .attr("dominant-baseline", "central")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px")
      .text((d) => d.value.toFixed(4))
      .style("opacity", 0)
      .transition()
      .delay(800)
      .duration(300)
      .style("opacity", 1);

    // Y axis labels
    svg
      .append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "11px");

    svg.selectAll(".domain").remove();

    return () => d3.select(container).selectAll("*").remove();
  }, [importance]);

  if (!importance) return null;

  return (
    <div className="glass-card p-4">
      <h5 className="card-title text-center mb-3">SHAP Feature Importance (Top 15)</h5>
      <div ref={chartRef} className="d-flex justify-content-center"></div>
    </div>
  );
}
