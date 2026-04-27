const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const opdModel = require('../models/opd.model');
const ipdModel = require('../models/IPD.model');
const patientModel = require('../models/patient.model');
const userModel = require('../models/user.model');
const hospitalModel = require('../models/hospital.model');

// Helper: Get hospital info
const getHospitalInfo = async (hospitalId) => {
  const hospital = await hospitalModel.findById(hospitalId);
  return hospital;
};

// Helper: Format currency
const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper: Format date
const formatDate = (date) => {
  return moment(date).format('DD-MM-YYYY');
};

// Helper: Format date time
const formatDateTime = (date) => {
  return moment(date).format('DD-MM-YYYY HH:mm');
};

// ==================== OPD REPORTS ====================

// GET OPD Data for Reports
const getOPDData = async (hospitalId, fromDate, toDate) => {
  const query = { hospitalId };
  
  if (fromDate && toDate) {
    query.visitDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate + 'T23:59:59.999')
    };
  }

  const opdRecords = await opdModel.find(query)
    .populate('patientId', 'name phone age gender')
    .populate('doctorId', 'name profile')
    .sort({ visitDate: -1 });

  return opdRecords.map(record => ({
    date: record.visitDate,
    tokenNo: record.tokenNumber,
    patientName: record.patientId?.name || 'N/A',
    age: record.patientId?.age || 'N/A',
    gender: record.patientId?.gender || 'N/A',
    phone: record.patientId?.phone || 'N/A',
    doctorName: record.doctorId?.name || 'N/A',
    department: record.doctorId?.profile?.specialization || 'General',
    symptoms: record.symptoms || '-',
    consultationFee: record.amount,
    paymentStatus: record.paymentStatus,
    status: record.status,
    createdBy: record.createdBy?.name || 'N/A'
  }));
};

// GET /api/reports/opd/excel
exports.exportOPDExcel = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    // Validate dates
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ message: 'From date must be before To date' });
    }

    const opdData = await getOPDData(hospitalId, fromDate, toDate);
    const hospital = await getHospitalInfo(hospitalId);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HealthClub HMS';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('OPD Report');

    // Add hospital header
    worksheet.mergeCells('A1:N1');
    worksheet.getCell('A1').value = hospital?.name || 'Hospital';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:N2');
    worksheet.getCell('A2').value = `OPD Report ${fromDate && toDate ? `(${formatDate(fromDate)} - ${formatDate(toDate)})` : '(All Time)'}`;
    worksheet.getCell('A2').font = { bold: true, size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:N3');
    worksheet.getCell('A3').value = `Generated on: ${formatDateTime(new Date())}`;
    worksheet.getCell('A3').font = { size: 10 };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    // Add columns
    const columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Token No', key: 'tokenNo', width: 10 },
      { header: 'Patient Name', key: 'patientName', width: 20 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Phone', key: 'phone', width: 12 },
      { header: 'Doctor', key: 'doctorName', width: 18 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Symptoms', key: 'symptoms', width: 20 },
      { header: 'Consultation Fee', key: 'consultationFee', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created By', key: 'createdBy', width: 15 },
    ];

    worksheet.columns = columns;

    // Add header row styling
    worksheet.getRow(5).values = columns.map(col => col.header);
    worksheet.getRow(5).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4473C4' }
    };
    worksheet.getRow(5).alignment = { horizontal: 'center' };

    // Add data rows
    opdData.forEach(record => {
      worksheet.addRow({
        date: formatDate(record.date),
        tokenNo: record.tokenNo,
        patientName: record.patientName,
        age: record.age,
        gender: record.gender,
        phone: record.phone,
        doctorName: record.doctorName,
        department: record.department,
        symptoms: record.symptoms,
        consultationFee: formatCurrency(record.consultationFee),
        paymentStatus: record.paymentStatus,
        status: record.status,
        createdBy: record.createdBy
      });
    });

    // Add summary row
    const totalRecords = opdData.length;
    const totalRevenue = opdData.reduce((sum, r) => sum + (r.consultationFee || 0), 0);
    const paidCount = opdData.filter(r => r.paymentStatus === 'PAID').length;
    const unpaidCount = opdData.filter(r => r.paymentStatus === 'UNPAID').length;

    worksheet.addRow([]);
    worksheet.addRow({
      date: 'Total',
      tokenNo: totalRecords,
      patientName: `Paid: ${paidCount}`,
      age: `Unpaid: ${unpaidCount}`,
      consultationFee: formatCurrency(totalRevenue)
    });
    worksheet.getRow(worksheet.rowCount).font = { bold: true };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=OPD_Report_${moment().format('YYYY-MM-DD')}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export OPD Excel Error:', error);
    res.status(500).json({ message: 'Error generating OPD Excel report' });
  }
};

// GET /api/reports/opd/pdf
exports.exportOPDPDF = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ message: 'From date must be before To date' });
    }

    const opdData = await getOPDData(hospitalId, fromDate, toDate);
    const hospital = await getHospitalInfo(hospitalId);

    // Create PDF document
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OPD_Report_${moment().format('YYYY-MM-DD')}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(hospital?.name || 'Hospital', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text(hospital?.address || '', { align: 'center' });
    doc.text(`Phone: ${hospital?.phone || ''}`, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(14).font('Helvetica-Bold').text('OPD Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(
      `Date Range: ${fromDate && toDate ? `${formatDate(fromDate)} - ${formatDate(toDate)}` : 'All Time'}`,
      { align: 'center' }
    );
    doc.text(`Generated on: ${formatDateTime(new Date())}`, { align: 'center' });
    
    doc.moveDown(1);

    // Table headers
    const tableTop = doc.y;
    const colWidths = [50, 35, 70, 25, 35, 55, 60, 50];
    const headers = ['Date', 'Token', 'Patient', 'Age', 'Gender', 'Doctor', 'Fee', 'Status'];
    
    doc.font('Helvetica-Bold').fontSize(9);
    let xPos = 30;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    // Draw header line
    doc.moveTo(30, tableTop + 12).lineTo(565, tableTop + 12).stroke();

    // Table data
    doc.font('Helvetica').fontSize(8);
    let yPos = tableTop + 15;
    const maxRows = 35;

    opdData.slice(0, maxRows).forEach((record, index) => {
      if (yPos > 750) {
        doc.addPage();
        yPos = 30;
      }
      
      xPos = 30;
      const rowData = [
        formatDate(record.date),
        String(record.tokenNo),
        record.patientName.substring(0, 12),
        String(record.age),
        record.gender,
        record.doctorName.substring(0, 12),
        formatCurrency(record.consultationFee),
        record.status
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, xPos, yPos, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });
      
      yPos += 12;
    });

    // Summary
    const totalRecords = opdData.length;
    const totalRevenue = opdData.reduce((sum, r) => sum + (r.consultationFee || 0), 0);
    const paidCount = opdData.filter(r => r.paymentStatus === 'PAID').length;
    const unpaidCount = opdData.filter(r => r.paymentStatus === 'UNPAID').length;

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Total Records: ${totalRecords}`, 30, doc.y);
    doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 200, doc.y);
    doc.text(`Paid: ${paidCount} | Unpaid: ${unpaidCount}`, 400, doc.y);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica');
    doc.text('Generated by HealthClub HMS', 30, doc.y, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Export OPD PDF Error:', error);
    res.status(500).json({ message: 'Error generating OPD PDF report' });
  }
};

// ==================== IPD REPORTS ====================

// GET IPD Data for Reports
const getIPDData = async (hospitalId, fromDate, toDate) => {
  const query = { hospitalId };
  
  if (fromDate && toDate) {
    query.$or = [
      { admissionDate: { $gte: new Date(fromDate), $lte: new Date(toDate + 'T23:59:59.999') } },
      { dischargeDate: { $gte: new Date(fromDate), $lte: new Date(toDate + 'T23:59:59.999') } }
    ];
  }

  const ipdRecords = await ipdModel.find(query)
    .populate('patientId', 'name phone age gender')
    .populate('doctorId', 'name profile')
    .populate('bedId', 'wardName roomNumber bedNumber')
    .sort({ admissionDate: -1 });

  return ipdRecords.map(record => ({
    admitDate: record.admissionDate,
    dischargeDate: record.dischargeDate,
    patientName: record.patientId?.name || 'N/A',
    age: record.patientId?.age || 'N/A',
    gender: record.patientId?.gender || 'N/A',
    phone: record.patientId?.phone || 'N/A',
    doctorName: record.doctorId?.name || 'N/A',
    ward: record.bedId?.wardName || record.wardType || 'General',
    bedNo: record.bedNumber,
    disease: record.diagnosis || '-',
    advancePaid: record.totalAmount || 0,
    totalBill: record.totalAmount || 0,
    paymentStatus: record.paymentStatus || 'UNPAID',
    status: record.status,
    createdBy: record.createdBy?.name || 'N/A'
  }));
};

// GET /api/reports/ipd/excel
exports.exportIPDExcel = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ message: 'From date must be before To date' });
    }

    const ipdData = await getIPDData(hospitalId, fromDate, toDate);
    const hospital = await getHospitalInfo(hospitalId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HealthClub HMS';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('IPD Report');

    // Add hospital header
    worksheet.mergeCells('A1:O1');
    worksheet.getCell('A1').value = hospital?.name || 'Hospital';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:O2');
    worksheet.getCell('A2').value = `IPD Report ${fromDate && toDate ? `(${formatDate(fromDate)} - ${formatDate(toDate)})` : '(All Time)'}`;
    worksheet.getCell('A2').font = { bold: true, size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:O3');
    worksheet.getCell('A3').value = `Generated on: ${formatDateTime(new Date())}`;
    worksheet.getCell('A3').font = { size: 10 };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    // Add columns
    const columns = [
      { header: 'Admit Date', key: 'admitDate', width: 12 },
      { header: 'Discharge Date', key: 'dischargeDate', width: 12 },
      { header: 'Patient Name', key: 'patientName', width: 20 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Phone', key: 'phone', width: 12 },
      { header: 'Doctor', key: 'doctorName', width: 18 },
      { header: 'Ward', key: 'ward', width: 15 },
      { header: 'Bed No', key: 'bedNo', width: 10 },
      { header: 'Diagnosis', key: 'disease', width: 20 },
      { header: 'Advance Paid', key: 'advancePaid', width: 13 },
      { header: 'Total Bill', key: 'totalBill', width: 13 },
      { header: 'Payment Status', key: 'paymentStatus', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created By', key: 'createdBy', width: 15 },
    ];

    worksheet.columns = columns;

    // Add header row styling
    worksheet.getRow(5).values = columns.map(col => col.header);
    worksheet.getRow(5).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4473C4' }
    };
    worksheet.getRow(5).alignment = { horizontal: 'center' };

    // Add data rows
    ipdData.forEach(record => {
      worksheet.addRow({
        admitDate: formatDate(record.admitDate),
        dischargeDate: record.dischargeDate ? formatDate(record.dischargeDate) : 'N/A',
        patientName: record.patientName,
        age: record.age,
        gender: record.gender,
        phone: record.phone,
        doctorName: record.doctorName,
        ward: record.ward,
        bedNo: record.bedNo,
        disease: record.disease,
        advancePaid: formatCurrency(record.advancePaid),
        totalBill: formatCurrency(record.totalBill),
        paymentStatus: record.paymentStatus,
        status: record.status,
        createdBy: record.createdBy
      });
    });

    // Add summary row
    const totalRecords = ipdData.length;
    const totalAdvance = ipdData.reduce((sum, r) => sum + (r.advancePaid || 0), 0);
    const totalBill = ipdData.reduce((sum, r) => sum + (r.totalBill || 0), 0);
    const admittedCount = ipdData.filter(r => r.status === 'ADMITTED').length;
    const dischargedCount = ipdData.filter(r => r.status === 'DISCHARGED').length;

    worksheet.addRow([]);
    worksheet.addRow({
      admitDate: 'Total',
      dischargeDate: totalRecords,
      patientName: `Admitted: ${admittedCount}`,
      age: `Discharged: ${dischargedCount}`,
      advancePaid: formatCurrency(totalAdvance),
      totalBill: formatCurrency(totalBill)
    });
    worksheet.getRow(worksheet.rowCount).font = { bold: true };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=IPD_Report_${moment().format('YYYY-MM-DD')}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export IPD Excel Error:', error);
    res.status(500).json({ message: 'Error generating IPD Excel report' });
  }
};

// GET /api/reports/ipd/pdf
exports.exportIPDPDF = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ message: 'From date must be before To date' });
    }

    const ipdData = await getIPDData(hospitalId, fromDate, toDate);
    const hospital = await getHospitalInfo(hospitalId);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=IPD_Report_${moment().format('YYYY-MM-DD')}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(hospital?.name || 'Hospital', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text(hospital?.address || '', { align: 'center' });
    doc.text(`Phone: ${hospital?.phone || ''}`, { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(14).font('Helvetica-Bold').text('IPD Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(
      `Date Range: ${fromDate && toDate ? `${formatDate(fromDate)} - ${formatDate(toDate)}` : 'All Time'}`,
      { align: 'center' }
    );
    doc.text(`Generated on: ${formatDateTime(new Date())}`, { align: 'center' });
    
    doc.moveDown(1);

    // Table headers
    const tableTop = doc.y;
    const colWidths = [50, 65, 70, 25, 35, 50, 45, 50, 50];
    const headers = ['Admit', 'Discharge', 'Patient', 'Age', 'Gender', 'Doctor', 'Ward', 'Bill', 'Status'];
    
    doc.font('Helvetica-Bold').fontSize(9);
    let xPos = 30;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    // Draw header line
    doc.moveTo(30, tableTop + 12).lineTo(565, tableTop + 12).stroke();

    // Table data
    doc.font('Helvetica').fontSize(8);
    let yPos = tableTop + 15;
    const maxRows = 30;

    ipdData.slice(0, maxRows).forEach((record) => {
      if (yPos > 750) {
        doc.addPage();
        yPos = 30;
      }
      
      xPos = 30;
      const rowData = [
        formatDate(record.admitDate),
        record.dischargeDate ? formatDate(record.dischargeDate) : 'N/A',
        record.patientName.substring(0, 12),
        String(record.age),
        record.gender,
        record.doctorName.substring(0, 10),
        record.ward.substring(0, 10),
        formatCurrency(record.totalBill),
        record.status
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, xPos, yPos, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });
      
      yPos += 12;
    });

    // Summary
    const totalRecords = ipdData.length;
    const totalAdvance = ipdData.reduce((sum, r) => sum + (r.advancePaid || 0), 0);
    const totalBill = ipdData.reduce((sum, r) => sum + (r.totalBill || 0), 0);
    const admittedCount = ipdData.filter(r => r.status === 'ADMITTED').length;
    const dischargedCount = ipdData.filter(r => r.status === 'DISCHARGED').length;

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Total Records: ${totalRecords}`, 30, doc.y);
    doc.text(`Total Advance: ${formatCurrency(totalAdvance)}`, 180, doc.y);
    doc.text(`Total Bill: ${formatCurrency(totalBill)}`, 330, doc.y);
    doc.moveDown(0.5);
    doc.text(`Admitted: ${admittedCount} | Discharged: ${dischargedCount}`, 30, doc.y);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica');
    doc.text('Generated by HealthClub HMS', 30, doc.y, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Export IPD PDF Error:', error);
    res.status(500).json({ message: 'Error generating IPD PDF report' });
  }
};

// GET Preview Data
exports.getOPDPreview = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    const opdData = await getOPDData(hospitalId, fromDate, toDate);
    
    const totalRecords = opdData.length;
    const totalRevenue = opdData.reduce((sum, r) => sum + (r.consultationFee || 0), 0);
    const paidCount = opdData.filter(r => r.paymentStatus === 'PAID').length;
    const unpaidCount = opdData.filter(r => r.paymentStatus === 'UNPAID').length;

    res.json({
      data: opdData.slice(0, 50), // Limit preview to 50 records
      summary: {
        totalRecords,
        totalRevenue,
        paidCount,
        unpaidCount
      }
    });
  } catch (error) {
    console.error('Get OPD Preview Error:', error);
    res.status(500).json({ message: 'Error fetching OPD preview' });
  }
};

exports.getIPDPreview = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    const ipdData = await getIPDData(hospitalId, fromDate, toDate);
    
    const totalRecords = ipdData.length;
    const totalAdvance = ipdData.reduce((sum, r) => sum + (r.advancePaid || 0), 0);
    const totalBill = ipdData.reduce((sum, r) => sum + (r.totalBill || 0), 0);
    const admittedCount = ipdData.filter(r => r.status === 'ADMITTED').length;
    const dischargedCount = ipdData.filter(r => r.status === 'DISCHARGED').length;

    res.json({
      data: ipdData.slice(0, 50),
      summary: {
        totalRecords,
        totalAdvance,
        totalBill,
        admittedCount,
        dischargedCount
      }
    });
  } catch (error) {
    console.error('Get IPD Preview Error:', error);
    res.status(500).json({ message: 'Error fetching IPD preview' });
  }
};