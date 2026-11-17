import type { Span } from '../lib/age';

export interface Vaccine {
  id: string;
  name: string;
  protects: string;
  note?: string;
}

export interface Visit {
  id: string;
  label: string;
  // Both measured from the date of birth. A visit still pending after `until` shows as overdue.
  at: Span;
  until: Span;
  vaccines: Vaccine[];
}

// IAP ACVIP immunization schedule (2023), simplified for display. Timing can differ by vaccine brand,
// so the UI always points parents back to their pediatrician.
export const VISITS: Visit[] = [
  {
    id: 'birth',
    label: 'Birth',
    at: { days: 0 },
    until: { weeks: 2 },
    vaccines: [
      { id: 'bcg', name: 'BCG', protects: 'Tuberculosis' },
      { id: 'opv0', name: 'OPV 0', protects: 'Polio' },
      { id: 'hepb1', name: 'Hep B 1', protects: 'Hepatitis B' },
    ],
  },
  {
    id: '6w',
    label: '6 weeks',
    at: { weeks: 6 },
    until: { weeks: 8 },
    vaccines: [
      { id: 'dtp1', name: 'DTwP / DTaP 1', protects: 'Diphtheria, tetanus, whooping cough' },
      { id: 'ipv1', name: 'IPV 1', protects: 'Polio' },
      { id: 'hib1', name: 'Hib 1', protects: 'Haemophilus influenzae type b' },
      { id: 'hepb2', name: 'Hep B 2', protects: 'Hepatitis B' },
      { id: 'rota1', name: 'Rotavirus 1', protects: 'Rotavirus diarrhoea' },
      { id: 'pcv1', name: 'PCV 1', protects: 'Pneumococcal disease' },
    ],
  },
  {
    id: '10w',
    label: '10 weeks',
    at: { weeks: 10 },
    until: { weeks: 12 },
    vaccines: [
      { id: 'dtp2', name: 'DTwP / DTaP 2', protects: 'Diphtheria, tetanus, whooping cough' },
      { id: 'ipv2', name: 'IPV 2', protects: 'Polio' },
      { id: 'hib2', name: 'Hib 2', protects: 'Haemophilus influenzae type b' },
      { id: 'hepb3', name: 'Hep B 3', protects: 'Hepatitis B' },
      { id: 'rota2', name: 'Rotavirus 2', protects: 'Rotavirus diarrhoea' },
      { id: 'pcv2', name: 'PCV 2', protects: 'Pneumococcal disease' },
    ],
  },
  {
    id: '14w',
    label: '14 weeks',
    at: { weeks: 14 },
    until: { weeks: 16 },
    vaccines: [
      { id: 'dtp3', name: 'DTwP / DTaP 3', protects: 'Diphtheria, tetanus, whooping cough' },
      { id: 'ipv3', name: 'IPV 3', protects: 'Polio' },
      { id: 'hib3', name: 'Hib 3', protects: 'Haemophilus influenzae type b' },
      { id: 'hepb4', name: 'Hep B 4', protects: 'Hepatitis B' },
      {
        id: 'rota3',
        name: 'Rotavirus 3',
        protects: 'Rotavirus diarrhoea',
        note: 'Only for 3-dose rotavirus vaccines',
      },
      { id: 'pcv3', name: 'PCV 3', protects: 'Pneumococcal disease' },
    ],
  },
  {
    id: '6m',
    label: '6 months',
    at: { months: 6 },
    until: { months: 7 },
    vaccines: [
      { id: 'flu1', name: 'Influenza 1', protects: 'Flu' },
      {
        id: 'tcv',
        name: 'Typhoid conjugate (TCV)',
        protects: 'Typhoid',
        note: 'Any time between 6 and 9 months',
      },
    ],
  },
  {
    id: '7m',
    label: '7 months',
    at: { months: 7 },
    until: { months: 8 },
    vaccines: [{ id: 'flu2', name: 'Influenza 2', protects: 'Flu', note: '4 weeks after the first dose' }],
  },
  {
    id: '9m',
    label: '9 months',
    at: { months: 9 },
    until: { months: 10 },
    vaccines: [{ id: 'mmr1', name: 'MMR 1', protects: 'Measles, mumps, rubella' }],
  },
  {
    id: '12m',
    label: '12 months',
    at: { months: 12 },
    until: { months: 13 },
    vaccines: [{ id: 'hepa1', name: 'Hep A 1', protects: 'Hepatitis A' }],
  },
  {
    id: '15m',
    label: '15 months',
    at: { months: 15 },
    until: { months: 16 },
    vaccines: [
      { id: 'mmr2', name: 'MMR 2', protects: 'Measles, mumps, rubella' },
      { id: 'var1', name: 'Varicella 1', protects: 'Chickenpox' },
      {
        id: 'pcvb',
        name: 'PCV booster',
        protects: 'Pneumococcal disease',
        note: 'Due between 12 and 15 months',
      },
    ],
  },
  {
    id: '16m',
    label: '16–18 months',
    at: { months: 16 },
    until: { months: 19 },
    vaccines: [
      { id: 'dtpb1', name: 'DTwP / DTaP booster 1', protects: 'Diphtheria, tetanus, whooping cough' },
      { id: 'hibb1', name: 'Hib booster', protects: 'Haemophilus influenzae type b' },
      { id: 'ipvb1', name: 'IPV booster 1', protects: 'Polio' },
    ],
  },
  {
    id: '18m',
    label: '18–19 months',
    at: { months: 18 },
    until: { months: 20 },
    vaccines: [
      { id: 'hepa2', name: 'Hep A 2', protects: 'Hepatitis A', note: 'Only for the inactivated vaccine' },
      { id: 'var2', name: 'Varicella 2', protects: 'Chickenpox', note: '3–6 months after the first dose' },
    ],
  },
  {
    id: '4y',
    label: '4–6 years',
    at: { years: 4 },
    until: { years: 6 },
    vaccines: [
      { id: 'dtpb2', name: 'DTwP / DTaP booster 2', protects: 'Diphtheria, tetanus, whooping cough' },
      { id: 'ipvb2', name: 'IPV booster 2', protects: 'Polio' },
      { id: 'mmr3', name: 'MMR 3', protects: 'Measles, mumps, rubella' },
    ],
  },
  {
    id: '9y',
    label: '9–14 years',
    at: { years: 9 },
    until: { years: 14 },
    vaccines: [
      {
        id: 'hpv',
        name: 'HPV (2 doses)',
        protects: 'Cervical and other HPV cancers',
        note: '6 months apart',
      },
    ],
  },
  {
    id: '10y',
    label: '10–12 years',
    at: { years: 10 },
    until: { years: 12 },
    vaccines: [{ id: 'tdap', name: 'Tdap / Td', protects: 'Tetanus, diphtheria, whooping cough' }],
  },
];
