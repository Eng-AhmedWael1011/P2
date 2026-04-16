import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useThemeColors } from "../hooks/useThemeColors";

/**
 * OverviewTab — Dataset summary with stat cards and D3 donut chart.
 * Dashboard design system: modular grid, glass panels, 8pt spacing.
 */
export default function OverviewTab({ data }) {
  const chartRef = useRef(null);
  const colors = useThemeColors();

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const container = chartRef.current;

    d3.select(container).selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 16;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img")
      .attr("aria-label", "Class distribution donut chart")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pieData = [
      { label: "\u226450K", value: data.income_at_most_50k, color: "#0C5CAB" },
      { label: ">50K", value: data.income_above_50k, color: "#10b981" },
    ];

    const pie = d3.pie().value((d) => d.value).sort(null).padAngle(0.04);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius * 0.6).outerRadius(radius + 6);

    svg
      .selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", colors.theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)")
      .attr("stroke-width", 1.5)
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

    // Pie labels — always white since they sit on colored segments
    svg
      .selectAll("text.label")
      .data(pie(pieData))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .text((d) => d.data.label)
      .style("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .style("opacity", 1);

    // Center text
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("fill", colors.textPrimary)
      .attr("font-size", "26px")
      .attr("font-weight", "800")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .text(data.total_records.toLocaleString());
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("fill", colors.textMuted)
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("font-family", "IBM Plex Sans, sans-serif")
      .text("TOTAL RECORDS");

    return () => d3.select(container).selectAll("*").remove();
  }, [data, colors]);

  if (!data) return null;

  const stats = [
    {
      icon: "📊",
      iconClass: "stat-icon-primary",
      number: data.total_records?.toLocaleString(),
      label: "Total Records",
    },
    {
      icon: "💰",
      iconClass: "stat-icon-success",
      number: data.income_above_50k?.toLocaleString(),
      label: `Income >50K (${data.income_above_50k_percent}%)`,
      color: "var(--color-success)",
    },
    {
      icon: "👥",
      iconClass: "stat-icon-primary",
      number: data.income_at_most_50k?.toLocaleString(),
      label: `Income ≤50K (${(100 - data.income_above_50k_percent).toFixed(2)}%)`,
      color: "var(--color-primary)",
    },
  ];

  return (
    <div>
      {/* Stats Row */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`glass-card glass-card-interactive stat-card animate-in animate-in-delay-${i + 1}`}
          >
            <div className={`stat-icon-wrapper ${s.iconClass}`} aria-hidden="true">
              {s.icon}
            </div>
            <div className="stat-content">
              <div className="stat-number" style={s.color ? { color: s.color } : {}}>
                {s.number}
              </div>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card chart-panel animate-in animate-in-delay-4">
        <div className="chart-panel-header">
          <h3 className="chart-panel-title">Class Distribution</h3>
        </div>
        <div ref={chartRef} className="chart-container"></div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#0C5CAB" }}></span>
            <span className="legend-label">≤50K</span>
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "#10b981" }}></span>
            <span className="legend-label">&gt;50K</span>
          </span>
        </div>
      </div>
    </div>
  );
}
