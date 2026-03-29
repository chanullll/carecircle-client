export const MEDICINES_DB = [
  // Diabetes
  { name: 'Metformin', category: 'Diabetes', emoji: '🩸', dosages: ['500mg', '850mg', '1000mg'], instructions: 'After meals', sideEffects: 'Nausea, stomach upset' },
  { name: 'Glibenclamide', category: 'Diabetes', emoji: '🩸', dosages: ['2.5mg', '5mg'], instructions: 'Before meals', sideEffects: 'Hypoglycemia' },
  { name: 'Insulin', category: 'Diabetes', emoji: '💉', dosages: ['10 units', '20 units', '30 units'], instructions: 'Before meals', sideEffects: 'Hypoglycemia, injection site reaction' },
  { name: 'Glimepiride', category: 'Diabetes', emoji: '🩸', dosages: ['1mg', '2mg', '4mg'], instructions: 'With breakfast', sideEffects: 'Hypoglycemia' },
  { name: 'Sitagliptin', category: 'Diabetes', emoji: '🩸', dosages: ['50mg', '100mg'], instructions: 'With or without food', sideEffects: 'Headache, cold symptoms' },

  // Blood Pressure
  { name: 'Amlodipine', category: 'Blood Pressure', emoji: '❤️', dosages: ['2.5mg', '5mg', '10mg'], instructions: 'Once daily', sideEffects: 'Swelling, dizziness' },
  { name: 'Lisinopril', category: 'Blood Pressure', emoji: '❤️', dosages: ['5mg', '10mg', '20mg'], instructions: 'Once daily', sideEffects: 'Dry cough, dizziness' },
  { name: 'Atenolol', category: 'Blood Pressure', emoji: '❤️', dosages: ['25mg', '50mg', '100mg'], instructions: 'Once daily', sideEffects: 'Fatigue, cold hands' },
  { name: 'Losartan', category: 'Blood Pressure', emoji: '❤️', dosages: ['25mg', '50mg', '100mg'], instructions: 'Once daily', sideEffects: 'Dizziness, back pain' },
  { name: 'Hydrochlorothiazide', category: 'Blood Pressure', emoji: '❤️', dosages: ['12.5mg', '25mg'], instructions: 'Morning', sideEffects: 'Frequent urination' },
  { name: 'Nifedipine', category: 'Blood Pressure', emoji: '❤️', dosages: ['10mg', '20mg', '30mg'], instructions: 'Twice daily', sideEffects: 'Headache, flushing' },

  // Cholesterol
  { name: 'Atorvastatin', category: 'Cholesterol', emoji: '🫀', dosages: ['10mg', '20mg', '40mg', '80mg'], instructions: 'Evening', sideEffects: 'Muscle pain, liver issues' },
  { name: 'Simvastatin', category: 'Cholesterol', emoji: '🫀', dosages: ['10mg', '20mg', '40mg'], instructions: 'Evening', sideEffects: 'Muscle pain' },
  { name: 'Rosuvastatin', category: 'Cholesterol', emoji: '🫀', dosages: ['5mg', '10mg', '20mg'], instructions: 'Any time', sideEffects: 'Muscle pain, headache' },

  // Pain Relief
  { name: 'Paracetamol', category: 'Pain Relief', emoji: '💊', dosages: ['500mg', '1000mg'], instructions: 'Every 4-6 hours as needed', sideEffects: 'Liver damage if overdose' },
  { name: 'Ibuprofen', category: 'Pain Relief', emoji: '💊', dosages: ['200mg', '400mg', '600mg'], instructions: 'After meals', sideEffects: 'Stomach upset, kidney issues' },
  { name: 'Aspirin', category: 'Pain Relief', emoji: '💊', dosages: ['75mg', '150mg', '300mg'], instructions: 'After meals', sideEffects: 'Stomach bleeding' },
  { name: 'Diclofenac', category: 'Pain Relief', emoji: '💊', dosages: ['25mg', '50mg', '75mg'], instructions: 'After meals', sideEffects: 'Stomach upset' },
  { name: 'Tramadol', category: 'Pain Relief', emoji: '💊', dosages: ['50mg', '100mg'], instructions: 'Every 6 hours', sideEffects: 'Dizziness, nausea' },

  // Antibiotics
  { name: 'Amoxicillin', category: 'Antibiotic', emoji: '🦠', dosages: ['250mg', '500mg', '1000mg'], instructions: 'Every 8 hours', sideEffects: 'Diarrhea, rash' },
  { name: 'Ciprofloxacin', category: 'Antibiotic', emoji: '🦠', dosages: ['250mg', '500mg'], instructions: 'Twice daily', sideEffects: 'Tendon damage, nausea' },
  { name: 'Azithromycin', category: 'Antibiotic', emoji: '🦠', dosages: ['250mg', '500mg'], instructions: 'Once daily', sideEffects: 'Stomach upset' },
  { name: 'Clarithromycin', category: 'Antibiotic', emoji: '🦠', dosages: ['250mg', '500mg'], instructions: 'Twice daily', sideEffects: 'Stomach upset, taste changes' },

  // Heart
  { name: 'Warfarin', category: 'Heart', emoji: '🫀', dosages: ['1mg', '2mg', '5mg'], instructions: 'Same time daily', sideEffects: 'Bleeding risk' },
  { name: 'Clopidogrel', category: 'Heart', emoji: '🫀', dosages: ['75mg'], instructions: 'Once daily', sideEffects: 'Bleeding' },
  { name: 'Digoxin', category: 'Heart', emoji: '🫀', dosages: ['0.125mg', '0.25mg'], instructions: 'Once daily', sideEffects: 'Nausea, vision changes' },
  { name: 'Bisoprolol', category: 'Heart', emoji: '🫀', dosages: ['2.5mg', '5mg', '10mg'], instructions: 'Morning', sideEffects: 'Fatigue, cold hands' },

  // Stomach
  { name: 'Omeprazole', category: 'Stomach', emoji: '🫃', dosages: ['10mg', '20mg', '40mg'], instructions: 'Before breakfast', sideEffects: 'Headache, diarrhea' },
  { name: 'Pantoprazole', category: 'Stomach', emoji: '🫃', dosages: ['20mg', '40mg'], instructions: 'Before meals', sideEffects: 'Headache' },
  { name: 'Ranitidine', category: 'Stomach', emoji: '🫃', dosages: ['150mg', '300mg'], instructions: 'Twice daily', sideEffects: 'Headache' },
  { name: 'Domperidone', category: 'Stomach', emoji: '🫃', dosages: ['10mg'], instructions: 'Before meals', sideEffects: 'Dry mouth' },
  { name: 'Metoclopramide', category: 'Stomach', emoji: '🫃', dosages: ['10mg'], instructions: 'Before meals', sideEffects: 'Drowsiness' },

  // Thyroid
  { name: 'Levothyroxine', category: 'Thyroid', emoji: '🦋', dosages: ['25mcg', '50mcg', '100mcg', '150mcg'], instructions: 'Empty stomach, morning', sideEffects: 'Heart palpitations if overdose' },
  { name: 'Carbimazole', category: 'Thyroid', emoji: '🦋', dosages: ['5mg', '10mg', '20mg'], instructions: 'With meals', sideEffects: 'Rash, joint pain' },

  // Respiratory
  { name: 'Salbutamol', category: 'Respiratory', emoji: '🫁', dosages: ['2mg', '4mg', '100mcg inhaler'], instructions: 'As needed', sideEffects: 'Tremor, rapid heartbeat' },
  { name: 'Montelukast', category: 'Respiratory', emoji: '🫁', dosages: ['5mg', '10mg'], instructions: 'Evening', sideEffects: 'Headache, stomach pain' },
  { name: 'Prednisolone', category: 'Respiratory', emoji: '🫁', dosages: ['5mg', '10mg', '20mg'], instructions: 'Morning with food', sideEffects: 'Weight gain, mood changes' },
  { name: 'Cetirizine', category: 'Respiratory', emoji: '🫁', dosages: ['5mg', '10mg'], instructions: 'Once daily', sideEffects: 'Drowsiness' },
  { name: 'Loratadine', category: 'Respiratory', emoji: '🫁', dosages: ['10mg'], instructions: 'Once daily', sideEffects: 'Headache, dry mouth' },

  // Vitamins & Supplements
  { name: 'Vitamin D3', category: 'Supplement', emoji: '☀️', dosages: ['400IU', '1000IU', '2000IU'], instructions: 'With meals', sideEffects: 'None at normal doses' },
  { name: 'Calcium', category: 'Supplement', emoji: '🦴', dosages: ['500mg', '1000mg'], instructions: 'With meals', sideEffects: 'Constipation' },
  { name: 'Iron', category: 'Supplement', emoji: '🔴', dosages: ['65mg', '100mg', '200mg'], instructions: 'Empty stomach', sideEffects: 'Dark stools, constipation' },
  { name: 'Folic Acid', category: 'Supplement', emoji: '🟢', dosages: ['400mcg', '5mg'], instructions: 'Once daily', sideEffects: 'None' },
  { name: 'Vitamin B12', category: 'Supplement', emoji: '💉', dosages: ['500mcg', '1000mcg'], instructions: 'Once daily', sideEffects: 'None' },
  { name: 'Zinc', category: 'Supplement', emoji: '💊', dosages: ['10mg', '20mg', '50mg'], instructions: 'With meals', sideEffects: 'Nausea' },

  // Nerve/Neuro
  { name: 'Gabapentin', category: 'Neuro', emoji: '🧠', dosages: ['100mg', '300mg', '400mg'], instructions: '3 times daily', sideEffects: 'Dizziness, drowsiness' },
  { name: 'Pregabalin', category: 'Neuro', emoji: '🧠', dosages: ['25mg', '75mg', '150mg'], instructions: 'Twice daily', sideEffects: 'Dizziness, weight gain' },
  { name: 'Amitriptyline', category: 'Neuro', emoji: '🧠', dosages: ['10mg', '25mg', '50mg'], instructions: 'At night', sideEffects: 'Drowsiness, dry mouth' },

  // Eye
  { name: 'Timolol Eye Drops', category: 'Eye', emoji: '👁️', dosages: ['0.25%', '0.5%'], instructions: 'Twice daily', sideEffects: 'Stinging' },
  { name: 'Latanoprost Eye Drops', category: 'Eye', emoji: '👁️', dosages: ['0.005%'], instructions: 'Once at night', sideEffects: 'Eye color change' },

  // Sri Lankan Common
  { name: 'Cotrimoxazole', category: 'Antibiotic', emoji: '🦠', dosages: ['480mg', '960mg'], instructions: 'Twice daily', sideEffects: 'Rash, nausea' },
  { name: 'Chlorpheniramine', category: 'Allergy', emoji: '🤧', dosages: ['4mg'], instructions: 'Every 4-6 hours', sideEffects: 'Drowsiness' },
  { name: 'Dexamethasone', category: 'Steroid', emoji: '💪', dosages: ['0.5mg', '4mg'], instructions: 'With food', sideEffects: 'Weight gain, mood changes' },
  { name: 'Furosemide', category: 'Diuretic', emoji: '💧', dosages: ['20mg', '40mg', '80mg'], instructions: 'Morning', sideEffects: 'Frequent urination' },
  { name: 'Spironolactone', category: 'Diuretic', emoji: '💧', dosages: ['25mg', '50mg', '100mg'], instructions: 'With food', sideEffects: 'High potassium' },
];

export const MEDICINE_CATEGORIES = [
  ...new Set(MEDICINES_DB.map(m => m.category))
];

export const searchMedicines = (query) => {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return MEDICINES_DB.filter(m =>
    m.name.toLowerCase().includes(lower) ||
    m.category.toLowerCase().includes(lower)
  ).slice(0, 8);
};