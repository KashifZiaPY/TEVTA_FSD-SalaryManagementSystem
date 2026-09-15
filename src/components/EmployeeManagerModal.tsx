import React, { useState, useEffect, useRef } from 'react';
import { 
  StaffMember, StaffType, EmployeeCategory, StaffStatus, Institute, SystemConfig 
} from '../types/payroll';
import { isValidBOPAccount } from '../utils/auditEngine';
import { 
  User, Upload, Trash2, Camera, ShieldCheck, AlertCircle, 
  Building2, CreditCard, DollarSign, Calendar, Phone, Mail, X, Check
} from 'lucide-react';

interface EmployeeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: StaffMember | null;
  defaultInstituteCode?: string;
  institutes: Institute[];
  config: SystemConfig;
  onSaveStaff: (staff: StaffMember) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80"
];

export const EmployeeManagerModal: React.FC<EmployeeManagerModalProps> = ({
  isOpen,
  onClose,
  staffToEdit,
  defaultInstituteCode,
  institutes,
  config,
  onSaveStaff
}) => {
  const isEditing = Boolean(staffToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [instituteCode, setInstituteCode] = useState<string>(defaultInstituteCode || '33028');
  const [staffType, setStaffType] = useState<StaffType>('Daily Wages');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [designation, setDesignation] = useState('');
  const [bps, setBps] = useState<number>(1);
  const [department, setDepartment] = useState('Admin');
  const [category, setCategory] = useState<EmployeeCategory>('Un-Skilled');
  const [joiningDate, setJoiningDate] = useState('2024-01-01');
  const [contractPeriod, setContractPeriod] = useState('89 Days');
  const [contractDaysElapsed, setContractDaysElapsed] = useState<number>(0);
  const [status, setStatus] = useState<StaffStatus>('Active');

  // Rates
  const [dailyRate, setDailyRate] = useState<number>(config.unskilledDailyRate);
  const [theoryHourlyRate, setTheoryHourlyRate] = useState<number>(config.defaultTheoryRate);
  const [practicalHourlyRate, setPracticalHourlyRate] = useState<number>(config.defaultPracticalRate);

  // Bank Info
  const [bankName, setBankName] = useState('Bank of Punjab');
  const [bankBranch, setBankBranch] = useState('BOP D-Ground Branch, Faisalabad');
  const [branchCode, setBranchCode] = useState('0723');
  const [bankAccount, setBankAccount] = useState('');

  // Additional Contact & Notes
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Auto populate on edit or open
  useEffect(() => {
    if (staffToEdit) {
      setInstituteCode(staffToEdit.instituteCode);
      setStaffType(staffToEdit.staffType);
      setName(staffToEdit.name);
      setFatherName(staffToEdit.fatherName || '');
      setCnic(staffToEdit.cnic);
      setDesignation(staffToEdit.designation);
      setBps(staffToEdit.bps || 1);
      setDepartment(staffToEdit.department || 'Admin');
      setCategory(staffToEdit.category || 'Un-Skilled');
      setJoiningDate(staffToEdit.joiningDate || '2024-01-01');
      setContractPeriod(staffToEdit.contractPeriod || '89 Days');
      setContractDaysElapsed(staffToEdit.contractDaysElapsed || 0);
      setStatus(staffToEdit.status || 'Active');
      setDailyRate(staffToEdit.dailyRate || (staffToEdit.category === 'Skilled' ? config.skilledDailyRate : config.unskilledDailyRate));
      setTheoryHourlyRate(staffToEdit.theoryHourlyRate || config.defaultTheoryRate);
      setPracticalHourlyRate(staffToEdit.practicalHourlyRate || config.defaultPracticalRate);
      setBankName(staffToEdit.bankName || 'Bank of Punjab');
      setBankBranch(staffToEdit.bankBranch || 'BOP Branch');
      setBranchCode(staffToEdit.branchCode || '0723');
      setBankAccount(staffToEdit.bankAccount || '');
      setPhone(staffToEdit.phone || '');
      setEmail(staffToEdit.email || '');
      setNotes(staffToEdit.notes || '');
      setPhotoUrl(staffToEdit.photoUrl || '');
    } else {
      // Defaults for new employee
      const initialInst = defaultInstituteCode || (institutes[0]?.code || '33028');
      setInstituteCode(initialInst);
      setStaffType('Daily Wages');
      setName('');
      setFatherName('');
      setCnic('');
      setDesignation('Naib Qasid');
      setBps(1);
      setDepartment('Admin');
      setCategory('Un-Skilled');
      setJoiningDate(new Date().toISOString().slice(0, 10));
      setContractPeriod('89 Days');
      setContractDaysElapsed(0);
      setStatus('Active');
      setDailyRate(config.unskilledDailyRate);
      setTheoryHourlyRate(config.defaultTheoryRate);
      setPracticalHourlyRate(config.defaultPracticalRate);
      setBankName('Bank of Punjab');
      setBankBranch('BOP Samanabad Branch, Faisalabad');
      setBranchCode('0219');
      setBankAccount('');
      setPhone('');
      setEmail('');
      setNotes('');
      setPhotoUrl(PRESET_AVATARS[0]);
    }
  }, [staffToEdit, defaultInstituteCode, isOpen, config, institutes]);

  // Adjust default rates when staffType or category changes
  const handleCategoryChange = (newCat: EmployeeCategory) => {
    setCategory(newCat);
    if (staffType === 'Daily Wages') {
      if (newCat === 'Skilled') setDailyRate(config.skilledDailyRate);
      else setDailyRate(config.unskilledDailyRate);
    }
  };

  const handleStaffTypeChange = (newType: StaffType) => {
    setStaffType(newType);
    if (newType === 'Daily Wages') {
      setDesignation(designation.includes('Instructor') ? 'Shop Assistant' : designation);
      setContractPeriod('89 Days');
      setBps(1);
      setDailyRate(category === 'Skilled' ? config.skilledDailyRate : config.unskilledDailyRate);
    } else {
      setDesignation(designation.startsWith('Instructor') ? designation : `Instructor (Visiting)`);
      setContractPeriod('6 Months');
      setBps(14);
      setCategory('Skilled');
      setTheoryHourlyRate(config.defaultTheoryRate);
      setPracticalHourlyRate(config.defaultPracticalRate);
    }
  };

  // CNIC Auto Formatter (xxxxx-xxxxxxx-x)
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 13) val = val.slice(0, 13);
    
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
    }
    setCnic(formatted);
  };

  // Bank Account Formatter (16 digit BOP only numbers)
  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    setBankAccount(val);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const currentInstObj = institutes.find(i => i.code === instituteCode);

    const savedStaff: StaffMember = {
      id: staffToEdit ? staffToEdit.id : `STF-${instituteCode}-${Date.now().toString().slice(-4)}`,
      instituteCode,
      instituteName: currentInstObj ? currentInstObj.shortName : instituteCode,
      staffType,
      name: name.trim(),
      fatherName: fatherName.trim(),
      cnic: cnic.trim() || '33100-0000000-0',
      designation: designation.trim() || (staffType === 'Daily Wages' ? 'Daily Wages Staff' : 'Visiting Instructor'),
      bps: Number(bps) || 1,
      department: department.trim() || 'Admin',
      category,
      joiningDate,
      contractPeriod,
      contractDaysElapsed: Number(contractDaysElapsed) || 0,
      dailyRate: Number(dailyRate) || 0,
      theoryHourlyRate: Number(theoryHourlyRate) || 0,
      practicalHourlyRate: Number(practicalHourlyRate) || 0,
      bankName: bankName.trim() || 'Bank of Punjab',
      bankBranch: bankBranch.trim() || 'BOP Branch',
      branchCode: branchCode.trim() || '0000',
      bankAccount: bankAccount.trim() || '5000000000000000',
      status,
      photoUrl: photoUrl || PRESET_AVATARS[0],
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim()
    };

    onSaveStaff(savedStaff);
    onClose();
  };

  if (!isOpen) return null;

  const isBopValid = isValidBOPAccount(bankAccount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                {isEditing ? 'Edit Employee Profile & Service Record' : 'Add New Non-Regular Employee'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                District Director Office TEVTA Faisalabad & Chiniot • SMS-DES
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Photo & Basic Identity */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              1. Employee Photo & Core Identification
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Avatar Frame */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Employee Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                
                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center gap-2 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Custom Photo"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      title="Remove Photo"
                      className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar Preset Selector */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Quick Select Executive Portrait / Avatar:
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Upload Device Image
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.slice(0, 8).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                        photoUrl === url 
                          ? 'border-indigo-600 dark:border-indigo-400 scale-105 shadow-md ring-2 ring-indigo-400/30' 
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Upload an official passport size photograph or select an executive avatar for official identity cards & bank registers.
                </p>
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Asif"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Father's / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abdul Ghafoor"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  CNIC Number (13-Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="33100-1234567-1"
                  value={cnic}
                  onChange={handleCnicChange}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Deployment & Service Details */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              2. Institutional Assignment & Designation
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Assigned TEVTA Campus <span className="text-rose-500">*</span>
                </label>
                <select
                  value={instituteCode}
                  onChange={(e) => setInstituteCode(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {institutes.map(inst => (
                    <option key={inst.code} value={inst.code}>
                      {inst.code} - {inst.shortName} ({inst.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Employment Stream <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleStaffTypeChange('Daily Wages')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      staffType === 'Daily Wages'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Daily Wages
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStaffTypeChange('Visiting Faculty')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      staffType === 'Visiting Faculty'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Visiting
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Worker Skill Category
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as EmployeeCategory)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Skilled">Skilled (Rs. 1,975/day / Instructors)</option>
                  <option value="Semi-Skilled">Semi-Skilled (Rs. 1,538/day)</option>
                  <option value="Un-Skilled">Un-Skilled (Rs. 1,538/day / Chowkidar/Naib Qasid)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Official Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Clerk / Instructor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Equivalent BPS Scale
                </label>
                <select
                  value={bps}
                  onChange={(e) => setBps(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17].map(scale => (
                    <option key={scale} value={scale}>BPS-{scale}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Department / Trade / Section
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical / Admin / Security"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Contract Tenure & Limits
                </label>
                <input
                  type="text"
                  placeholder="89 Days / 6 Months"
                  value={contractPeriod}
                  onChange={(e) => setContractPeriod(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Days Elapsed in Current Tenure
                </label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={contractDaysElapsed}
                  onChange={(e) => setContractDaysElapsed(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Service Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StaffStatus)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="Active">Active In-Service</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Relieved">Relieved / Resigned</option>
                  <option value="Expired">Tenure Expired</option>
                </select>
              </div>
            </div>

          </div>

          {/* Section 3: Financial Rates & Compensation */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              3. Approved Statutory Rates (PKR)
            </div>

            {staffType === 'Daily Wages' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Daily Wage Rate (PKR / Day) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    max={10000}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-emerald-400 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Standard: Unskilled (Rs. 1,538) • Skilled (Rs. 1,975)</p>
                </div>
                <div className="flex items-center p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-300">
                  <span>Debited directly from Punjab Govt Salaries Account (<strong>{config.tevtaDwAccount}</strong>).</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Theory Hourly Rate (PKR / Hr) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={5000}
                    value={theoryHourlyRate}
                    onChange={(e) => setTheoryHourlyRate(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-teal-400 focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Govt approved standard: Rs. 500 / contact hour</p>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Practical Hourly Rate (PKR / Hr) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={3000}
                    value={practicalHourlyRate}
                    onChange={(e) => setPracticalHourlyRate(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-teal-400 focus:outline-none focus:border-teal-500 text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Govt approved standard: Rs. 250 / practical hour</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Bank Details (16-Digit BOP Pipeline) */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              4. Bank of Punjab (BOP) Disbursement Pipeline
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Designated Bank
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Branch Name & Location
                </label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Branch Code (4-Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 0723"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                    16-Digit BOP Account Number <span className="text-rose-500">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    Length: <strong className={bankAccount.length === 16 ? 'text-emerald-500' : 'text-amber-500'}>{bankAccount.length}/16</strong>
                  </span>
                </div>
                
                <input
                  type="text"
                  required
                  placeholder="e.g. 6540289940500016"
                  value={bankAccount}
                  onChange={handleBankAccountChange}
                  className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2.5 font-mono text-sm tracking-wider text-slate-900 dark:text-white focus:outline-none ${
                    isBopValid 
                      ? 'border-emerald-500 focus:border-emerald-600 bg-emerald-50/20' 
                      : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />

                {isBopValid ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1.5">
                    <Check className="w-3.5 h-3.5" /> Valid 16-Digit BOP Electronic Account Format
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Enter full 16 digits for electronic Bank Advice dispatch without prefix/hyphens.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> Contact Mobile Number
              </label>
              <input
                type="text"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" /> Official / Personal Email
              </label>
              <input
                type="email"
                placeholder="staff.member@tevta.gop.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
              SMS-DES Corporate Registry Engine • Faisalabad & Chiniot
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isEditing ? 'Save Profile Changes' : 'Register New Employee'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
