import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface AIAnalysis {
    summary: string;
    recommendations: {
        title: string;
        description: string;
        impact: "high" | "medium" | "low";
        category: string;
    }[];
    riskFlags: {
        title: string;
        description: string;
        severity: "critical" | "warning" | "info";
    }[];
    innovativeIdea: {
        title: string;
        description: string;
        potentialImpact: string;
    };
}

export interface ReportData {
    title: string;
    summary: string;
    dataSnapshot: {
        totalEmissions: number;
        byType: Record<string, number>;
        recentCalcs: any[];
    };
    aiAnalysis?: AIAnalysis | null;
    user?: {
        name?: string;
        email?: string;
    };
}

export const generateReportPDF = (data: ReportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 0;

    // --- Helpers ---
    const checkPageBreak = (neededSpace: number) => {
        if (yPos + neededSpace > pageHeight - 20) {
            doc.addPage();
            drawHeader();
            yPos = 55;
            return true;
        }
        return false;
    };

    const drawHeader = () => {
        doc.setFillColor(16, 185, 129); // Emerald-500
        doc.rect(0, 0, pageWidth, 40, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.text("Aetherra", 20, 25);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Sustainability Intelligence Report", 20, 32);

        const dateStr = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Generated: ${dateStr}`, pageWidth - 20, 25, { align: "right" });
    };

    const drawFooter = (pageNumber: number) => {
        doc.setPage(pageNumber);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Aetherra Platform | Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    };

    // --- Page 1: Dashboard & Visuals ---
    drawHeader();
    yPos = 55;

    // Title
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(data.title || "Carbon Audit", 20, yPos);
    yPos += 10;

    // Summary Box
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(20, yPos, pageWidth - 40, 30, 2, 2, "FD");

    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(71, 85, 105); // Slate-600
    // Trim summary to fit
    const summaryText = doc.splitTextToSize(data.summary || "No summary available.", pageWidth - 50);
    doc.text(summaryText, 25, yPos + 10);
    yPos += 40;

    // Key Metrics (Cards)
    const metrics = [
        { label: "Total Emissions", value: `${data.dataSnapshot.totalEmissions.toFixed(2)} t`, color: [16, 185, 129] },
        { label: "Net Zero Target", value: "2030", color: [59, 130, 246] },
        { label: "Offset Required", value: "100%", color: [245, 158, 11] },
    ];

    let cardX = 20;
    const cardWidth = (pageWidth - 40 - 10) / 3; // 3 cards with gaps

    metrics.forEach(m => {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cardX, yPos, cardWidth, 25, 2, 2, "FD");

        // Left accent border
        doc.setFillColor(m.color[0], m.color[1], m.color[2]);
        doc.rect(cardX, yPos, 2, 25, "F");

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(m.label, cardX + 6, yPos + 8);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(m.value, cardX + 6, yPos + 18);

        cardX += cardWidth + 5;
    });
    yPos += 35;

    // --- CHARTS SECTION ---
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Emission Analysis", 20, yPos);
    yPos += 10;

    // Prepare Data
    const categories = Object.keys(data.dataSnapshot.byType);
    const values = Object.values(data.dataSnapshot.byType);
    const total = values.reduce((a, b) => a + b, 0) || 1;

    // Colors
    const colors = [
        [59, 130, 246], // Blue
        [16, 185, 129], // Emerald
        [245, 158, 11], // Amber
        [239, 68, 68], // Red
        [168, 85, 247], // Purple
    ];

    // 1. Bar Chart (Left Side)
    const barChartY = yPos;
    const maxValue = Math.max(...values, 0.1);
    const chartHeight = 60;
    const chartWidth = (pageWidth - 50) / 2;

    // Draw Axis
    doc.setDrawColor(200, 200, 200);
    doc.line(20, barChartY, 20, barChartY + chartHeight); // Y
    doc.line(20, barChartY + chartHeight, 20 + chartWidth, barChartY + chartHeight); // X

    let currentX = 25;
    const barCount = categories.length;
    const barWidth = Math.min(25, (chartWidth / barCount) - 10);

    if (total <= 0.001) {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("No data available to plot.", 30, barChartY + 30);
    } else {
        categories.forEach((cat, idx) => {
            const val = values[idx];
            const rawBarH = (val / maxValue) * (chartHeight - 5);
            const barH = val > 0 ? Math.max(rawBarH, 1) : 0;

            const col = colors[idx % colors.length];
            doc.setFillColor(col[0], col[1], col[2]);

            if (barH > 0) {
                doc.rect(currentX, barChartY + chartHeight - barH, barWidth, barH, "F");
                // Label
                doc.setFontSize(8);
                doc.setTextColor(50);
                const valText = val < 1 ? val.toFixed(2) : val.toFixed(1);
                doc.text(valText, currentX + (barWidth / 2), barChartY + chartHeight - barH - 2, { align: "center" });
            }

            doc.setFontSize(7);
            doc.setTextColor(80);
            const safeCat = cat.length > 8 ? cat.substring(0, 6) + ".." : cat;
            doc.text(safeCat, currentX + (barWidth / 2), barChartY + chartHeight + 4, { align: "center" });

            currentX += barWidth + 10;
        });
    }

    // 2. Pie Chart (Right Side)
    const pieCenterX = 20 + chartWidth + 40;
    const pieCenterY = barChartY + (chartHeight / 2);
    const radius = 25;

    if (total <= 0.001) {
        doc.setDrawColor(200);
        doc.circle(pieCenterX, pieCenterY, radius, "S");
        doc.text("No Data", pieCenterX, pieCenterY, { align: "center" });
    } else {
        let startAngle = 0;
        values.forEach((val, idx) => {
            const sliceAngle = (val / total) * 360;
            if (sliceAngle <= 0) return;

            const endAngle = startAngle + sliceAngle;
            const col = colors[idx % colors.length];

            drawSector(doc, pieCenterX, pieCenterY, radius, startAngle, endAngle, col);

            // Legend
            const legendY = barChartY + (idx * 12);
            const legendX = pieCenterX + radius + 10;

            doc.setFillColor(col[0], col[1], col[2]);
            doc.rect(legendX, legendY, 3, 3, "F");

            doc.setFontSize(8);
            doc.setTextColor(60);
            const percent = ((val / total) * 100).toFixed(0) + "%";
            doc.text(`${categories[idx]}: ${percent}`, legendX + 5, legendY + 2.5);

            startAngle += sliceAngle;
        });
    }

    yPos += chartHeight + 20;


    // --- AI INSIGHTS ---
    if (data.aiAnalysis) {
        checkPageBreak(100);
        const ai = data.aiAnalysis;

        // Executive Summary
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(22, 163, 74);
        doc.roundedRect(20, yPos, pageWidth - 40, 30, 2, 2, "FD");

        doc.setFontSize(12);
        doc.setTextColor(22, 163, 74);
        doc.setFont("helvetica", "bold");
        doc.text("AI Executive Summary", 25, yPos + 8);

        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.setFont("helvetica", "normal");
        const execSum = doc.splitTextToSize(ai.summary, pageWidth - 50);
        doc.text(execSum, 25, yPos + 15);
        yPos += 40;

        // Innovative Idea
        checkPageBreak(50);
        doc.setFontSize(12);
        doc.setTextColor(147, 51, 234);
        doc.setFont("helvetica", "bold");
        doc.text("Strategic Opportunity: " + ai.innovativeIdea.title, 20, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setTextColor(70);
        doc.setFont("helvetica", "normal");
        const ideaDesc = doc.splitTextToSize(ai.innovativeIdea.description, pageWidth - 40);
        doc.text(ideaDesc, 20, yPos);
        yPos += (ideaDesc.length * 5) + 5;

        doc.setFont("helvetica", "bold");
        doc.text(`Projected Impact: ${ai.innovativeIdea.potentialImpact}`, 20, yPos);
        yPos += 15;

        // Recommendations
        checkPageBreak(60);
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text("Strategic Recommendations", 20, yPos);
        yPos += 5;

        const recData = ai.recommendations.map(r => [r.title, r.impact.toUpperCase(), r.category]);
        autoTable(doc, {
            startY: yPos,
            head: [['Action', 'Impact', 'Category']],
            body: recData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- ACTIVITY LOG ---
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Activity Log", 20, yPos);
    yPos += 5;

    const tableData = data.dataSnapshot.recentCalcs.map(c => [
        new Date(c.createdAt).toLocaleDateString(),
        c.type.charAt(0).toUpperCase() + c.type.slice(1),
        `${c.emissions.toFixed(3)} tCO2e`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Category', 'Emissions']],
        body: tableData,
        headStyles: { fillColor: [71, 85, 105] },
        theme: 'striped'
    });

    // Finalize Pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        drawFooter(i);
    }

    // Save
    const dateStr = new Date().toISOString().split('T')[0];
    const safeTitle = (data.title || "Report").replace(/[^a-z0-9]/gi, '_');
    doc.save(`Aetherra_${safeTitle}_${dateStr}.pdf`);
};

// Helper function to draw pie sectors
function drawSector(doc: any, cx: number, cy: number, r: number, startAngle: number, endAngle: number, color: number[]) {
    if (endAngle - startAngle <= 0) return;

    doc.setFillColor(color[0], color[1], color[2]);
    const rad = Math.PI / 180;

    // Draw sector as a polygon of small triangles for smoothness
    // Adjust step size based on arc length for performance
    const step = 2;
    for (let i = startAngle; i < endAngle; i += step) {
        const a1 = i * rad;
        const a2 = Math.min(i + step, endAngle) * rad;

        doc.triangle(
            cx, cy,
            cx + r * Math.cos(a1), cy + r * Math.sin(a1),
            cx + r * Math.cos(a2), cy + r * Math.sin(a2),
            "F"
        );
    }
}
