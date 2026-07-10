import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAssessment } from '../lib/assessmentHelpers';
import {
  User,
  MessageSquare,
  Stethoscope,
  Heart,
  ClipboardList,
  Eye,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Check,
  Edit2,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  occupation: string;
}

interface SymptomDetail {
  startedWhen: string;
  severity: number;
  frequency: string;
  trend: string;
  notes: string;
}

interface LifestyleInfo {
  sleepHours: string;
  sleepQuality: string;
  waterIntake: string;
  exerciseDays: string;
  smoking: string;
  alcohol: string;
  dietType: string;
  screenTime: string;
  stressLevel: string;
}

interface MedicalHistory {
  diabetes: boolean;
  hypertension: boolean;
  heartDisease: boolean;
  asthma: boolean;
  thyroid: boolean;
  allergies: string;
  currentMedications: string;
  previousSurgeries: string;
}

interface FormData {
  personal: PersonalInfo;
  chiefComplaint: string;
  symptoms: string[];
  symptomDetails: Record<string, SymptomDetail>;
  lifestyle: LifestyleInfo;
  medicalHistory: MedicalHistory;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMPTOM_LIST = [
  'Headache', 'Fever', 'Fatigue', 'Cough', 'Shortness of breath',
  'Chest pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain',
  'Back pain', 'Joint pain', 'Muscle aches', 'Dizziness', 'Insomnia',
  'Sore throat', 'Runny nose', 'Nasal congestion', 'Ear pain', 'Eye redness',
  'Skin rash', 'Itching', 'Swelling', 'Numbness', 'Tingling',
  'Blurred vision', 'Heart palpitations', 'Excessive thirst', 'Frequent urination',
  'Weight loss', 'Weight gain', 'Hair loss', 'Night sweats', 'Loss of appetite',
  'Difficulty swallowing', 'Heartburn', 'Bloating', 'Constipation', 'Anxiety',
  'Depression', 'Memory problems', 'Confusion', 'Tremors', 'Weakness',
];

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Chief Complaint', icon: MessageSquare },
  { label: 'Symptom Details', icon: Stethoscope },
  { label: 'Lifestyle', icon: Heart },
  { label: 'Medical History', icon: ClipboardList },
  { label: 'Review', icon: Eye },
];

const DEFAULT_SYMPTOM_DETAIL: SymptomDetail = {
  startedWhen: '',
  severity: 5,
  frequency: '',
  trend: '',
  notes: '',
};

const INITIAL_FORM: FormData = {
  personal: { fullName: '', age: '', gender: '', height: '', weight: '', occupation: '' },
  chiefComplaint: '',
  symptoms: [],
  symptomDetails: {},
  lifestyle: {
    sleepHours: '', sleepQuality: '', waterIntake: '', exerciseDays: '',
    smoking: '', alcohol: '', dietType: '', screenTime: '', stressLevel: '',
  },
  medicalHistory: {
    diabetes: false, hypertension: false, heartDisease: false, asthma: false,
    thyroid: false, allergies: '', currentMedications: '', previousSurgeries: '',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );
}

function Input({
  value, onChange, placeholder = '', type = 'text', className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all ${className}`}
    />
  );
}

function Select({
  value, onChange, children, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all appearance-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

function Textarea({
  value, onChange, placeholder = '', rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all resize-none"
    />
  );
}

function Slider({
  value, onChange, min = 1, max = 10,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 font-medium">
        <span>Mild (1)</span>
        <span>Moderate (5)</span>
        <span>Severe (10)</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
        style={{
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-center">
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold shadow-md"
          style={{
            background: value <= 3
              ? '#10b981'
              : value <= 6
              ? '#f59e0b'
              : '#ef4444',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ToggleChip({
  label, checked, onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
        checked
          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
      }`}
    >
      {checked && <Check className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </button>
  );
}

// ─── Step 1 – Personal Information ──────────────────────────────────────────

function StepPersonal({ data, onChange }: { data: PersonalInfo; onChange: (d: PersonalInfo) => void }) {
  const set = (key: keyof PersonalInfo) => (val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FieldLabel required>Full Name</FieldLabel>
          <Input value={data.fullName} onChange={set('fullName')} placeholder="Enter your full name" />
        </div>
        <div>
          <FieldLabel required>Age</FieldLabel>
          <Input value={data.age} onChange={set('age')} placeholder="e.g. 28" type="number" />
        </div>
        <div>
          <FieldLabel required>Gender</FieldLabel>
          <Select value={data.gender} onChange={set('gender')} placeholder="Select gender">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </Select>
        </div>
        <div>
          <FieldLabel required>Height (cm)</FieldLabel>
          <Input value={data.height} onChange={set('height')} placeholder="e.g. 170" type="number" />
        </div>
        <div>
          <FieldLabel required>Weight (kg)</FieldLabel>
          <Input value={data.weight} onChange={set('weight')} placeholder="e.g. 70" type="number" />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Occupation <span className="text-gray-400 font-normal">(optional)</span></FieldLabel>
          <Input value={data.occupation} onChange={set('occupation')} placeholder="e.g. Software Engineer" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 – Chief Complaint ─────────────────────────────────────────────

function StepChiefComplaint({
  chiefComplaint, symptoms, onComplaintChange, onSymptomsChange,
}: {
  chiefComplaint: string;
  symptoms: string[];
  onComplaintChange: (v: string) => void;
  onSymptomsChange: (v: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = SYMPTOM_LIST.filter(
    (s) => s.toLowerCase().includes(query.toLowerCase()) && !symptoms.includes(s),
  );

  const add = (s: string) => {
    onSymptomsChange([...symptoms, s]);
    setQuery('');
  };

  const remove = (s: string) => onSymptomsChange(symptoms.filter((x) => x !== s));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel required>What is your primary health concern today?</FieldLabel>
        <Textarea
          value={chiefComplaint}
          onChange={onComplaintChange}
          placeholder="Describe your main health concern in your own words…"
          rows={4}
        />
      </div>

      <div>
        <FieldLabel required>Search &amp; Select Symptoms</FieldLabel>
        <div className="relative" ref={containerRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Type to search symptoms…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>

          {open && filtered.length > 0 && (
            <div className="absolute z-30 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden max-h-56 overflow-y-auto animate-fadeIn">
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); add(s); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {symptoms.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
            Selected symptoms ({symptoms.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium px-3 py-1.5 rounded-lg"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => remove(s)}
                  className="text-emerald-500 hover:text-rose-500 transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {symptoms.length === 0 && (
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Please select at least one symptom to continue.</span>
        </div>
      )}
    </div>
  );
}

// ─── Step 3 – Symptom Details ─────────────────────────────────────────────

function StepSymptomDetails({
  symptoms, details, onChange,
}: {
  symptoms: string[];
  details: Record<string, SymptomDetail>;
  onChange: (d: Record<string, SymptomDetail>) => void;
}) {
  const [active, setActive] = useState(symptoms[0] ?? '');

  const setField = (symptom: string, key: keyof SymptomDetail) => (val: string | number) => {
    onChange({
      ...details,
      [symptom]: { ...(details[symptom] ?? DEFAULT_SYMPTOM_DETAIL), [key]: val },
    });
  };

  const d = (s: string) => details[s] ?? DEFAULT_SYMPTOM_DETAIL;

  return (
    <div className="space-y-5">
      {/* Symptom tab pills */}
      <div className="flex flex-wrap gap-2">
        {symptoms.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active === s
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {active && (
        <div key={active} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-5 animate-fadeIn">
          <h3 className="text-base font-semibold text-gray-800">
            Details for: <span className="text-emerald-600">{active}</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>When did it start?</FieldLabel>
              <Select value={d(active).startedWhen} onChange={setField(active, 'startedWhen')} placeholder="Select duration">
                <option value="today">Today</option>
                <option value="1-3-days">1–3 days ago</option>
                <option value="4-7-days">4–7 days ago</option>
                <option value="1-2-weeks">1–2 weeks ago</option>
                <option value="2-4-weeks">2–4 weeks ago</option>
                <option value="1-3-months">1–3 months ago</option>
                <option value="3-plus-months">More than 3 months</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Frequency</FieldLabel>
              <Select value={d(active).frequency} onChange={setField(active, 'frequency')} placeholder="Select frequency">
                <option value="constant">Constant</option>
                <option value="multiple-daily">Multiple times a day</option>
                <option value="once-daily">Once a day</option>
                <option value="few-weekly">A few times a week</option>
                <option value="occasional">Occasionally</option>
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel>Severity (1 = mild, 10 = severe)</FieldLabel>
            <Slider value={d(active).severity} onChange={setField(active, 'severity') as (v: number) => void} />
          </div>

          <div>
            <FieldLabel>Is it improving or worsening?</FieldLabel>
            <div className="flex gap-3 flex-wrap">
              {['Improving', 'Stable', 'Worsening', 'Fluctuating'].map((opt) => (
                <ToggleChip
                  key={opt}
                  label={opt}
                  checked={d(active).trend === opt}
                  onChange={(checked) => setField(active, 'trend')(checked ? opt : '')}
                />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Additional notes</FieldLabel>
            <Textarea
              value={d(active).notes}
              onChange={setField(active, 'notes') as (v: string) => void}
              placeholder="Any other details about this symptom…"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 – Lifestyle Assessment ───────────────────────────────────────────

function StepLifestyle({ data, onChange }: { data: LifestyleInfo; onChange: (d: LifestyleInfo) => void }) {
  const set = (key: keyof LifestyleInfo) => (val: string) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Sleep Hours / night</FieldLabel>
          <Select value={data.sleepHours} onChange={set('sleepHours')} placeholder="Select range">
            <option value="less-4">Less than 4h</option>
            <option value="4-5">4–5h</option>
            <option value="5-6">5–6h</option>
            <option value="6-7">6–7h</option>
            <option value="7-8">7–8h</option>
            <option value="8-9">8–9h</option>
            <option value="9-plus">More than 9h</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Sleep Quality</FieldLabel>
          <Select value={data.sleepQuality} onChange={set('sleepQuality')} placeholder="Select quality">
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="very-poor">Very Poor</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Water Intake</FieldLabel>
          <Select value={data.waterIntake} onChange={set('waterIntake')} placeholder="Select intake">
            <option value="less-1L">Less than 1L</option>
            <option value="1-2L">1–2L</option>
            <option value="2-3L">2–3L</option>
            <option value="3-plus">More than 3L</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Exercise Days / week</FieldLabel>
          <Select value={data.exerciseDays} onChange={set('exerciseDays')} placeholder="Select frequency">
            <option value="0">None</option>
            <option value="1-2">1–2 days</option>
            <option value="3-4">3–4 days</option>
            <option value="5-6">5–6 days</option>
            <option value="7">Every day</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Smoking</FieldLabel>
          <Select value={data.smoking} onChange={set('smoking')} placeholder="Select option">
            <option value="never">Never smoked</option>
            <option value="former">Former smoker</option>
            <option value="occasional">Occasional</option>
            <option value="regular">Regular smoker</option>
            <option value="heavy">Heavy smoker</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Alcohol Consumption</FieldLabel>
          <Select value={data.alcohol} onChange={set('alcohol')} placeholder="Select option">
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="social">Social drinker</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Diet Type</FieldLabel>
          <Select value={data.dietType} onChange={set('dietType')} placeholder="Select diet">
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto / Low-carb</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Daily Screen Time</FieldLabel>
          <Select value={data.screenTime} onChange={set('screenTime')} placeholder="Select range">
            <option value="less-2h">Less than 2h</option>
            <option value="2-4h">2–4h</option>
            <option value="4-6h">4–6h</option>
            <option value="6-8h">6–8h</option>
            <option value="8-plus">More than 8h</option>
          </Select>
        </div>
      </div>

      <div>
        <FieldLabel>Stress Level</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Very Low', val: 'very-low' },
            { label: 'Low', val: 'low' },
            { label: 'Moderate', val: 'moderate' },
            { label: 'High', val: 'high' },
            { label: 'Very High', val: 'very-high' },
          ].map(({ label, val }) => (
            <ToggleChip
              key={val}
              label={label}
              checked={data.stressLevel === val}
              onChange={(checked) => onChange({ ...data, stressLevel: checked ? val : '' })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 – Medical History ─────────────────────────────────────────────

function StepMedicalHistory({
  data, onChange,
}: {
  data: MedicalHistory;
  onChange: (d: MedicalHistory) => void;
}) {
  const toggle = (key: keyof Pick<MedicalHistory, 'diabetes' | 'hypertension' | 'heartDisease' | 'asthma' | 'thyroid'>) =>
    onChange({ ...data, [key]: !data[key] });
  const setStr = (key: keyof MedicalHistory) => (val: string) => onChange({ ...data, [key]: val });

  const CONDITIONS: { key: keyof Pick<MedicalHistory, 'diabetes' | 'hypertension' | 'heartDisease' | 'asthma' | 'thyroid'>; label: string }[] = [
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'hypertension', label: 'Hypertension' },
    { key: 'heartDisease', label: 'Heart Disease' },
    { key: 'asthma', label: 'Asthma' },
    { key: 'thyroid', label: 'Thyroid Disorder' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Pre-existing Conditions</FieldLabel>
        <p className="text-xs text-gray-500 mb-3">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(({ key, label }) => (
            <ToggleChip key={key} label={label} checked={data[key]} onChange={() => toggle(key)} />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Known Allergies</FieldLabel>
        <Textarea
          value={data.allergies}
          onChange={setStr('allergies') as (v: string) => void}
          placeholder="e.g. Penicillin, pollen, peanuts…"
          rows={2}
        />
      </div>

      <div>
        <FieldLabel>Current Medications</FieldLabel>
        <Textarea
          value={data.currentMedications}
          onChange={setStr('currentMedications') as (v: string) => void}
          placeholder="List any medications you are currently taking…"
          rows={2}
        />
      </div>

      <div>
        <FieldLabel>Previous Surgeries or Hospitalizations</FieldLabel>
        <Textarea
          value={data.previousSurgeries}
          onChange={setStr('previousSurgeries') as (v: string) => void}
          placeholder="e.g. Appendectomy (2018), knee surgery (2021)…"
          rows={2}
        />
      </div>
    </div>
  );
}

// ─── Step 6 – Review ──────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 font-medium flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}

function ReviewSection({
  title, icon: Icon, stepIndex, onEdit, children,
}: {
  title: string;
  icon: React.ElementType;
  stepIndex: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>
      {children}
    </div>
  );
}

function StepReview({ form, onEdit }: { form: FormData; onEdit: (step: number) => void }) {
  const { personal, chiefComplaint, symptoms, symptomDetails, lifestyle, medicalHistory } = form;

  const fmt = (val: string) => val || '—';
  

  const conditions = ['diabetes', 'hypertension', 'heartDisease', 'asthma', 'thyroid'] as const;
  const activeConditions = conditions.filter((c) => medicalHistory[c]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Please review your information before submitting. You can edit any section by clicking the Edit button.
      </p>

      {/* Personal */}
      <ReviewSection title="Personal Information" icon={User} stepIndex={0} onEdit={onEdit}>
        <ReviewRow label="Full Name" value={fmt(personal.fullName)} />
        <ReviewRow label="Age" value={personal.age ? `${personal.age} years` : '—'} />
        <ReviewRow label="Gender" value={fmt(personal.gender)} />
        <ReviewRow label="Height" value={personal.height ? `${personal.height} cm` : '—'} />
        <ReviewRow label="Weight" value={personal.weight ? `${personal.weight} kg` : '—'} />
        {personal.occupation && <ReviewRow label="Occupation" value={personal.occupation} />}
      </ReviewSection>

      {/* Chief Complaint */}
      <ReviewSection title="Chief Complaint" icon={MessageSquare} stepIndex={1} onEdit={onEdit}>
        <ReviewRow label="Primary Concern" value={fmt(chiefComplaint)} />
        <ReviewRow
          label="Symptoms"
          value={symptoms.length > 0
            ? <div className="flex flex-wrap gap-1.5 justify-end">{symptoms.map(s => (
                <span key={s} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-md">{s}</span>
              ))}</div>
            : '—'
          }
        />
      </ReviewSection>

      {/* Symptom Details */}
      {symptoms.length > 0 && (
        <ReviewSection title="Symptom Details" icon={Stethoscope} stepIndex={2} onEdit={onEdit}>
          {symptoms.map((s) => {
            const d = symptomDetails[s] ?? DEFAULT_SYMPTOM_DETAIL;
            return (
              <div key={s} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-emerald-700 mb-1.5">{s}</p>
                <ReviewRow label="Started" value={fmt(d.startedWhen)} />
                <ReviewRow label="Severity" value={`${d.severity}/10`} />
                <ReviewRow label="Frequency" value={fmt(d.frequency)} />
                <ReviewRow label="Trend" value={fmt(d.trend)} />
                {d.notes && <ReviewRow label="Notes" value={d.notes} />}
              </div>
            );
          })}
        </ReviewSection>
      )}

      {/* Lifestyle */}
      <ReviewSection title="Lifestyle" icon={Heart} stepIndex={3} onEdit={onEdit}>
        <ReviewRow label="Sleep" value={lifestyle.sleepHours ? `${lifestyle.sleepHours} (${lifestyle.sleepQuality || 'quality not specified'})` : '—'} />
        <ReviewRow label="Water Intake" value={fmt(lifestyle.waterIntake)} />
        <ReviewRow label="Exercise" value={lifestyle.exerciseDays ? `${lifestyle.exerciseDays} days/week` : '—'} />
        <ReviewRow label="Smoking" value={fmt(lifestyle.smoking)} />
        <ReviewRow label="Alcohol" value={fmt(lifestyle.alcohol)} />
        <ReviewRow label="Diet" value={fmt(lifestyle.dietType)} />
        <ReviewRow label="Screen Time" value={fmt(lifestyle.screenTime)} />
        <ReviewRow label="Stress Level" value={fmt(lifestyle.stressLevel)} />
      </ReviewSection>

      {/* Medical History */}
      <ReviewSection title="Medical History" icon={ClipboardList} stepIndex={4} onEdit={onEdit}>
        <ReviewRow
          label="Conditions"
          value={activeConditions.length > 0
            ? activeConditions.map(c => medicalHistory[c] && c.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())).filter(Boolean).join(', ')
            : 'None reported'
          }
        />
        <ReviewRow label="Allergies" value={medicalHistory.allergies || 'None'} />
        <ReviewRow label="Medications" value={medicalHistory.currentMedications || 'None'} />
        <ReviewRow label="Previous Surgeries" value={medicalHistory.previousSurgeries || 'None'} />
      </ReviewSection>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const pct = ((currentStep) / (totalSteps - 1)) * 100;
  return (
    <div className="mb-8">
      {/* Step labels – desktop */}
      <div className="hidden md:flex items-center justify-between mb-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <div key={idx} className="flex flex-col items-center space-y-1.5 flex-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  done
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : active
                    ? 'bg-white border-2 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  active ? 'text-emerald-700' : done ? 'text-emerald-500' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Connecting bar */}
      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Mobile step indicator */}
      <div className="flex md:hidden items-center justify-between mt-2">
        <span className="text-xs font-semibold text-emerald-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs text-gray-500 font-medium">{STEPS[currentStep].label}</span>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function SymptomChecker() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const routerNavigate = useNavigate();

  const navigate = (next: number) => {
    if (animating) return;
    setDirection(next > step ? 'forward' : 'back');
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const canAdvance = () => {
    if (step === 0) {
      const p = form.personal;
      return p.fullName && p.age && p.gender && p.height && p.weight;
    }
    if (step === 1) {
      return form.chiefComplaint.trim() && form.symptoms.length > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitAssessment(form);
      routerNavigate('/results', {
        state: {
          assessmentId: result.assessmentId,
          healthScore: result.healthScore,
          bmi: result.bmi,
          riskLevel: result.riskLevel,
          condition: result.condition,
          confidence: result.confidence,
          recommendations: result.recommendations,
          symptoms: form.symptoms,
          fullName: form.personal.fullName,
          age: form.personal.age,
          gender: form.personal.gender,
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TOTAL = STEPS.length;

  const stepTitles = [
    'Tell us about yourself',
    "What's bothering you?",
    'Describe your symptoms',
    'Your lifestyle habits',
    'Your medical background',
    'Review your answers',
  ];

  const stepSubtitles = [
    'We need a few basic details to personalize your assessment.',
    'Describe your main concern and select the symptoms you are experiencing.',
    'Help us understand each symptom better by providing more detail.',
    'Your daily habits have a significant impact on your health.',
    'Your medical history helps us give you a more accurate assessment.',
    'Take a moment to verify everything before we analyze your health profile.',
  ];

  if (submitted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <span className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Health Assessment</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{stepTitles[step]}</h1>
          <p className="text-gray-500 text-sm mt-1">{stepSubtitles[step]}</p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={step} totalSteps={TOTAL} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            ref={contentRef}
            className={`p-6 sm:p-8 transition-all duration-200 ${
              animating
                ? direction === 'forward'
                  ? 'opacity-0 translate-x-4'
                  : 'opacity-0 -translate-x-4'
                : 'opacity-100 translate-x-0'
            }`}
            style={{ transform: animating ? (direction === 'forward' ? 'translateX(12px)' : 'translateX(-12px)') : 'translateX(0)' }}
          >
            {step === 0 && (
              <StepPersonal
                data={form.personal}
                onChange={(p) => setForm({ ...form, personal: p })}
              />
            )}
            {step === 1 && (
              <StepChiefComplaint
                chiefComplaint={form.chiefComplaint}
                symptoms={form.symptoms}
                onComplaintChange={(v) => setForm({ ...form, chiefComplaint: v })}
                onSymptomsChange={(v) => {
                  const existing = { ...form.symptomDetails };
                  v.forEach((s) => { if (!existing[s]) existing[s] = { ...DEFAULT_SYMPTOM_DETAIL }; });
                  setForm({ ...form, symptoms: v, symptomDetails: existing });
                }}
              />
            )}
            {step === 2 && (
              <StepSymptomDetails
                symptoms={form.symptoms}
                details={form.symptomDetails}
                onChange={(d) => setForm({ ...form, symptomDetails: d })}
              />
            )}
            {step === 3 && (
              <StepLifestyle
                data={form.lifestyle}
                onChange={(l) => setForm({ ...form, lifestyle: l })}
              />
            )}
            {step === 4 && (
              <StepMedicalHistory
                data={form.medicalHistory}
                onChange={(m) => setForm({ ...form, medicalHistory: m })}
              />
            )}
            {step === 5 && (
              <StepReview form={form} onEdit={(s) => navigate(s)} />
            )}
          </div>

          {/* Footer Nav */}
          <div className="px-6 sm:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
            <button
              type="button"
              onClick={() => navigate(step - 1)}
              disabled={step === 0}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm
                hover:bg-white hover:border-gray-300 hover:text-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-gray-400 font-medium hidden sm:block">
              {step + 1} / {TOTAL}
            </span>

            {step < TOTAL - 1 ? (
              <button
                type="button"
                onClick={() => navigate(step + 1)}
                disabled={!canAdvance()}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm
                  shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm
                  shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Assessment</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {submitError && (
          <div className="mt-4 flex items-start space-x-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

      </div>
    </div>
  );
}
