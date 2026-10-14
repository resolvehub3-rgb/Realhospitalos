import React, { useState, useEffect } from 'react';
import { X, UserPlus, Heart, Stethoscope, Building, AlertTriangle, Phone, Activity } from 'lucide-react';
import { Patient } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface PatientAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdmitted?: () => void;
}

export const PatientAdmissionModal: React.FC<PatientAdmissionModalProps> = ({
  isOpen,
  onClose,
  onPatientAdmitted,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(36);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('+1 555-');
  const [department, setDepartment] = useState('General Medicine');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Sarah Vance');
  const [triageLevel, setTriageLevel] = useState<Patient['triage_level']>('Urgent');
  const [bedAssigned, setBedAssigned] = useState('MED-204');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('No known drug allergies (NKDA)');
  const [createEncounter, setCreateEncounter] = useState(true);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || fullName.trim().length < 3) {
      setDuplicateWarning(null);
      return;
    }
    const matches = hospitalDataService.findPatientDuplicates(fullName, phone);
    if (matches.length > 0) {
      setDuplicateWarning(`Potential Duplicate: An existing record for "${matches[0].full_name}" is registered under ${matches[0].mrn} (${matches[0].department}).`);
    } else {
      setDuplicateWarning(null);
    }
  }, [fullName, phone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const result = await hospitalDataService.addPatient(
      {
        full_name: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        department,
        status: 'Admitted',
        triage_level: triageLevel,
        bed_assigned: bedAssigned,
        attending_doctor: attendingDoctor,
        blood_type: bloodType,
        known_allergies: allergies ? [allergies] : [],
        admission_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vital_signs: {
          heart_rate: 76,
          blood_pressure: '120/80',
          sp_o2: 99,
          temperature_c: 36.8,
        },
      },
      createEncounter
    );

    if (!result.success) {
      return;
    }

    if (onPatientAdmitted) onPatientAdmitted();
    onClose();
    setFullName('');
    setPhone('+1 555-');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#071D30] border border-[#23D5F4]/80 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#145B89]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#23D5F4]" />
              <span>Main Entrance — Patient Intake & Identity</span>
            </h2>
            <p className="text-xs text-[#718BA5] mt-0.5">
              Unique MRN issuance, duplicate identity check, and immediate encounter linkage
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {duplicateWarning && (
          <div className="mt-2.5 p-3 rounded-xl bg-[#3A1E14] border border-[#FF873D] text-xs text-[#FF873D] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{duplicateWarning}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-3 overflow-y-auto flex-1 pr-1 text-xs">
          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1">Patient Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Cassandra Morgan"
              className="w-full px-3.5 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-[#F1F7FF] outline-none"
              >
                <option value="O+">O+</option>
                <option value="O-">O- (Universal)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#23D5F4]" />
              <span>Contact Telephone / Emergency Phone</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-[#F1F7FF] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Admitting Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Radiology">Radiology</option>
                <option value="Intensive Care">Intensive Care</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Attending Clinician</label>
              <select
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              >
                <option value="Dr. Sarah Vance">Dr. Sarah Vance (Internal Med)</option>
                <option value="Dr. David Mercer">Dr. David Mercer (Cardiology)</option>
                <option value="Dr. Emily Lin">Dr. Emily Lin (Pediatrics)</option>
                <option value="Dr. Anthony Adams">Dr. Anthony Adams (Orthopedics)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Assigned Bed Code</label>
              <input
                type="text"
                value={bedAssigned}
                onChange={(e) => setBedAssigned(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[#A7BED3] font-semibold mb-1">Triage Acuity</label>
              <select
                value={triageLevel}
                onChange={(e) => setTriageLevel(e.target.value as Patient['triage_level'])}
                className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              >
                <option value="Immediate">Immediate (Red)</option>
                <option value="Emergent">Emergent (Orange)</option>
                <option value="Urgent">Urgent (Yellow)</option>
                <option value="Semi-Urgent">Semi-Urgent (Green)</option>
                <option value="Non-Urgent">Non-Urgent (Blue)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#A7BED3] font-semibold mb-1">Known Allergies / Alerts</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="createEnc"
              checked={createEncounter}
              onChange={(e) => setCreateEncounter(e.target.checked)}
              className="rounded border-[#145B89] text-[#087FC7] focus:ring-[#23D5F4]"
            />
            <label htmlFor="createEnc" className="text-xs text-[#A7BED3] cursor-pointer">
              Automatically initialize clinical encounter documentation for this admission
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#145B89]/70">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#145B89] text-xs font-medium text-[#A7BED3] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] text-white text-xs font-semibold shadow-[0_0_15px_rgba(39,185,255,0.4)] transition-all cursor-pointer"
            >
              Register & Admit Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
