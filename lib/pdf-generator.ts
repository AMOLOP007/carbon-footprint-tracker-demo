import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
    title: string;
    summary: string;
    dataSnapshot: {
        totalEmissions: number;
        byType: Record<string, number>;
        recentCalcs: any[];
    };
    user?: {
        name?: string;
        email?: string;
    };
}

export const generateReportPDF = (data: ReportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Helpers ---
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
    let yPos = 55;

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
    yPos += 45;

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
    yPos += 40;

    // --- BAR CHART VISUAL --- 
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Emission Sources Breakdown", 20, yPos);
    yPos += 10;

    // Prepare chart data
    const categories = Object.keys(data.dataSnapshot.byType);
    const values = Object.values(data.dataSnapshot.byType);
    const maxValue = Math.max(...values, 0.1); // Avoid div by zero
    const chartHeight = 60;
    const chartWidth = pageWidth - 40;
    const barMaxHeight = 50;
    const barCount = categories.length;
    const barWidth = 20;
    const gap = (chartWidth - (barCount * barWidth)) / (barCount + 1);

    // Draw Chart Background
    doc.setDrawColor(240, 240, 240);
    doc.line(20, yPos + chartHeight, pageWidth - 20, yPos + chartHeight); // X Axis
    doc.line(20, yPos, 20, yPos + chartHeight); // Y Axis

    // Draw Bars
    let currentX = 20 + gap;
    categories.forEach((cat, idx) => {
        const val = values[idx];
        const barH = (val / maxValue) * barMaxHeight;

        // Bar
        doc.setFillColor(59, 130, 246); // Blue-500
        if (cat === 'shipping') doc.setFillColor(249, 115, 22); // Orange
        if (cat === 'electricity') doc.setFillColor(234, 179, 8); // Yellow

        doc.rect(currentX, yPos + chartHeight - barH, barWidth, barH, "F");

        // Label
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(cat.charAt(0).toUpperCase() + cat.slice(1), currentX + (barWidth / 2), yPos + chartHeight + 5, { align: "center", angle: 0 });

        // Value
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.text(val.toFixed(2), currentX + (barWidth / 2), yPos + chartHeight - barH - 2, { align: "center" });

        currentX += barWidth + gap;
    });

    yPos += chartHeight + 20;

    // --- Page 2: Detailed Table ---
    // If yPos is too low, add page, otherwise continue
    if (yPos > pageHeight - 60) {
        doc.addPage();
        drawHeader();
        yPos = 55;
    }

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
        headStyles: { fillColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [241, 245, 249] }, // Slate-100
        styles: { fontSize: 10, cellPadding: 5 },
        theme: 'grid'
    });

    // Finalize Pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        drawFooter(i);
    }

    // Save
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Aetherra_Report_${dateStr}.pdf`);
};
