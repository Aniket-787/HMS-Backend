const patientModel = require('../models/patient.model');
const bedModel = require('../models/bed.model');
const ipdModel = require('../models/IPD.model');


async function admitPatient(req, res) {
  try {
    const { patientId, doctorId, wardType, isInsured, InsuranceNo, policyNo, diagnosis, notes, complimentTo } = req.body;
    const hospitalId = req.user.hospitalId;

    // 🔍 Check patient
    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 🔍 Find available bed automatically
    const bed = await bedModel.findOne({
      hospitalId,
      type: wardType,
      status: "VACANT",
    });

    if (!bed) {
      return res.status(400).json({
        message: `No vacant beds available in ${wardType}`,
      });
    }

    const lastIPD = await ipdModel.findOne({ hospitalId })
  .sort({ createdAt: -1 });

   let nextNumber = 1;

  if (lastIPD && lastIPD.ipdNumber) {
  const lastNumber = parseInt(lastIPD.ipdNumber.split("-")[1]);
  nextNumber = lastNumber + 1;
 }

const ipdNumber = `IPD-${String(nextNumber).padStart(4, "0")}`;

    // 🔥 Create IPD
    const ipd = await ipdModel.create({
      patientId,
      doctorId,
      hospitalId,
      uhid: patient.uhid,
      ipdNumber,
      wardType,
      isInsured,
      InsuranceNo,
      policyNo,
      diagnosis,
      notes,
      complimentTo,
      bedNumber: bed.bedNumber,
      bedId: bed._id,
      bedChargePerDay: bed.chargePerDay,
    });

    // 🔥 Update bed
    bed.status = "OCCUPIED";
    bed.patientId = patientId;
    await bed.save();

    res.status(201).json({
      message: "Patient admitted successfully",
      ipd,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}


async function getAdmittedPatients(req, res) {
  try {
    const hospitalId = req.user.hospitalId;

    const patients = await ipdModel
      .find({
        hospitalId,
        status: "ADMITTED",
      })
      .populate("patientId")
      .populate("doctorId", "name")
      .populate("bedId");

    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getDischargePatients(req, res) {
  try {
    const hospitalId = req.user.hospitalId;

    const patients = await ipdModel
      .find({
        hospitalId,
        status: "DISCHARGED",
      })
      .populate("patientId")
      .populate("doctorId", "name")
      .populate("bedId");

    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addDailyNotes(req, res) {
  try {
    const { ipdId } = req.params;
    const { notes, medicines } = req.body;

    const ipd = await ipdModel.findById(ipdId);

    if (!ipd) {
      return res.status(404).json({ message: "IPD not found" });
    }

    ipd.dailyNotes.push({
      notes,
      medicines,
    });

    await ipd.save();

    res.status(200).json({
      message: "Daily notes added",
      ipd,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function addCharges(req, res) {
  try {
    const { ipdId } = req.params;
    const { type, description, amount } = req.body;

    const ipd = await ipdModel.findById(ipdId);

    if (!ipd) {
      return res.status(404).json({ message: "IPD not found" });
    }

    ipd.charges.push({
      type,
      description,
      amount,
    });

    ipd.totalAmount += amount;

    await ipd.save();

    res.status(200).json({
      message: "Charge added",
      ipd,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function dischargePatient(req, res) {
  try {
    const { ipdId } = req.params;

    const ipd = await ipdModel.findById(ipdId);

    if (!ipd) {
      return res.status(404).json({ message: "IPD not found" });
    }

    if (ipd.status === "DISCHARGED") {
      return res.status(400).json({ message: "Already discharged" });
    }

    // 🔥 calculate days
    const admissionDate = new Date(ipd.admissionDate);
    const dischargeDate = new Date();

    const diffTime = dischargeDate - admissionDate;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // 🔥 bed charge
    const bedTotal = days * ipd.bedChargePerDay;

    // 🔥 add bed charge to billing
    ipd.charges.push({
      type: "BED",
      description: `${days} days stay`,
      amount: bedTotal,
    });

    ipd.totalAmount += bedTotal;

    // 🔥 update status
    ipd.status = "DISCHARGED";
    ipd.dischargeDate = dischargeDate;
    ipd.paymentStatus = "PAID"
    await ipd.save();

    // 🔥 FREE BED
    const bed = await bedModel.findById(ipd.bedId);
    if (bed) {
      bed.status = "VACANT";
      bed.patientId = null;
      await bed.save();
    }

    res.status(200).json({
      message: "Patient discharged",
      ipd,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function saveConsentFormData(req, res) {
  try {
    const { ipdId } = req.params;
    const hospitalId = req.user.hospitalId;
    const consentPayload = req.body;

    const ipd = await ipdModel.findById(ipdId);

    if (!ipd) {
      return res.status(404).json({ message: "IPD record not found" });
    }

    if (ipd.hospitalId.toString() !== hospitalId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    ipd.consentForm = consentPayload;
    await ipd.save();

    res.status(200).json({
      message: "Consent form saved successfully",
      consentForm: ipd.consentForm,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getConsentFormData(req, res) {
  try {
    const { ipdId } = req.params;
    const hospitalId = req.user.hospitalId;

    // Get IPD record with patient and doctor details
    const ipd = await ipdModel
      .findById(ipdId)
      .populate('patientId')
      .populate('doctorId', 'name')
      .populate('hospitalId');

    if (!ipd) {
      return res.status(404).json({ message: "IPD record not found" });
    }

    // Verify hospital ownership
    if (ipd.hospitalId._id.toString() !== hospitalId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Get hospital details
    const hospitalModel = require('../models/hospital.model');
    const hospital = await hospitalModel.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Format response with all required data
    const formData = {
      hospital: {
        name: hospital.name,
        logo: hospital.logo,
        registrationNumber: hospital.hospitalCode || '',
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
      },
      patient: {
        name: ipd.patientId?.name || '',
        uhid: ipd.uhid || '',
        address: ipd.patientId?.address || '',
        phone: ipd.patientId?.phone || '',
      },
      ipd: {
        ipdNumber: ipd.ipdNumber || '',
        admissionDate: ipd.admissionDate,
        diagnosis: ipd.diagnosis || '',
        doctorName: ipd.doctorId?.name || '',
      },
      consentForm: ipd.consentForm || null,
    };

    res.status(200).json({
      message: "Consent form data retrieved",
      data: formData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = { admitPatient, getAdmittedPatients, getDischargePatients, addDailyNotes, addCharges, dischargePatient, getConsentFormData, saveConsentFormData }