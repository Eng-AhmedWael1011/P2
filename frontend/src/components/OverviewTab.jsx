import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/**
 * OverviewTab — Dataset summary with class distribution chart.
 */
export default function OverviewTab({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pieData = [
      { label: "\u226450K", value: data.income_at_most_50k, color: "#6366f1" },
      { label: ">50K", value: data.income_above_50k, color: "#06b6d4" },
    ];

    const pie = d3.pie().value((d) => d.value).sort(null).padAngle(0.03);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius + 8);

    svg
      .selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .style("cursor", "pointer")
      .transition()
      .duration(800)
      .delay((_d, i) => i * 200)
      .style("opacity", 1)
      .attr("d", arc);

    svg
      .selectAll("path")
      .on("mouseenter", function () {
        d3.select(this).transition().duration(200).attr("d", arcHover);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("d", arc);
      });

    // Labels
    svg
      .selectAll("text.label")
      .data(pie(pieData))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .text((d) => `${d.data.label}`)
      .style("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .style("opacity", 1);

    // Center text
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "28px")
      .attr("font-weight", "700")
      .text(data.total_records.toLocaleString());
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.4em")
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px")
      .text("Total Records");

    return () => d3.select(container).selectAll("*").remove();
  }, [data]);

  if (!data) return null;

  return (
    <div className="row g-4">
      {/* Summary Cards */}
      <div className="col-md-4">
        <div className="glass-card p-4 text-center h-100">
          <div className="stat-icon mb-2">{"\uD83D\uDCCA"}</div>
          <h3 className="stat-number">{data.total_records?.toLocaleString()}</h3>
          <p className="stat-label">Total Records</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="glass-card p-4 text-center h-100">
          <div className="stat-icon mb-2">{"\uD83D\uDCB0"}</div>
          <h3 className="stat-number text-accent">{data.income_above_50k?.toLocaleString()}</h3>
          <p className="stat-label">Income &gt;50K ({data.income_above_50k_percent}%)</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="glass-card p-4 text-center h-100">
          <div className="stat-icon mb-2">{"\uD83D\uDC65"}</div>
          <h3 className="stat-number" style={{ color: "#6366f1" }}>
            {data.income_at_most_50k?.toLocaleString()}
          </h3>
          <p className="stat-label">Income {"\u2264"}50K ({(100 - data.income_above_50k_percent).toFixed(2)}%)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="col-lg-6 mx-auto">
        <div className="glass-card p-4">
          <h5 className="card-title text-center mb-3">Class Distribution</h5>
          <div ref={chartRef} className="d-flex justify-content-center"></div>
          <div className="d-flex justify-content-center gap-4 mt-3">
            <span className="d-flex align-items-center gap-2">
              <span className="legend-dot" style={{ background: "#6366f1" }}></span>
              <small className="text-muted">{"\u2264"}50K</small>
            </span>
            <span className="d-flex align-items-center gap-2">
              <span className="legend-dot" style={{ background: "#06b6d4" }}></span>
              <small className="text-muted">&gt;50K</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
