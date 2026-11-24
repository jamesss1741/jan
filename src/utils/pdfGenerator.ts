import { jsPDF } from 'jspdf';
import { BasketItem } from '../types';
import { calculateBasketMetrics } from './analytics';

export function generateShoppingSlipPdf(basket: BasketItem[], userName: string = 'Citizen') {
  const doc = new jsPDF();
  const metrics = calculateBasketMetrics(basket);

  // Official Indian Tricolor Ribbon in PDF
  doc.setFillColor(255, 103, 31); // Saffron
  doc.rect(0, 0, 210, 3, 'F');
  doc.setFillColor(255, 255, 255); // White
  doc.rect(0, 3, 210, 2, 'F');
  doc.setFillColor(4, 106, 56); // India Green
  doc.rect(0, 5, 210, 3, 'F');

  // Ashoka Chakra Navy Blue Header Block
  doc.setFillColor(0, 0, 128); // #000080 Ashoka Chakra Navy Blue
  doc.rect(0, 8, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Jan Aushadhi • PMBJP Official Prescription Slip', 14, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers, Govt. of India', 14, 26);
  doc.text(`Beneficiary: ${userName} | Generated: ${new Date().toLocaleDateString('en-IN')} | Kendras: 20,149+ Active`, 14, 31);

  // Summary box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 38, 182, 28, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Financial Savings Summary', 18, 46);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Estimated Jan-Aushadhi Cost: Rs. ${metrics.totalJanAushadhiMonthlyCost.toFixed(2)}`, 18, 54);
  doc.text(`Equivalent Branded Market MRP: Rs. ${metrics.totalBrandedMonthlyCost.toFixed(2)}`, 18, 60);

  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(`You Save: Rs. ${metrics.monthlySavings.toFixed(2)} / month (${metrics.savingsPercentage}% OFF)`, 110, 54);
  doc.text(`Projected 12-Month Savings: Rs. ${metrics.annualSavings.toFixed(2)} / year`, 110, 60);

  // Medicine table header
  let y = 74;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Code', 16, y + 5.5);
  doc.text('PMBJP Generic Formulation / Salt Composition', 32, y + 5.5);
  doc.text('Dosage', 126, y + 5.5);
  doc.text('Pack', 148, y + 5.5);
  doc.text('MRP (Rs)', 175, y + 5.5);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  basket.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 182, 10, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.text(item.medicine.pmbjpCode, 16, y + 2);
    
    doc.setFont('helvetica', 'normal');
    const genericShort = item.medicine.genericName.length > 50 
      ? item.medicine.genericName.slice(0, 48) + '...' 
      : item.medicine.genericName;
    doc.text(genericShort, 32, y + 2);
    doc.text(item.dosagePattern, 126, y + 2);
    doc.text(`${item.medicine.packSize} ${item.medicine.dosageForm}s`, 148, y + 2);
    doc.text(`Rs. ${item.medicine.janAushadhiMrp.toFixed(2)}`, 175, y + 2);

    y += 10;
  });

  // Footer / Disclaimer
  y = Math.min(y + 10, 275);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PMBJP Helpline: 1800-180-8080 | Certified WHO-GMP Formulations tested at NABL Laboratories.', 14, y);
  doc.text('Take this slip to any of 20,149+ Pradhan Mantri Bhartiya Janaushadhi Kendras across India.', 14, y + 4);
  doc.text('Note: Present a valid doctor prescription for all Schedule H / H1 drugs.', 14, y + 8);

  doc.save(`Jan-Aushadhi-Prescription-Slip-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function formatShoppingSlipText(basket: BasketItem[], metrics: ReturnType<typeof calculateBasketMetrics>) {
  let text = `🏥 *Jan-Aushadhi Finder Pro (PMBJP) - Prescription Shopping Slip*\n`;
  text += `📅 Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
  text += `*Summary of Savings:*\n`;
  text += `• Jan-Aushadhi Cost: ₹${metrics.totalJanAushadhiMonthlyCost.toFixed(2)} / month\n`;
  text += `• Branded Market MRP: ₹${metrics.totalBrandedMonthlyCost.toFixed(2)} / month\n`;
  text += `• *Total Citizen Savings: ₹${metrics.monthlySavings.toFixed(2)} / month (${metrics.savingsPercentage}% OFF)*\n`;
  text += `• *12-Month Projected Savings: ₹${metrics.annualSavings.toFixed(2)} / year*\n\n`;
  text += `*Required Generic Medicines & PMBJP Drug Codes:*\n`;

  basket.forEach((item, index) => {
    const brand = item.selectedBrandAlternative || item.medicine.brandedAlternatives[0];
    text += `${index + 1}. *[Code: ${item.medicine.pmbjpCode}]* ${item.medicine.genericName}\n`;
    text += `   • Brand Equivalent: ${brand?.brandName || 'Market Brand'} (MRP ₹${brand?.mrp.toFixed(2) || '0.00'})\n`;
    text += `   • PMBJP MRP: ₹${item.medicine.janAushadhiMrp.toFixed(2)} (${item.medicine.packSize} ${item.medicine.dosageForm}s)\n`;
    text += `   • Dosage: ${item.dosagePattern}\n\n`;
  });

  text += `📍 Available at 20,149+ PMBJP Kendras nationwide.\n`;
  text += `📞 National PMBJP Toll-Free Helpline: 1800-180-8080`;
  return text;
}
