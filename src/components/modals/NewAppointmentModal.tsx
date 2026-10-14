import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Building, Stethoscope, MapPin, AlertTriangle } from 'lucide-react';
import { Appointment } from '../../types/hospital';
import { hospitalDataService } from '../../services/hospitalDataService';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated?: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentCreated,
}) => {
  const data = hospitalDataService.getData();
  const [patientName, setPatientName] = useState('');
  const [patientMrn, setPatientMrn] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [doctorName, setDoctorName] = useState('Dr. David Mercer');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [date, setDate] = useState('2026-09-15');
  const [appointmentType, setAppointmentType] = useState('Cardiology Consultation');
  const [room, setRoom] = useState('Clinic 2B');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const conflict = hospitalDataService.checkAppointmentConflict(doctorName, date, scheduledTime);
    if (conflict) {
      setConflictWarning(`Schedule Conflict: ${doctorName} is already booked with ${conflict.patient_name} (${conflict.appointment_type}) at ${scheduledTime}.`);
    } else {
      setConflictWarning(null);
    }
  }, [doctorName, date, scheduledTime, isOpen]);

  if (!isOpen) return null;

  const handleSelectExistingPatient = (mrn: string) => {
    const p = data.patientsList.find((item) => item.mrn === mrn);
    if (p) {
      setPatientName(p.full_name);
      setPatientMrn(p.mrn);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setErrorMessage(null);

    const result = await hospitalDataService.addAppointment({
      patient_name: patientName.trim(),
      patient_mrn: patientMrn || undefined,
      department,
      doctor_name: doctorName,
      scheduled_time: scheduledTime,
      date,
      appointment_type: appointmentType,
      status: 'Scheduled',
      room,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to schedule appointment due to validation failure.');
      return;
    }

    if (onAppointmentCreated) onAppointmentCreated();
    onClose();
    setPatientName('');
    setPatientMrn('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#071D30] border border-[#27B9FF]/70 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#145B89]">
          <div>
            <h2 className="text-lg font-bold text-[#F1F7FF] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#23D5F4]" />
              <span>Schedule Patient Appointment</span>
            </h2>
            <p className="text-xs text-[#718BA5] mt-0.5">
              Enforces server-side calendar conflict prevention and patient linkage
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#718BA5] hover:text-white hover:bg-[#051625]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-[#3A1414] border border-[#FF634D] text-xs text-[#FF634D] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {conflictWarning && (
          <div className="mt-3 p-3 rounded-xl bg-[#3A1E14] border border-[#FF873D] text-xs text-[#FF873D] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{conflictWarning}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
          {/* Quick pick from registered patients */}
          <div>
            <label className="block text-[11px] font-medium text-[#718BA5] mb-1">
              Select Registered Patient (or enter new below)
            </label>
            <select
              value={patientMrn}
              onChange={(e) => handleSelectExistingPatient(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#051625] border border-[#145B89] text-xs text-[#A7BED3] outline-none"
            >
              <option value="">-- Choose Existing Patient Record --</option>
              {data.patientsList.map((p) => (
                <option key={p.mrn} value={p.mrn}>
                  {p.full_name} ({p.mrn}) · {p.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#23D5F4]" />
              <span>Patient Full Name</span>
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Samuel K. Jackson"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#23D5F4]" />
                <span>Department</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              >
                <option value="General Consultation">General Consultation</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Radiology">Radiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Emergency">Emergency Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#23D5F4]" />
                <span>Attending Clinician</span>
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              >
                <option value="Dr. David Mercer">Dr. David Mercer (Cardiology)</option>
                <option value="Dr. Sarah Vance">Dr. Sarah Vance (Internal Med)</option>
                <option value="Dr. Emily Lin">Dr. Emily Lin (Pediatrics)</option>
                <option value="Dr. Anthony Adams">Dr. Anthony Adams (Orthopedics)</option>
                <option value="Dr. Priya Patel">Dr. Priya Patel (Radiology)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#23D5F4]" />
                <span>Time Slot</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-[#F1F7FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#23D5F4]" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs font-mono text-[#F1F7FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7BED3] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#23D5F4]" />
                <span>Room / Lab</span>
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A7BED3] mb-1">
              Consultation Purpose / Procedure
            </label>
            <input
              type="text"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              placeholder="e.g. Echocardiogram & Stress Test"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#051625] border border-[#145B89] focus:border-[#23D5F4] text-xs text-[#F1F7FF] outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#145B89]/70">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#145B89] hover:bg-[#051625] text-xs font-medium text-[#A7BED3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(conflictWarning)}
              className="px-5 py-2 rounded-xl bg-[#087FC7] hover:bg-[#27B9FF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-[0_0_15px_rgba(39,185,255,0.4)] transition-all cursor-pointer"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
