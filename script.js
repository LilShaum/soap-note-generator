document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-CA',{weekday:'short',year:'numeric',month:'short',day:'numeric'});

// ── HELP PANEL ───────────────────────────────────────────────
function toggleHelp(){
  document.getElementById('help-panel').classList.toggle('open');
  document.getElementById('help-overlay').classList.toggle('open');
}

// ── VALUE HELPERS ────────────────────────────────────────────
// v(id): trimmed value. Placeholder options (e.g. "— select —") count as empty,
// so unanswered dropdowns are never documented as findings.
function v(id){
  const el=document.getElementById(id);
  if(!el)return '';
  const val=el.value.trim();
  if(/^(—|–|--|select\b)/i.test(val))return '';
  return val;
}
// vp(id): like v() but strips any trailing period, so templates control
// punctuation and double periods can't occur regardless of option wording.
function vp(id){return v(id).replace(/\.+$/,'');}
function chk(id){const el=document.getElementById(id);return el?el.checked:false;}
function picks(pairs){return pairs.filter(([id])=>chk(id)).map(([,lbl])=>lbl);}
function bul(arr){return arr.map(s=>'• '+s+(s.endsWith('.')?'':'.')).join('\n');}

// ── REFILL WORDING VARIANTS ─────────────────────────────────
// Several clinically-equivalent phrasings for the medication-refill notes, so
// repeated notes don't read as identical / "cloned". pick() chooses one at
// random each time a note is generated (re-generating the same note re-rolls
// the wording). The FIRST entry in every list is the original wording.
//
// SAFETY RULE: every entry within a list must document the SAME clinical
// content — vary only the wording, never the meaning, and never the set of
// symptoms/negatives being recorded.
// pain(id, suffix): the score clause, or nothing at all when the field is
// blank — a note should never read "?/10".
function pain(id, suffix){
  const val = v(id);
  if (!val) return '';
  return ', ' + val + '/10' + (suffix ? ' ' + suffix : '');
}
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }

const RV = {
  full: {
    dm: {
      open: [
        'Patient presents for Type 2 Diabetes Mellitus (T2DM) medication refill.',
        'Seen today for routine refill of Type 2 Diabetes Mellitus (T2DM) medication.',
        'Attends for follow-up of Type 2 Diabetes Mellitus (T2DM), requesting medication refill.'
      ],
      neg: [
        'No recent episodes of hypoglycemia or hyperglycemia. Denies polyuria, polydipsia, or fatigue. No medication side effects. ',
        'Denies hypoglycemic or hyperglycemic episodes. No polyuria, polydipsia, or fatigue reported. Tolerating medication without side effects. ',
        'No symptoms of hypo- or hyperglycemia. Reports no polyuria, polydipsia, or fatigue, and no medication side effects. '
      ]
    },
    htn: {
      open: [
        'Patient presents for routine hypertension medication refill.',
        'Seen today for routine refill of antihypertensive medication.',
        'Attends for follow-up of hypertension and medication refill.'
      ],
      neg: [
        'Denies chest pain, shortness of breath, headache, dizziness, or medication side effects. No recent ER or urgent care visits. ',
        'No chest pain, shortness of breath, headache, dizziness, or medication side effects reported. No recent emergency or urgent care visits. ',
        'Reports no chest pain, shortness of breath, headache, dizziness, or medication side effects. No emergency room or urgent care visits since last seen. '
      ]
    },
    thy: {
      open: [
        'Patient presents for hypothyroidism medication refill.',
        'Seen today for routine refill of thyroid hormone replacement.',
        'Attends for follow-up of hypothyroidism and medication refill.'
      ],
      negHypo: [
        'No hypothyroid symptoms reported. ',
        'Denies hypothyroid symptoms. ',
        'No symptoms of hypothyroidism reported. '
      ],
      negHyper: [
        'No symptoms of over-replacement. ',
        'No features suggestive of over-replacement. ',
        'Denies symptoms of over-replacement. '
      ]
    },
    refill: {
      open: [
        'Patient presents for medication refill',
        'Seen today for routine medication refill',
        'Attends for medication refill'
      ],
      med: [
        'Current medication{s}:',
        'Currently taking',
        'On'
      ],
      adh: [
        'Reports {a}, with {i}.',
        'Describes {a}. Reports {i}.',
        'Patient reports {a} and {i}.'
      ]
    },
    gerd: {
      open: [
        'Patient presents for GERD medication refill.',
        'Seen today for routine refill of GERD medication.',
        'Attends for follow-up of GERD and medication refill.'
      ],
      negSx: [
        'No significant GERD symptoms reported. ',
        'Denies significant reflux symptoms. ',
        'No significant heartburn or reflux symptoms reported. '
      ],
      negAlarm: [
        'No alarm symptoms identified.',
        'No alarm features identified.',
        'Denies alarm symptoms.'
      ]
    }
  },
  compact: {
    dm:   { open: ['S: F/u T2DM.', 'S: T2DM med refill.', 'S: Routine T2DM refill.'] },
    htn:  { open: ['S: F/u HTN.', 'S: HTN med refill.', 'S: Routine HTN refill.'] },
    thy:  { open: ['S: F/u hypothyroidism.', 'S: Hypothyroidism med refill.', 'S: Routine hypothyroidism refill.'] },
    gerd: { open: ['S: F/u GERD.', 'S: GERD med refill.', 'S: Routine GERD refill.'] },
    refill: { open: ['S: Med refill', 'S: Routine med refill', 'S: Refill visit'] }
  }
};

const G={

/* General medication refill — works for any drug or condition, and is the
   fallback whenever none of the condition-specific refill forms fit. */
refill(){
  const cond=v('rx-condition');
  const meds=medList('rx');
  const medsOr=meds||'current medication';
  const nMeds=[1,2,3].filter(i=>v('rx-drug'+i)).length;
  const sx=v('rx-sx'), seDetail=v('rx-se-detail'), labs=v('rx-labs');
  const examDetail=v('rx-exam-detail'), notes=v('rx-notes');
  const supply=v('rx-supply'), other=v('rx-p-other');
  const oVits=[v('rx-bp')?'BP: '+v('rx-bp'):'',v('rx-hr')?'HR: '+v('rx-hr')+' bpm':'',v('rx-wt')?'Weight: '+v('rx-wt')+' lbs':''].filter(Boolean).join(', ');
  const plan=picks([
    ['rx-p-refill','Refill '+medsOr+(supply?' — '+supply+' supply':'')],
    ['rx-p-continue','Continue current dose'],
    ['rx-p-adjust','Dose adjusted as above'],
    ['rx-p-labs','Bloodwork / monitoring ordered'],
    ['rx-p-lifestyle','Lifestyle measures reinforced'],
    ['rx-p-counsel','Counselled on side effects and when to seek medical attention'],
    ['rx-p-adherence','Medication adherence discussed'],
    ['rx-p-referral','Referral placed']
  ]);
  if(other)plan.push(cap(other));
  const fu=vp('rx-fu');
  const fuLine=/^as needed/i.test(fu)?'• Follow up as needed.':'• Follow up in '+fu+'.';
  return `S:
${pick(RV.full.refill.open)}${cond?' for '+cond:''}. ${meds?pick(RV.full.refill.med).replace('{s}', nMeds>1?'s':'')+' '+meds+'. ':''}${pick(RV.full.refill.adh).replace('{a}', vp('rx-adherence')).replace('{i}', vp('rx-interval'))}${sx?' '+cap(ensureDot(sx)):''} ${v('rx-se')}${seDetail?' '+cap(ensureDot(seDetail)):''}

O:
${oVits?oVits+'. ':''}${labs?cap(ensureDot(labs))+' ':''}${v('rx-exam')}${examDetail?' '+cap(ensureDot(examDetail)):''}

A:
• ${cond?cap(cond):'Chronic medication therapy'} — ${vp('rx-status')}. ${v('rx-tol')}${notes?' '+cap(ensureDot(notes)):''}

P:
${bul(plan)}
${fuLine}`;
},

depression(){
  const namedDrug=v('dep-drug');const drug=namedDrug||'current antidepressant';
  const med=v('dep-dose')?drug+' '+v('dep-dose'):drug;
  const sx=picks([['dep-fatigue','fatigue'],['dep-motivation','low motivation'],['dep-anhedonia','anhedonia'],['dep-concentration','poor concentration']]);
  const abnAppear=picks([['dep-agitated','Agitated / psychomotor agitation'],['dep-dishevelled','Dishevelled / poor self-care'],['dep-uncooperative','Uncooperative'],['dep-abnormal-speech','Abnormal rate or tone of speech'],['dep-disorganised','Disorganised / illogical thought']]);
  const plan=picks([['dep-monitor','Monitor for side effects and mood changes'],['dep-sleep-hyg','Encourage sleep hygiene and routine'],['dep-activity','Physical activity encouraged'],['dep-crisis','Crisis contact information provided'],['dep-referral','Referral to mental health / counselling placed'],['dep-therapy','CBT / therapy discussed']]);
  return `S:\nPatient presents for follow-up of depression. Mood reported as ${vp('dep-mood')} since initiating ${med}. ${v('dep-si')} ${sx.length?'Ongoing symptoms include: '+sx.join(', ')+'. ':'No significant ongoing symptoms reported. '}${vp('dep-sleep')===vp('dep-appetite')?'Sleep and appetite '+vp('dep-sleep')+'.':'Sleep is '+vp('dep-sleep')+'. Appetite is '+vp('dep-appetite')+'.'} ${v('dep-se')}\n\nO:\nMood: ${vp('dep-omood')}. Affect: ${vp('dep-affect')}.${abnAppear.length?' Abnormal behaviour / appearance: '+abnAppear.join(', ')+'.':' Cooperative, appropriate appearance, normal speech, logical thought process.'} ${v('dep-psych')}\n\nA:\n• Major Depressive Disorder — ${vp('dep-status')}.\n• Safety: ${v('dep-safety')}\n\nP:\n• ${vp('dep-rx')}${namedDrug?' ('+med+')':''}.\n${bul(plan)}\n• Follow up in ${vp('dep-fu')}.`;
},

t2dm(){
  const drug=v('dm-drug')||'current diabetes medication';
  const med=v('dm-dose')?drug+' '+v('dm-dose'):drug;
  const sx=picks([['dm-hypo','hypoglycemia'],['dm-hyper','hyperglycemia'],['dm-polyuria','polyuria'],['dm-polydipsia','polydipsia'],['dm-fatigue','fatigue'],['dm-se','medication side effects']]);
  const plan=picks([['dm-refill','Refill '+med],['dm-continue','Continue current diabetes management'],['dm-diet','Encourage diet/exercise adherence'],['dm-labs','A1C and labs ordered if due'],['dm-footcheck','Foot exam completed / referred'],['dm-bp-plan','BP management reviewed']]);
  const a1c=v('dm-a1c');const a1cd=v('dm-a1cdate');
  const vits=[v('dm-bp')?'BP: '+v('dm-bp'):'',v('dm-hr')?'HR: '+v('dm-hr')+' bpm':'',v('dm-wt')?'Weight: '+v('dm-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\n${pick(RV.full.dm.open)} Reports ${vp('dm-adherence')} with ${med}. ${sx.length?'Symptoms reported: '+sx.join(', ')+'. ':pick(RV.full.dm.neg)}\n\nO:\nLast A1C: ${a1c?a1c+'%':'pending'}${a1cd?' ('+a1cd+')':''}. ${vits?vits+'.':''} ${v('dm-exam')}\n\nA:\n• T2DM — ${vp('dm-status')}. ${v('dm-hypoglycemia')} ${v('dm-tol')}\n\nP:\n${bul(plan)}\n• Follow up in ${vp('dm-fu')}.`;
},

htn(){
  const med1=v('htn-med1');const med2=v('htn-med2');
  const meds=[med1,med2].filter(Boolean).join(' and ')||'current antihypertensive medications';
  const sx=picks([['htn-cp','chest pain'],['htn-sob','shortness of breath'],['htn-ha','headache'],['htn-dizzy','dizziness'],['htn-se','medication side effects'],['htn-er','recent ER/urgent care visit']]);
  const abnExam=picks([['htn-acute-distress','Acute distress'],['htn-murmur','Murmur heard'],['htn-lungs-abn','Lungs abnormal'],['htn-edema','Edema present']]);
  const plan=picks([['htn-refill','Refill '+meds],['htn-lifestyle','Continue lifestyle modifications'],['htn-homebp-plan','Recommend home BP monitoring'],['htn-cmp','Electrolytes and creatinine if not done within last year'],['htn-echo','Echo / cardiology referral placed'],['htn-sodium','Low-sodium diet counselled']]);
  const homebp=v('htn-homebp');
  const bp=v('htn-bp');const hr=v('htn-hr');
  const oVits=[bp?'BP: '+bp:'',hr?'HR: '+hr+' bpm':''].filter(Boolean).join(', ');
  return `S:\n${pick(RV.full.htn.open)} ${sx.length?'Reports: '+sx.join(', ')+'. ':pick(RV.full.htn.neg)}Reports ${vp('htn-adherence')}.${homebp?' Home BP average ~'+homebp+'.':''}\n\nO:\n${oVits?oVits+'. ':'Vitals stable. '}${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'Gen: NAD. CV: regular rate and rhythm, no murmur. Lungs: clear. No edema.'}\n\nA:\nHypertension — ${vp('htn-control')}. ${v('htn-concerns')}\n\nP:\n${bul(plan)}\n• Follow up in ${vp('htn-fu')}.`;
},

inr(){
  const flags=picks([['inr-bleeding','unusual bleeding or bruising'],['inr-hematuria','hematuria'],['inr-stools','black or tarry stools'],['inr-missed','missed warfarin doses'],['inr-extra','extra/double doses taken'],['inr-newmeds','new medications started'],['inr-diet','significant dietary changes'],['inr-newsymptoms','new symptoms']]);
  const abnSigns=picks([['inr-bruising','Bruising or petechiae noted'],['inr-bleeding-signs','Signs of active bleeding'],['inr-edema','Edema']]);
  const edu=picks([['inr-edu-diet','Reinforced consistent diet and medication adherence'],['inr-edu-bleed','Educated on signs of bleeding and when to seek medical attention'],['inr-edu-adhere','Medication adherence reinforced'],['inr-edu-interact','Drug interaction counselling provided']]);
  const nd=v('inr-newdose');const dn=v('inr-diet-notes');const mc=v('inr-med-changes');
  const inrStatus=v('inr-status');
  const inrStable=inrStatus==='within target range';
  const inrVal=v('inr-value');const inrDose=v('inr-dose');const inrTarget=v('inr-target');const inrBP=v('inr-bp');
  return `S:\nPatient presents for routine INR monitoring. ${flags.length?'Reports: '+flags.join(', ')+'. ':'No bleeding, bruising, hematuria, or black stools reported. No missed or extra warfarin doses. '}${dn?'Dietary notes: '+dn+'. ':'No recent dietary changes. '}${mc?'Recent medication changes: '+mc+'.':'No recent medication changes.'}\n\nO:\nVitals stable.${abnSigns.length?' '+abnSigns.join('. ')+'.':''}\n${inrVal?'INR today: '+inrVal+'. ':''}${inrTarget?'Target range: '+inrTarget+'. ':''}${inrDose?'Current warfarin dose: '+inrDose+'.':''}${inrBP?' BP: '+inrBP+'.':''}\n\nA:\n• ${inrStable?'Stable anticoagulation management on warfarin.':'Anticoagulation on warfarin — requires dose adjustment.'}\n• INR ${vp('inr-status')}.\n\nP:\n• ${vp('inr-action')}${nd?': '+nd:''}.\n• Recheck INR in ${vp('inr-recheck')}.\n${bul(edu)}`;
},

backpain(){
  const rf=picks([['bp-radiation','radiation to lower limb(s)'],['bp-numbness','numbness/tingling'],['bp-weakness','limb weakness'],['bp-bowel','bowel/bladder changes'],['bp-fever','fever or unexplained weight loss']]);
  const posExam=picks([['bp-stable','Vitals stable'],['bp-tender','Lumbar paraspinal tenderness'],['bp-limited-flex','Limited flexion due to pain']]);
  const abnExam=picks([['bp-midline-tender','Midline tenderness'],['bp-neuro-deficit','Neurological deficit in lower limbs'],['bp-slr-pos','Positive straight leg raise']]);
  const onset=v('bp-onset');
  const onsetStr=onset.startsWith('gradual')?'Gradual onset, no clear trigger.':'Onset '+onset+'.';
  const plan=picks([['bp-reassure','Reassure and educate'],['bp-activity','Continue gentle activity; avoid prolonged rest'],['bp-ibu','Ibuprofen 400 mg PO q6–8h PRN with food'],['bp-heat','Apply heat to affected area'],['bp-stretch','Stretching exercises recommended'],['bp-physio','Physiotherapy referral placed'],['bp-imaging','Imaging ordered (X-ray / MRI)'],['bp-neuro-warn','Advised to return immediately if new neurological symptoms develop']]);
  const examOut=[...posExam,...(abnExam.length?['Abnormal: '+abnExam.join(', ')]:['Normal strength, sensation, and reflexes in lower limbs','Negative straight leg raise'])];
  return `S:\nLow back pain for ${vp('bp-duration')}. ${onsetStr} ${vp('bp-char')}${pain('bp-pain-rest','at rest')}${pain('bp-pain-move','with movement')}. ${rf.length?'Red flag symptoms present: '+rf.join(', ')+' — further evaluation warranted.':'No radiation, numbness, weakness, or bowel/bladder changes.'} Improved with ${vp('bp-relief')}. ${v('bp-hx')}\n\nO:\n${examOut.join('. ')}.\n\nA:\n${vp('bp-dx')}.${rf.length?' Red flags present — serious pathology to be excluded.':''}\nDDx: disc herniation, spinal stenosis${rf.length?', serious spinal pathology (to be excluded).':', vertebral fracture (less likely).'}\n\nP:\n${bul(plan)}\n• Follow up in ${vp('bp-fu')}.`;
},

headache(){
  const assoc=picks([['ha-nausea','nausea'],['ha-vomit','vomiting'],['ha-visual','visual changes'],['ha-photo','photophobia'],['ha-phono','phonophobia'],['ha-weakness','weakness/neurological changes']]);
  const abnExam=picks([['ha-neuro-deficit','Focal neurological deficit'],['ha-cn-deficit','Cranial nerve deficit'],['ha-papilloedema','Papilloedema on fundoscopy'],['ha-neck-stiff','Neck stiffness / meningismus'],['ha-sinus-tender','Sinus / temporal artery tenderness'],['ha-disoriented','Disoriented / altered consciousness']]);
  const plan=picks([['ha-reassure','Reassure patient; discuss stress management and adequate sleep'],['ha-sleep','Adequate sleep advised'],['ha-apap','Acetaminophen 500 mg PO q6h PRN'],['ha-ibu','Ibuprofen 400 mg PO q6–8h PRN'],['ha-hydration','Encourage hydration and regular meals'],['ha-caffeine','Avoid excessive caffeine and screen time'],['ha-triptan','Triptan prescribed'],['ha-neuro','Neurology referral placed']]);
  return `S:\nHeadache for ${vp('ha-dur')} with ${vp('ha-onset')}. Located ${vp('ha-loc')}, ${vp('ha-char')}${pain('ha-pain','in intensity')}. ${assoc.length?'Associated symptoms: '+assoc.join(', ')+'. ':'No nausea, vomiting, visual changes, weakness, photophobia, or phonophobia. '}Worsened by ${vp('ha-aggr')}; relieved by ${vp('ha-relief')}. ${v('ha-hx')}\n\nO:\n${chk('ha-disoriented')?'':'Alert and oriented. '}Vitals stable.${abnExam.length?' Abnormal findings: '+abnExam.join(', ')+'.':' No focal neurological deficits. Cranial nerves intact. Neck supple.'}\n\nA:\n${vp('ha-dx')}.\nDDx: migraine, sinus headache, secondary causes (e.g. hypertension, infection — less likely).\n\nP:\n${bul(plan)}\n• Follow up ${vp('ha-fu')}.`;
},

chestpain(){
  const assoc=picks([['cp-radiation','radiation to arm or jaw'],['cp-sob','shortness of breath'],['cp-nausea','nausea'],['cp-diaphoresis','diaphoresis'],['cp-palp','palpitations'],['cp-syncope','syncope/pre-syncope']]);
  const hx=picks([['cp-htn','hypertension'],['cp-cardiac','known cardiac history'],['cp-smoker','smoker'],['cp-dm','diabetes'],['cp-trauma','recent trauma or cough']]);
  const abnExam=picks([['cp-acute-distress','Acute distress'],['cp-murmur','Cardiac murmur'],['cp-lungs-abn','Respiratory abnormality (wheeze / crackles)'],['cp-abd-tender','Abdominal tenderness'],['cp-cw-tender','Chest wall tenderness']]);
  const plan=picks([['cp-ecg-ord','ECG ordered and reviewed'],['cp-troponin','Troponin ordered'],['cp-reassure','Reassure and observe'],['cp-no-exert','Avoid exertion until cardiac cause excluded'],['cp-nsaid','If cardiac cause excluded: NSAID for pain, rest, and stress reduction'],['cp-er-warn','Educate on warning signs: worsening pain, radiation, diaphoresis, or syncope — go to ER'],['cp-cardio','Cardiology referral placed'],['cp-stress','Stress test ordered']]);
  const vits=[v('cp-bp')?'BP: '+v('cp-bp'):'',v('cp-hr')?'HR: '+v('cp-hr')+' bpm':'',v('cp-rr')?'RR: '+v('cp-rr'):'',v('cp-temp')?'Temp: '+v('cp-temp')+'\u00b0C':'',v('cp-spo2')?'SpO2: '+v('cp-spo2')+'%':''].filter(Boolean).join(', ');
  return `S:\n${vp('cp-loc')}${pain('cp-pain','intensity')}, for ${vp('cp-dur')}, ${vp('cp-onset').toLowerCase()}. ${assoc.length?'Associated symptoms: '+assoc.join(', ')+'. ':'No radiation to arm or jaw, shortness of breath, nausea, diaphoresis, palpitations, or syncope. '}${cap(hx.length?hx.join(', '):'no significant cardiac history; non-smoker')}.\n\nO:\n${vits?vits+'. ':'Vitals stable. '}${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'No acute distress. CV: regular rate and rhythm, no murmurs. Chest clear.'}\nECG: ${vp('cp-ecg')}.\n\nA:\n${vp('cp-dx')}.\nDDx: stable angina, GERD, costochondritis, anxiety, ACS (rule out).\n\nP:\n${bul(plan)}\n• Follow up in ${vp('cp-fu')}.`;
},

cold(){
  const sx=picks([['cold-cough','cough'],['cold-throat','sore throat'],['cold-runny','runny nose'],['cold-fatigue','mild fatigue'],['cold-congestion','nasal congestion'],['cold-fever','fever'],['cold-sob','shortness of breath'],['cold-cp','chest pain'],['cold-myalgia','myalgia']]);
  const abnExam=picks([['cold-nasal-congest','Nasal congestion'],['cold-pharynx','Pharyngeal erythema'],['cold-exudate','Tonsillar exudate'],['cold-lymph','Lymphadenopathy'],['cold-lungs-abn','Abnormal lung sounds']]);
  const plan=picks([['cold-reassure','Reassure; likely viral and self-limiting'],['cold-rest','Rest and fluids encouraged'],['cold-gargle','Warm saltwater gargles'],['cold-saline','Saline nasal spray'],['cold-apap','Acetaminophen or ibuprofen PRN for fever or discomfort'],['cold-no-abx','Avoid antibiotics'],['cold-swab','Throat swab / COVID test ordered'],['cold-return','Return if symptoms persist beyond 10 days, worsen, or fever >38.5\u00b0C develops']]);
  const vits=[v('cold-bp')?'BP: '+v('cold-bp'):'',v('cold-hr')?'HR: '+v('cold-hr'):'',v('cold-temp')?'Temp: '+v('cold-temp')+'\u00b0C':'',v('cold-rr')?'RR: '+v('cold-rr'):'',v('cold-spo2')?'SpO2: '+v('cold-spo2')+'%':''].filter(Boolean).join(', ');
  const s=sx.length?sx.join(', '):'upper respiratory symptoms';
  return `S:\nPatient presents with ${s} for ${vp('cold-dur')}. ${cap(v('cold-self'))} ${cap(v('cold-pmh'))}\n\nO:\n${vits?vits+'. ':'Vitals stable. '}${abnExam.length?'Exam: '+abnExam.join(', ')+'.':'Lungs clear to auscultation. No lymphadenopathy. No tonsillar exudate.'}\n\nA:\n${vp('cold-dx')}.\nDDx: influenza, allergic rhinitis, COVID-19 (less likely).\n\nP:\n${bul(plan)}`;
},

child(){
  const st=picks([['ch-eating','eating well'],['ch-sleeping','sleeping well'],['ch-active','active and playful'],['ch-milestones','meeting developmental milestones appropriate for age']]);
  const age=v('ch-age');
  const abnSys=picks([['ch-general-abn','General: distress / unwell appearance'],['ch-heent-abn','HEENT: abnormal finding'],['ch-neck-abn','Neck: lymphadenopathy / stiffness'],['ch-cardiac-abn','Cardiac: murmur / irregular rhythm'],['ch-resp-abn','Respiratory: abnormal breath sounds'],['ch-abd-abn','Abdomen: tender / organomegaly'],['ch-skin-abn','Skin: rash or lesion'],['ch-msk-abn','Musculoskeletal: abnormal tone or gait'],['ch-neuro-abn','Neuro: developmental concern']]);
  const plan=picks([['ch-diet','Continue healthy diet, regular physical activity, and adequate sleep'],['ch-safety','Anticipatory guidance given on safety, nutrition, and screen time'],['ch-nutrition','Nutrition counselling provided'],['ch-screen','Screen time guidance provided'],['ch-referral','Referral placed — details documented in chart']]);
  const wt=v('ch-wt');const wtpct=v('ch-wt-pct');const ht=v('ch-ht');const htpct=v('ch-ht-pct');
  const growthLine=[wt?'Weight: '+wt+' lbs'+(wtpct?' ('+wtpct+' %ile)':''):'',ht?'Height: '+ht+(htpct?' ('+htpct+' %ile)':''):''].filter(Boolean).join(', ');
  const immDeclined=v('ch-imm').toLowerCase().includes('declin');
  return `S:\n${age?'Child ('+age+')':'Child'} brought in by parent for ${vp('ch-type')}. ${v('ch-concerns')} ${st.length?'Child is '+st.join(', ')+'. ':''}${v('ch-illness')} ${v('ch-imm')}\n\nO:\n${growthLine?growthLine+'. ':''}${abnSys.length?'Abnormal findings: '+abnSys.join('. ')+'.':'Physical exam unremarkable. All systems within normal limits.'}\n\nA:\n${vp('ch-dx')}.\n\nP:\n${bul(plan)}${immDeclined?'':'\n• Immunizations reviewed and updated as needed.'}\n• Follow up ${vp('ch-fu')}.`;
},


ocp(){
  const contra=picks([['ocp-smoke','smoker \u226535 years'],['ocp-aura','migraines with aura'],['ocp-dvt','history of DVT/PE'],['ocp-liver','liver disease'],['ocp-htn','uncontrolled hypertension'],['ocp-pregnant','currently pregnant'],['ocp-bf','currently breastfeeding'],['ocp-cvd','cardiovascular disease']]);
  const counsel=picks([['ocp-options','Discussed options: combined vs. progestin-only pills, benefits, and risks'],['ocp-howto','Explained correct use and timing, including what to do if a pill is late'],['ocp-missed','Missed pill instructions reviewed'],['ocp-se','Potential side effects discussed (e.g. nausea, breast tenderness, spotting)'],['ocp-sti','Advised on STI prevention — OCP does not protect against infections; recommend condom use'],['ocp-bp-check','Check BP regularly while on OCP'],['ocp-interact','Drug interaction counselling provided'],['ocp-fertility','Return to fertility discussed']]);
  const rx=v('ocp-rx');
  const bp=v('ocp-bp');const bmi=v('ocp-bmi');
  const oVits=[bp?'BP: '+bp:'',bmi?'BMI: '+bmi:''].filter(Boolean).join('. ');
  const pregnancyLine=(chk('ocp-pregnant')||chk('ocp-bf'))?'':'Patient is not currently pregnant or breastfeeding.';
  return `S:\nPatient presents requesting information and advice about oral contraceptive pills. ${contra.length?'Contraindications identified on screening: '+contra.join(', ')+'. ':'No history of smoking, migraines with aura, thromboembolic disease, or liver problems. '}Patient reports ${vp('ocp-periods').toLowerCase()}. ${cap(v('ocp-meds'))}${pregnancyLine?' '+pregnancyLine:''}\n\nO:\n${oVits?oVits+'. ':''}${cap(v('ocp-exam'))}\n\nA:\n• ${vp('ocp-suit')}.\n\nP:\n${rx?'• '+rx+'.\n':''}${bul(counsel)}\n• Follow up in ${vp('ocp-fu')}.`;
},

labs(){
  const sx=picks([['lab-fatigue','fatigue'],['lab-sob','shortness of breath'],['lab-palpitations','palpitations'],['lab-dizzy','dizziness/lightheadedness'],['lab-weightchange','unexplained weight change'],['lab-polyuria','polyuria/polydipsia'],['lab-pain','chest or abdominal pain'],['lab-bleeding','unusual bleeding or bruising']]);
  const flags=picks([['lab-flag-high','one or more values above normal range'],['lab-flag-low','one or more values below normal range'],['lab-flag-critical','critical value — patient notified urgently'],['lab-flag-trend','worsening trend vs. prior results'],['lab-flag-new','new abnormality identified'],['lab-flag-stable','values stable / unchanged']]);
  const actions=picks([['lab-action-discussed','Results discussed with patient'],['lab-action-nodx','No change to management — results reassuring'],['lab-action-repeat','Repeat labs ordered'],['lab-action-medsadj','Medication adjusted — details documented in chart'],['lab-action-newrx','New medication initiated'],['lab-action-referral','Referral placed'],['lab-action-imaging','Imaging ordered'],['lab-action-diet','Dietary / lifestyle advice given'],['lab-action-urgent','Urgent follow-up arranged']]);
  const meds=v('lab-meds');
  // Build lab results line — only include values that were entered
  const labPairs=[['Hgb',v('lab-hgb')],['WBC',v('lab-wbc')],['Plt',v('lab-plt')],['Na',v('lab-na')],['K',v('lab-k')],['Cr',v('lab-creat')],['eGFR',v('lab-egfr')],['Glucose',v('lab-gluc')],['A1C',v('lab-a1c')+'%'],['TSH',v('lab-tsh')],['T4',v('lab-t4')],['LDL',v('lab-ldl')],['Chol',v('lab-tchol')],['HDL',v('lab-hdl')],['TG',v('lab-trig')],['ALT',v('lab-alt')],['AST',v('lab-ast')],['ALP',v('lab-alp')],['Bili',v('lab-bili')],['INR',v('lab-inr')],['B12',v('lab-b12')],['Ferritin',v('lab-ferritin')]];
  const labList=labPairs.filter(([,val])=>val&&val!='%').map(([k,val])=>k+': '+val);
  const otherLab=v('lab-other');
  if(otherLab)labList.push(otherLab);
  const labResults=labList.join(', ');
  return `S:\n${v('lab-reason')} ${v('lab-aware')}${sx.length?' Patient reports: '+sx.join(', ')+'.':''} ${meds?'Current medications: '+meds+'.':''}\n\nO:\n${labResults?'Lab results — '+labResults+'.':'Lab results as per chart.'}\n${flags.length?'Flags: '+flags.join('; ')+'.' :''}\n\nA:\n• ${vp('lab-interp')}.\n• ${vp('lab-sig')}.\n\nP:\n${bul(actions)}\n• Next labs: ${vp('lab-nextlabs')}.\n• ${vp('lab-fu')}.`;
},

medrx(){
  const concerns=picks([['mr-adherence-concern','difficulty remembering / taking medications'],['mr-cost','medication cost concerns'],['mr-se-concern','side effects reported'],['mr-effectiveness','concerns about effectiveness'],['mr-complexity','complex regimen / too many pills'],['mr-newmeds','new medication recently started'],['mr-otc','using OTC / herbal / supplements'],['mr-stopped','stopped a medication without advice']]);
  const findings=picks([['mr-interaction','Potential drug interaction identified'],['mr-duplication','Therapeutic duplication identified'],['mr-underdose','Possible underdosing'],['mr-overdose','Possible overdosing / toxicity concern'],['mr-inappropriate','Potentially inappropriate medication for age / comorbidity'],['mr-missing','Missing medication for known indication'],['mr-monitoring','Monitoring not up to date for high-risk medication'],['mr-deprescribe','Candidate for deprescribing identified']]);
  const actions=picks([['mr-no-change','No medication changes — regimen appropriate'],['mr-stopped-med','Medication stopped — details documented in chart'],['mr-dose-change','Dose adjusted — details documented in chart'],['mr-new-med','New medication started — details documented in chart'],['mr-switched','Medication switched — details documented in chart'],['mr-counselled','Patient counselled on all medications'],['mr-adherence-plan','Adherence strategy discussed (pill organiser / blister pack)'],['mr-pharmacist','Pharmacist referral / MedsCheck arranged'],['mr-labs','Labs ordered for medication monitoring'],['mr-reconciled','Medication list reconciled and updated in chart']]);
  const meds=v('mr-meds');
  const vits=[v('mr-bp')?'BP: '+v('mr-bp'):'',v('mr-hr')?'HR: '+v('mr-hr')+' bpm':'',v('mr-wt')?'Weight: '+v('mr-wt')+' lbs':'',v('mr-egfr')?'eGFR: '+v('mr-egfr'):''].filter(Boolean).join(', ');
  const allergies=v('mr-allergies');
  return `S:\n${v('mr-reason')} Patient on ${vp('mr-count')} regular medications. ${v('mr-adherence')}${concerns.length?' Patient-reported concerns: '+concerns.join(', ')+'.':''}${allergies?' Known allergies: '+allergies+'.':''}\n\nCurrent medications:\n${meds||'[see medication list in chart]'}\n\nO:\n${vits?vits+'.':'Vitals as per chart.'}\n${findings.length?'Review findings:\n'+bul(findings):'• No medication safety concerns identified on review.'}\n\nA:\n• ${vp('mr-safety')}.\n• Polypharmacy: ${vp('mr-poly')}.\n\nP:\n${bul(actions)}\n• Follow up: ${vp('mr-fu')}.`;
}

};

// generate() is defined at the bottom to support compact mode switching

G['anx-initial']=function(){
  const drug=v('ai-drug');const dose=v('ai-dose');const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['ai-worry','excessive uncontrollable worry'],['ai-restless','restlessness/feeling on edge'],['ai-fatigue','fatigue'],['ai-concentration','difficulty concentrating'],['ai-irritable','irritability'],['ai-muscle','muscle tension'],['ai-sleep','sleep disturbance'],['ai-panic','panic attacks']]);
  const phys=picks([['ai-palpitations','palpitations'],['ai-sweating','sweating'],['ai-trembling','trembling'],['ai-sob','shortness of breath'],['ai-chest','chest tightness'],['ai-dizziness','dizziness']]);
  const abnExam=picks([['ai-abnormal-speech','Abnormal speech'],['ai-disorganised','Disorganised thought'],['ai-psychosis-signs','Signs of psychosis']]);
  const plan=picks([['ai-edu','Psychoeducation on anxiety provided'],['ai-lifestyle','Lifestyle: regular sleep, exercise, limit caffeine/alcohol'],['ai-breathing','Breathing / relaxation techniques discussed'],['ai-monitor','Monitor response and side effects'],['ai-crisis','Crisis contact information provided'],['ai-referral','Referral to mental health / counselling placed'],['ai-gad7rep','GAD-7 to be repeated at follow-up']]);
  const gad=v('ai-gad7');const meds=v('ai-meds');
  return `S:\nPatient presents with ${vp('ai-reason')} for ${vp('ai-duration')}. Symptoms include: ${sx.length?sx.join(', '):'[see notes]'}.${phys.length?' Physical symptoms: '+phys.join(', ')+'.':''} ${v('ai-avoidance')} ${v('ai-trigger')} ${v('ai-pmh')} ${v('ai-etoh')}${meds?' Current medications: '+meds+'.':' No current medications or known allergies.'}\n\nO:\n${vp('ai-appear')}. Affect: ${vp('ai-affect')}.${abnExam.length?' Abnormal findings: '+abnExam.join(', ')+'.':' Normal rate and tone of speech. Logical, goal-directed thought. No evidence of psychosis.'}${gad?' GAD-7: '+gad+'.':''}\n\nA:\n• ${vp('ai-dx')}.\n• Severity: ${vp('ai-severity')}.\n• ${v('ai-safety')}\n\nP:\n• ${vp('ai-tx')}.${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• Follow up in ${vp('ai-fu')}.`;
};

G.anxiety=function(){
  const drug=v('anx-drug');const med=drug?(v('anx-dose')?drug+' '+v('anx-dose'):drug):null;
  const sx=picks([['anx-worry','excessive worry'],['anx-restless','restlessness/on edge'],['anx-fatigue','fatigue'],['anx-concentration','poor concentration'],['anx-irritable','irritability'],['anx-muscle','muscle tension'],['anx-sleep','sleep disturbance'],['anx-avoidance','avoidance behaviour']]);
  const abnExam=picks([['anx-abnormal-speech','Abnormal speech'],['anx-disorganised','Disorganised thought'],['anx-psychosis-signs','Signs of psychosis']]);
  const plan=picks([['anx-monitor','Monitor for side effects and symptom changes'],['anx-lifestyle2','Lifestyle advice reinforced: sleep, exercise, limit caffeine'],['anx-breathing2','Breathing / relaxation techniques reinforced'],['anx-crisis','Crisis contact information provided'],['anx-referral2','Referral to mental health / counselling placed'],['anx-gad7rep','GAD-7 to be repeated at follow-up']]);
  const gad=v('anx-gad7');const panicVal=v('anx-panic');
  return `S:\nPatient presents for follow-up of anxiety. ${panicVal} ${sx.length?'Ongoing symptoms include: '+sx.join(', ')+'. ':'No significant ongoing symptoms reported. '}${v('anx-therapy')} ${v('anx-se')}\n\nO:\n${vp('anx-appear')}. Affect: ${vp('anx-affect')}.${abnExam.length?' Abnormal findings: '+abnExam.join(', ')+'.':' Normal speech, logical thought, no evidence of psychosis.'}${gad?' GAD-7: '+gad+'.':''}\n\nA:\n• ${vp('anx-status')}.\n• Safety: ${v('anx-safety')}\n\nP:\n• ${vp('anx-rx')}${med?' ('+med+')':''}.\n${bul(plan)}\n• Follow up in ${vp('anx-fu')}.`;
};

G.thyroid=function(){
  const drug=v('thy-drug')||'levothyroxine';const med=v('thy-dose')?drug+' '+v('thy-dose'):drug;
  const hyposx=picks([['thy-fatigue','fatigue'],['thy-weightgain','weight gain'],['thy-cold','cold intolerance'],['thy-constipation','constipation'],['thy-dryskin','dry skin/hair loss'],['thy-brainfog','brain fog'],['thy-depression','depressed mood'],['thy-bradycardia','bradycardia']]);
  const hypersx=picks([['thy-palp','palpitations'],['thy-sweating','sweating/heat intolerance'],['thy-tremor','tremor'],['thy-weightloss','weight loss'],['thy-insomnia','insomnia'],['thy-anxious','anxiety/restlessness']]);
  const plan=picks([['thy-refill','Refill '+med],['thy-timing','Reinforce correct timing: empty stomach 30–60 min before food'],['thy-labs','Repeat TSH in 6–8 weeks after any dose change'],['thy-labs-annual','Annual TSH and free T4 if stable'],['thy-interactions','Medication interactions reviewed (calcium, iron, antacids)'],['thy-endo','Endocrinology referral placed']]);
  const nd=v('thy-newdose');const mc=v('thy-medchanges');
  const vits=[v('thy-hr')?'HR: '+v('thy-hr')+' bpm':'',v('thy-wt')?'Weight: '+v('thy-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\n${pick(RV.full.thy.open)} ${vp('thy-adherence')} with ${med}.${mc?' Recent medication/supplement changes: '+mc+'.':' No recent medication or supplement changes.'} ${hyposx.length?'Hypothyroid symptoms: '+hyposx.join(', ')+'. ':pick(RV.full.thy.negHypo)}${hypersx.length?'Signs of possible over-replacement: '+hypersx.join(', ')+'. ':pick(RV.full.thy.negHyper)}\n\nO:\nTSH: ${v('thy-tsh')||'pending'}${v('thy-tshdate')?' ('+v('thy-tshdate')+')':''}. ${v('thy-t4')?'Free T4: '+v('thy-t4')+'. ':''}${vits?vits+'. ':''} ${v('thy-exam')}\n\nA:\n• ${vp('thy-status')}.\n• ${vp('thy-tol')}.\n\nP:\n• ${vp('thy-action')}${nd?'. New dose: '+nd:''}.\n${bul(plan)}\n• Follow up in ${vp('thy-fu')}.`;
};

G.gerd=function(){
  const drug=v('gerd-drug')||'PPI/H2 blocker';const med=v('gerd-dose')?drug+' '+v('gerd-dose'):drug;
  const sx=picks([['gerd-heartburn','heartburn/acid burning'],['gerd-regurgitation','regurgitation'],['gerd-chest','chest discomfort'],['gerd-dysphagia','dysphagia'],['gerd-belching','excessive belching/bloating'],['gerd-nocturnal','nocturnal symptoms']]);
  const rf=picks([['gerd-weightloss','unexplained weight loss'],['gerd-vomiting','persistent vomiting'],['gerd-bleeding','GI bleeding/melena'],['gerd-anaemia','anaemia'],['gerd-mass','palpable abdominal mass']]);
  const plan=picks([['gerd-refill','Refill '+med],['gerd-lifestyle','Lifestyle advice: elevate head of bed, avoid triggers, small meals'],['gerd-antacid','Antacid for breakthrough symptoms as needed'],['gerd-scope','Upper GI endoscopy referral placed'],['gerd-gastro','Gastroenterology referral placed'],['gerd-alarmwarn','Patient advised to return if alarm symptoms develop']]);
  const vits=[v('gerd-bp')?'BP: '+v('gerd-bp'):'',v('gerd-wt')?'Weight: '+v('gerd-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\n${pick(RV.full.gerd.open)} ${vp('gerd-adherence')} with ${med}. ${sx.length?'Ongoing symptoms: '+sx.join(', ')+'. ':pick(RV.full.gerd.negSx)}${v('gerd-control')} ${v('gerd-triggers')} ${rf.length?'Alarm symptoms present: '+rf.join(', ')+' — further investigation warranted.':pick(RV.full.gerd.negAlarm)}\n\nO:\n${vits?vits+'. ':''} ${v('gerd-exam')}\n\nA:\n• GERD — ${vp('gerd-status')}.\n• ${vp('gerd-redflag')}.\n\nP:\n• ${vp('gerd-action')}.\n${bul(plan)}\n• Follow up in ${vp('gerd-fu')}.`;
};

G.uti=function(){
  const usx=picks([['uti-dysuria','dysuria'],['uti-frequency','urinary frequency'],['uti-urgency','urinary urgency'],['uti-hematuria','haematuria'],['uti-cloudy','cloudy/foul-smelling urine'],['uti-suprapubic','suprapubic discomfort']]);
  const upsx=picks([['uti-fever','fever/chills'],['uti-flank','flank/loin pain'],['uti-nausea','nausea/vomiting'],['uti-rigors','rigors'],['uti-malaise','malaise']]);
  const abnExam=picks([['uti-suprapubic-tender','Suprapubic tenderness'],['uti-cva-tender','CVA tenderness'],['uti-vaginitis','Evidence of vaginitis']]);
  const plan=picks([['uti-abxed','Antibiotic course and completion explained'],['uti-hydration','Increased fluid intake advised'],['uti-analgesia','Analgesic for symptom relief if needed'],['uti-culture','Urine culture sent prior to antibiotics'],['uti-return','Return if no improvement in 48–72 hours or symptoms worsen'],['uti-prevention','Prevention advice: hygiene and voiding habits discussed'],['uti-refer','Urology / gynaecology referral for recurrent UTI']]);
  const abx=v('uti-abx');const abxdose=v('uti-abxdose');const allergies=v('uti-allergies');
  const isMale=v('uti-sex').toLowerCase().startsWith('male');
  const pregnancyLine=isMale?'':v('uti-pregnant');
  const vits=[v('uti-temp')?'Temp: '+v('uti-temp')+'\u00b0C':'',v('uti-bp')?'BP: '+v('uti-bp'):'',v('uti-hr')?'HR: '+v('uti-hr')+' bpm':''].filter(Boolean).join(', ');
  return `S:\n${vp('uti-sex')} patient presents with ${usx.length?usx.join(', '):'urinary symptoms'} for ${vp('uti-duration')}.${upsx.length?' Upper UTI / systemic symptoms: '+upsx.join(', ')+'.':' No fever, flank pain, nausea, or systemic symptoms.'} ${v('uti-recurrent')}${pregnancyLine?' '+pregnancyLine:''}${allergies?' Allergies: '+allergies+'.':' No known allergies.'}\n\nO:\n${vits?vits+'.':'Vitals stable.'}${abnExam.length?' Exam: '+abnExam.join(', ')+'.':' Abdomen: suprapubic area non-tender. No CVA tenderness.'}\nUrinalysis: ${vp('uti-ua')}.\n\nA:\n• ${vp('uti-dx')}.\n\nP:\n${abx?'• '+abx+(abxdose?' '+abxdose:'')+' prescribed.\n':''}${bul(plan)}\n• Follow up: ${vp('uti-fu')}.`;
};

// ── NEW GENERATORS ──────────────────────────────────────────

G['dep-initial']=function(){
  const drug=v('di-drug'); const dose=v('di-dose'); const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['di-low-mood','persistent low mood'],['di-anhedonia','anhedonia (loss of interest/pleasure)'],['di-fatigue','fatigue/low energy'],['di-concentration','poor concentration'],['di-worthless','feelings of worthlessness/guilt'],['di-sleep','sleep disturbance'],['di-appetite','appetite/weight change'],['di-psychomotor','psychomotor changes']]);
  const abnAppear=picks([['di-agitated','Agitated / psychomotor agitation'],['di-dishevelled','Dishevelled / poor self-care'],['di-uncooperative','Uncooperative'],['di-abnormal-speech','Abnormal rate or tone of speech'],['di-disorganised','Disorganised / illogical thought']]);
  const plan=picks([['di-edu','Psychoeducation on depression provided'],['di-lifestyle','Lifestyle advice: sleep hygiene, physical activity, routine'],['di-monitor','Monitor for side effects and response in 2–4 weeks'],['di-crisis','Crisis contact information provided'],['di-referral','Referral to mental health / counselling placed'],['di-safety-plan','Safety plan documented'],['di-phq9-repeat','PHQ-9 to be repeated at follow-up']]);
  const phq=v('di-phq9'); const meds=v('di-meds');
  return `S:\nPatient presents with depressive symptoms for ${vp('di-duration')}. Presenting concern: ${vp('di-reason')}. Symptoms include: ${sx.length?sx.join(', '):'[see notes]'}. ${v('di-si')} ${cap(v('di-trigger'))} ${cap(v('di-pmh'))} ${cap(v('di-fmh'))} ${cap(v('di-etoh'))}${meds?' Current medications: '+meds+'.':' No current medications or known allergies.'}\n\nO:\nMood: ${vp('di-omood')}. Affect: ${vp('di-affect')}.${abnAppear.length?' Abnormal behaviour / appearance: '+abnAppear.join(', ')+'.':' Cooperative, appropriate appearance, normal speech, logical thought process.'} ${v('di-psych')}${phq?' PHQ-9 score: '+phq+'.':''}\n\nA:\n• ${vp('di-dx')}.\n• Severity: ${vp('di-severity')}.\n• Safety: ${v('di-safety')}\n\nP:\n• ${vp('di-tx')}.${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• Follow up in ${vp('di-fu')}.`;
};

G.handpain=function(){
  const sx=picks([['hp-swelling','swelling of joint(s)'],['hp-stiffness','morning stiffness >30 min'],['hp-numbness','numbness/tingling in fingers'],['hp-weakness','weakness/reduced grip strength'],['hp-nightsymptoms','night-time symptoms'],['hp-locking','locking or triggering of finger(s)']]);
  const hx=picks([['hp-oa','osteoarthritis'],['hp-ra','rheumatoid arthritis'],['hp-trauma','recent trauma/fracture'],['hp-repetitive','repetitive occupational use'],['hp-diabetes','diabetes'],['hp-thyroid','thyroid disorder']]);
  const exam=picks([['hp-swelling-exam','Swelling noted'],['hp-tenderness','Tenderness on palpation'],['hp-reduced-rom','Reduced range of motion'],['hp-grip-weak','Reduced grip strength'],['hp-deformity','Joint deformity noted']]);
  const plan=picks([['hp-reassure','Reassure and educate patient'],['hp-analgesia','Analgesia: acetaminophen / NSAID PRN'],['hp-splint','Splinting recommended'],['hp-physio','Hand physiotherapy / occupational therapy referral placed'],['hp-injection','Corticosteroid injection considered / arranged'],['hp-imaging-plan','Imaging ordered (X-ray / ultrasound / MRI)'],['hp-rheum','Rheumatology referral placed'],['hp-ortho','Orthopedic / hand surgery referral placed'],['hp-nerve','Nerve conduction study ordered']]);
  return `S:\nPatient presents with ${vp('hp-char')} affecting the ${vp('hp-dominant').toLowerCase().replace(' affected','')} for ${vp('hp-duration')}. Onset: ${vp('hp-onset')}. Location: ${vp('hp-loc')}. ${v('hp-pain')?'Intensity '+v('hp-pain')+'/10.':''} ${sx.length?'Associated symptoms: '+sx.join(', ')+'. ':'No significant associated symptoms. '}Aggravated by ${vp('hp-aggr')}; relieved by ${vp('hp-relief')}. ${hx.length?'Relevant history: '+hx.join(', ')+'.':'No significant past hand or joint history.'}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\nSpecial tests: ${vp('hp-tests')}.\nImaging: ${vp('hp-xray')}.\n\nA:\n${vp('hp-dx')}.\n\nP:\n${bul(plan)}\n• Follow up in ${vp('hp-fu')}.`;
};

G.kneepain=function(){
  const sx=picks([['kp-swelling','swelling/effusion'],['kp-stiffness','morning stiffness >30 min'],['kp-locking','locking or catching'],['kp-giving-way','giving way/instability'],['kp-crepitus','crepitus'],['kp-night','night pain']]);
  const hx=picks([['kp-oa','osteoarthritis'],['kp-ra','rheumatoid arthritis'],['kp-trauma','recent trauma/twisting injury'],['kp-overweight','overweight/obesity'],['kp-prev-injury','previous knee injury or surgery'],['kp-sport','high-impact sport/activity']]);
  const exam=picks([['kp-effusion','Effusion on exam'],['kp-tender','Joint line tenderness'],['kp-reduced-rom','Reduced range of motion'],['kp-instability','Ligamentous instability on exam'],['kp-neuro-deficit','Neurovascular deficit']]);
  const plan=picks([['kp-reassure','Reassure and educate patient'],['kp-analgesia','Analgesia: acetaminophen / NSAID PRN'],['kp-ice','Ice and elevation for acute swelling'],['kp-physio','Physiotherapy referral for strengthening and mobility'],['kp-weightloss','Weight loss counselled'],['kp-brace','Knee brace / support recommended'],['kp-injection','Corticosteroid / hyaluronic acid injection considered'],['kp-imaging-plan','Further imaging ordered (X-ray / MRI)'],['kp-ortho','Orthopedic referral placed'],['kp-activity-mod','Activity modification advised']]);
  const kpOnset=v('kp-onset');
  const kpOnsetStr=kpOnset.toLowerCase().includes('onset')?kpOnset:kpOnset+'.';
  return `S:\nPatient presents with ${vp('kp-side').toLowerCase()} pain for ${vp('kp-duration')}. Onset: ${kpOnsetStr} Location: ${vp('kp-loc')}, character: ${vp('kp-char')}${pain('kp-pain','intensity')}. ${sx.length?'Associated symptoms: '+sx.join(', ')+'. ':'No swelling, locking, giving way, or significant associated symptoms. '}Aggravated by ${vp('kp-aggr')}; relieved by ${vp('kp-relief')}. ${hx.length?'Relevant history: '+hx.join(', ')+'.':'No significant past knee or joint history.'}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\nSpecial tests: ${vp('kp-tests')}.\nImaging: ${vp('kp-xray')}.\n\nA:\n${vp('kp-dx')}.\n\nP:\n${bul(plan)}\n• Follow up in ${vp('kp-fu')}.`;
};

G.ihd=function(){
  const meds=v('ihd-meds');
  const sx=picks([['ihd-angina','chest pain/angina'],['ihd-sob','shortness of breath on exertion'],['ihd-sob-rest','shortness of breath at rest'],['ihd-palpitations','palpitations'],['ihd-syncope','syncope/pre-syncope'],['ihd-edema','peripheral oedema'],['ihd-fatigue','fatigue/reduced exercise tolerance'],['ihd-orthopnoea','orthopnoea/PND']]);
  const rf=picks([['ihd-smoking','active smoking'],['ihd-dm','poorly controlled diabetes'],['ihd-htn-uctrl','poorly controlled hypertension'],['ihd-dyslip','dyslipidaemia on treatment'],['ihd-overweight','overweight/obesity'],['ihd-inactive','sedentary lifestyle']]);
  const abnExam=picks([['ihd-acute-distress','Acute distress'],['ihd-murmur','Cardiac murmur'],['ihd-lungs-abn','Lungs abnormal (crackles / wheeze)'],['ihd-edema-exam','Peripheral oedema'],['ihd-raised-jvp','Raised JVP']]);
  const plan=picks([['ihd-contmeds','Continue all current cardiac medications'],['ihd-aspirin','Aspirin / antiplatelet therapy continued'],['ihd-statin','Statin therapy reviewed and continued'],['ihd-bblocker','Beta-blocker dose reviewed'],['ihd-acei','ACE inhibitor / ARB reviewed'],['ihd-lipids','Lipid panel ordered if not done within last year'],['ihd-ecg','ECG ordered / reviewed'],['ihd-exercise','Cardiac rehabilitation / structured exercise advised'],['ihd-smoking-cessation','Smoking cessation support offered'],['ihd-diet','Heart-healthy diet counselled'],['ihd-cardio-ref','Cardiology referral placed'],['ihd-stress','Stress test / imaging ordered']]);
  const ldl=v('ihd-ldl');
  const oVits=[v('ihd-bp')?'BP: '+v('ihd-bp'):'',v('ihd-hr')?'HR: '+v('ihd-hr')+' bpm':'',v('ihd-wt')?'Weight: '+v('ihd-wt')+' lbs':'',v('ihd-spo2')?'SpO2: '+v('ihd-spo2')+'%':''].filter(Boolean).join('. ');
  return `S:\nPatient presents for follow-up of ischemic heart disease. ${meds?'Current medications: '+meds+'. ':''}${v('ihd-adherence')} ${sx.length?'Current symptoms: '+sx.join(', ')+'. ':'Denies chest pain, shortness of breath, palpitations, syncope, fatigue, or reduced exercise tolerance. '}${vp('ihd-angina-freq')}. GTN use: ${vp('ihd-gtn')}.${rf.length?' Active cardiac risk factors: '+rf.join(', ')+'.':''}\n\nO:\n${oVits?oVits+'.':'Vitals stable.'}\n${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'No acute distress. CV: regular rate and rhythm. Lungs clear. No peripheral oedema.'}\n${vp('ihd-invx')}.${ldl?'\n'+ldl+'.':''}\n\nA:\n• ${vp('ihd-status')}.\n• ${vp('ihd-riskctrl')}.\n\nP:\n${bul(plan)}\n• Follow up in ${vp('ihd-fu')}.`;
};

G.hf=function(){
  const meds=v('hf-meds');
  const sx=picks([['hf-sob-exert','shortness of breath on exertion'],['hf-sob-rest','shortness of breath at rest'],['hf-orthopnoea','orthopnoea'],['hf-pnd','paroxysmal nocturnal dyspnoea (PND)'],['hf-edema','peripheral oedema'],['hf-fatigue','fatigue/reduced exercise tolerance'],['hf-palpitations','palpitations'],['hf-syncope','syncope/pre-syncope']]);
  const abnExam=picks([['hf-acute-distress','Acute distress'],['hf-murmur','Murmur / abnormal rhythm'],['hf-crackles','Bibasal crackles on auscultation'],['hf-edema-exam','Peripheral oedema'],['hf-raised-jvp','Raised JVP']]);
  const plan=picks([['hf-contmeds','Continue all current heart failure medications'],['hf-diuretic','Diuretic dose reviewed and optimised'],['hf-acei-arb','ACE inhibitor / ARB / ARNI reviewed'],['hf-bblocker','Beta-blocker reviewed'],['hf-mra','Mineralocorticoid antagonist reviewed'],['hf-sglt2','SGLT2 inhibitor reviewed / initiated'],['hf-electrolytes','Renal function and electrolytes monitored'],['hf-bnp','BNP / NT-proBNP ordered'],['hf-echo','Echocardiogram ordered / reviewed'],['hf-fluid-ed','Fluid restriction and low-sodium diet reinforced'],['hf-weight-ed','Daily weight monitoring reinforced'],['hf-rehab','Cardiac rehabilitation referral placed'],['hf-cardio','Cardiology referral placed'],['hf-er-warn','Patient advised to present to ER if: acute shortness of breath, weight gain >2 kg (about 5 lbs) in 3 days, or worsening symptoms']]);
  const ef=v('hf-ef');
  const hfType=v('hf-type').charAt(0).toLowerCase()+v('hf-type').slice(1).replace(/\.$/,'');
  const oVits=[v('hf-bp')?'BP: '+v('hf-bp'):'',v('hf-hr')?'HR: '+v('hf-hr')+' bpm':'',v('hf-wt')?'Weight: '+v('hf-wt')+' lbs':'',v('hf-spo2')?'SpO2: '+v('hf-spo2')+'%':'',v('hf-rr')?'RR: '+v('hf-rr'):''].filter(Boolean).join('. ');
  return `S:\nPatient presents for follow-up of ${hfType}. ${meds?'Current medications: '+meds+'. ':''}${v('hf-adherence')} ${cap(v('hf-weight-mon'))} ${sx.length?'Current symptoms: '+sx.join(', ')+'. ':'No significant symptoms of decompensation reported. '}${vp('hf-nyha')}. ${vp('hf-fluid')}.\n\nO:\n${oVits?oVits+'.':'Vitals stable.'}\n${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'No acute distress. Regular rate and rhythm. Lungs clear. No oedema. No raised JVP.'}\n${vp('hf-invx')}.${ef?'\n'+ef+'.':''}\n\nA:\n• ${vp('hf-status')}.\n• ${vp('hf-volume')}.\n\nP:\n${bul(plan)}\n• Follow up in ${vp('hf-fu')}.`;
};
// ── COMPACT MODE TOGGLE ──────────────────────────────────────
let compactMode = false;

function toggleMode() {
  compactMode = !compactMode;
  const btn = document.getElementById('mode-toggle');
  const badge = document.getElementById('mode-badge');
  if (compactMode) {
    btn.textContent = 'Full Mode';
    btn.classList.add('active-compact');
    badge.style.display = 'inline-block';
  } else {
    btn.textContent = 'Compact Mode';
    btn.classList.remove('active-compact');
    badge.style.display = 'none';
  }
  // If a note is already generated, regenerate it in the new mode
  const out = document.getElementById('visit-out');
  if (out && out.style.display !== 'none') generateVisit();
  if (typeof saveState === 'function') saveState();
}

// ── COMPACT GENERATORS ──────────────────────────────────────
// Same forms, same checkbox IDs. Output only positive findings.

function vits(pairs) {
  return pairs.filter(([val]) => val).map(([val, lbl]) => lbl + ': ' + val).join(', ');
}

const C = {

refill(){
  const cond=v('rx-condition');
  const meds=medList('rx')||'current medication';
  const sx=v('rx-sx'), seDetail=v('rx-se-detail'), labs=v('rx-labs');
  const examDetail=v('rx-exam-detail'), supply=v('rx-supply'), other=v('rx-p-other');
  const oVits=vits([[v('rx-bp'),'BP'],[v('rx-hr'),'HR'],[v('rx-wt'),'wt']]);
  const seVal=v('rx-se');
  const seLine=seVal.toLowerCase().startsWith('no ')?'':seVal;
  const examVal=v('rx-exam');
  const examLine=examVal.toLowerCase().startsWith('no acute')?'':examVal;
  const plan=picks([
    ['rx-p-refill','Refill '+meds+(supply?' — '+supply:'')],
    ['rx-p-continue','Continue current dose'],
    ['rx-p-adjust','Dose adjusted'],
    ['rx-p-labs','Labs / monitoring ordered'],
    ['rx-p-lifestyle','Lifestyle reinforced'],
    ['rx-p-counsel','Counselled on side effects'],
    ['rx-p-adherence','Adherence discussed'],
    ['rx-p-referral','Referral placed']
  ]);
  if(other)plan.push(cap(other));
  return `${pick(RV.compact.refill.open)}${cond?' — '+cond:''}. ${meds}, ${vp('rx-adherence')}, ${vp('rx-interval')}.${sx?' '+cap(ensureDot(sx)):''}${seLine?' '+seLine:''}${seDetail?' '+cap(ensureDot(seDetail)):''}

O: ${oVits?oVits+'.':''}${labs?' '+cap(ensureDot(labs)):''}${examLine?' '+examLine:''}${examDetail?' '+cap(ensureDot(examDetail)):''}

A: ${cond?cap(cond):'Chronic therapy'} — ${vp('rx-status')}. ${v('rx-tol')}

P:
${bul(plan)}
• F/u ${vp('rx-fu')}.`;
},

'dep-initial'() {
  const drug=v('di-drug');const dose=v('di-dose');const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['di-low-mood','low mood'],['di-anhedonia','anhedonia'],['di-fatigue','fatigue'],['di-concentration','poor concentration'],['di-worthless','worthlessness/guilt'],['di-sleep','sleep disturbance'],['di-appetite','appetite change'],['di-psychomotor','psychomotor changes']]);
  const abnAppear=picks([['di-agitated','Agitated'],['di-dishevelled','Dishevelled'],['di-uncooperative','Uncooperative'],['di-abnormal-speech','Abnormal speech'],['di-disorganised','Disorganised thought']]);
  const plan=picks([['di-edu','Psychoeducation provided'],['di-lifestyle','Lifestyle advice given'],['di-monitor','Monitor response 2–4 wks'],['di-crisis','Crisis line provided'],['di-referral','Mental health referral'],['di-safety-plan','Safety plan documented'],['di-phq9-repeat','PHQ-9 at f/u']]);
  const phq=v('di-phq9');const siVal=v('di-si');const siLine=siVal.toLowerCase().startsWith('denies')?'':'SI: '+siVal;
  return `S: New presentation — depressive sx for ${vp('di-duration')}.${sx.length?' Sx: '+sx.join(', ')+'.':''} ${v('di-trigger')} ${v('di-etoh')}${siLine?' '+siLine:''}\n\nO: Mood: ${vp('di-omood')}. Affect: ${vp('di-affect')}.${abnAppear.length?' Abnormal: '+abnAppear.join(', ')+'.':''} ${v('di-psych')}${phq?' PHQ-9: '+phq+'.':''}\n\nA: ${vp('di-dx')} — ${vp('di-severity')}.\n\nP:\n• ${vp('di-tx')}.${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• F/u ${vp('di-fu')}.`;
},

depression() {
  const namedDrug=v('dep-drug');const drug=namedDrug||'current antidepressant';const med=v('dep-dose')?drug+' '+v('dep-dose'):drug;
  const sx=picks([['dep-fatigue','fatigue'],['dep-motivation','low motivation'],['dep-anhedonia','anhedonia'],['dep-concentration','poor concentration']]);
  const abnAppear=picks([['dep-agitated','Agitated'],['dep-dishevelled','Dishevelled'],['dep-uncooperative','Uncooperative'],['dep-abnormal-speech','Abnormal speech'],['dep-disorganised','Disorganised thought']]);
  const plan=picks([['dep-monitor','Monitor side effects and mood'],['dep-sleep-hyg','Sleep hygiene and routine'],['dep-activity','Regular physical activity'],['dep-crisis','Crisis line provided'],['dep-referral','Mental health / counselling referral'],['dep-therapy','CBT / therapy discussed']]);
  const safetyVal=v('dep-safety');const safetyLine=safetyVal.toLowerCase().includes('no acute')?'':'Safety: '+safetyVal;
  const seVal=v('dep-se');
  return `S: F/u depression. Mood ${vp('dep-mood')} on ${med}.${sx.length?' Sx: '+sx.join(', ')+'.':''} Sleep: ${vp('dep-sleep')}. Appetite: ${vp('dep-appetite')}.${!seVal.toLowerCase().startsWith('no')?' '+seVal:''}\n\nO: Mood: ${vp('dep-omood')}. Affect: ${vp('dep-affect')}.${abnAppear.length?' Abnormal: '+abnAppear.join(', ')+'.':''}\n\nA: MDD — ${vp('dep-status')}.${safetyLine?' '+safetyLine:''}\n\nP:\n• ${vp('dep-rx')}${namedDrug?' ('+med+')':''}.\n${bul(plan)}\n• F/u ${vp('dep-fu')}.`;
},

'anx-initial'() {
  const drug=v('ai-drug');const dose=v('ai-dose');const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['ai-worry','excessive worry'],['ai-restless','restlessness'],['ai-fatigue','fatigue'],['ai-concentration','poor concentration'],['ai-irritable','irritability'],['ai-muscle','muscle tension'],['ai-sleep','sleep disturbance'],['ai-panic','panic attacks']]);
  const phys=picks([['ai-palpitations','palpitations'],['ai-sweating','sweating'],['ai-trembling','trembling'],['ai-sob','SOB'],['ai-chest','chest tightness'],['ai-dizziness','dizziness']]);
  const plan=picks([['ai-edu','Psychoeducation provided'],['ai-lifestyle','Lifestyle: sleep, exercise, limit caffeine'],['ai-breathing','Breathing/relaxation techniques'],['ai-monitor','Monitor response'],['ai-crisis','Crisis line provided'],['ai-referral','Mental health referral'],['ai-gad7rep','GAD-7 at f/u']]);
  const gad=v('ai-gad7');
  return `S: ${vp('ai-reason')} for ${vp('ai-duration')}.${sx.length?' Sx: '+sx.join(', ')+'.':''}${phys.length?' Physical: '+phys.join(', ')+'.':''}\n\nO: ${vp('ai-appear')}.${gad?' GAD-7: '+gad+'.':''}\n\nA: ${vp('ai-dx')} — ${vp('ai-severity')}.\n\nP:\n• ${vp('ai-tx')}.${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• F/u ${vp('ai-fu')}.`;
},

anxiety() {
  const drug=v('anx-drug');const med=drug?(v('anx-dose')?drug+' '+v('anx-dose'):drug):null;
  const sx=picks([['anx-worry','worry'],['anx-restless','restlessness'],['anx-fatigue','fatigue'],['anx-concentration','poor concentration'],['anx-irritable','irritability'],['anx-muscle','muscle tension'],['anx-sleep','sleep disturbance'],['anx-avoidance','avoidance']]);
  const plan=picks([['anx-monitor','Monitor sx'],['anx-lifestyle2','Lifestyle reinforced'],['anx-breathing2','Breathing/relaxation reinforced'],['anx-crisis','Crisis line provided'],['anx-referral2','Mental health referral'],['anx-gad7rep','GAD-7 at f/u']]);
  const gad=v('anx-gad7');const panicVal=v('anx-panic');
  return `S: F/u anxiety.${!panicVal.toLowerCase().startsWith('no panic')?' '+panicVal:''}${sx.length?' Sx: '+sx.join(', ')+'.':''} ${vp('anx-therapy')}.${!v('anx-se').toLowerCase().startsWith('no')?' '+v('anx-se'):''}\n\nO: ${vp('anx-appear')}.${gad?' GAD-7: '+gad+'.':''}\n\nA: ${vp('anx-status')}.\n\nP:\n• ${vp('anx-rx')}${med?' ('+med+')':''}.\n${bul(plan)}\n• F/u ${vp('anx-fu')}.`;
},

t2dm() {
  const drug=v('dm-drug')||'DM med';const med=v('dm-dose')?drug+' '+v('dm-dose'):drug;
  const sx=picks([['dm-hypo','hypoglycemia'],['dm-hyper','hyperglycemia'],['dm-polyuria','polyuria'],['dm-polydipsia','polydipsia'],['dm-fatigue','fatigue'],['dm-se','side effects']]);
  const plan=picks([['dm-refill','Refill '+med],['dm-continue','Continue DM management'],['dm-diet','Diet and exercise'],['dm-labs','A1C / labs if due'],['dm-footcheck','Foot exam'],['dm-bp-plan','BP reviewed']]);
  const a1c=v('dm-a1c');const a1cd=v('dm-a1cdate');
  const oVits=vits([[v('dm-bp'),'BP'],[v('dm-hr'),'HR'],[v('dm-wt'),'wt']]);
  const examVal=v('dm-exam');const examLine=examVal.toLowerCase().startsWith('no acute')?'':'Exam: '+examVal;
  return `${pick(RV.compact.dm.open)} ${med}, ${vp('dm-adherence')}.${sx.length?' Sx: '+sx.join(', ')+'.':''}\n\nO: A1C ${a1c?a1c+'%':'pending'}${a1cd?' ('+a1cd+')':''}${oVits?', '+oVits:''}.${examLine?' '+examLine:''}\n\nA: T2DM — ${vp('dm-status')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('dm-fu')}.`;
},

htn() {
  const med1=v('htn-med1');const med2=v('htn-med2');
  const meds=[med1,med2].filter(Boolean).join(', ')||'antihypertensives';
  const sx=picks([['htn-cp','chest pain'],['htn-sob','SOB'],['htn-ha','headache'],['htn-dizzy','dizziness'],['htn-se','side effects'],['htn-er','ER visit']]);
  const abnExam=picks([['htn-acute-distress','Acute distress'],['htn-murmur','Murmur'],['htn-lungs-abn','Lungs abnormal'],['htn-edema','Edema']]);
  const plan=picks([['htn-refill','Refill '+meds],['htn-lifestyle','Lifestyle modifications'],['htn-homebp-plan','Home BP monitoring'],['htn-cmp','Electrolytes/creatinine if due'],['htn-echo','Echo / cardiology referral'],['htn-sodium','Low-sodium diet']]);
  const homebp=v('htn-homebp');const oVits=vits([[v('htn-bp'),'BP'],[v('htn-hr'),'HR']]);
  return `${pick(RV.compact.htn.open)} ${meds}.${sx.length?' Reports: '+sx.join(', ')+'.':''} ${vp('htn-adherence')}.${homebp?' Home BP ~'+homebp+'.':''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':''}\n\nA: HTN — ${vp('htn-control')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('htn-fu')}.`;
},

thyroid() {
  const drug=v('thy-drug')||'levothyroxine';const med=v('thy-dose')?drug+' '+v('thy-dose'):drug;
  const hyposx=picks([['thy-fatigue','fatigue'],['thy-weightgain','weight gain'],['thy-cold','cold intolerance'],['thy-constipation','constipation'],['thy-dryskin','dry skin/hair loss'],['thy-brainfog','brain fog'],['thy-depression','low mood'],['thy-bradycardia','bradycardia']]);
  const hypersx=picks([['thy-palp','palpitations'],['thy-sweating','heat intolerance'],['thy-tremor','tremor'],['thy-weightloss','weight loss'],['thy-insomnia','insomnia'],['thy-anxious','anxiety']]);
  const plan=picks([['thy-refill','Refill '+med],['thy-timing','Correct timing reinforced'],['thy-labs','TSH in 6–8 wks (dose change)'],['thy-labs-annual','Annual TSH/T4'],['thy-interactions','Drug interactions reviewed'],['thy-endo','Endocrinology referral']]);
  const nd=v('thy-newdose');const oVits=vits([[v('thy-hr'),'HR'],[v('thy-wt'),'wt']]);
  return `${pick(RV.compact.thy.open)} ${med}, ${vp('thy-adherence')}.${hyposx.length?' Hypothyroid sx: '+hyposx.join(', ')+'.':''}${hypersx.length?' Over-replacement sx: '+hypersx.join(', ')+'.':''}\n\nO: TSH ${v('thy-tsh')||'pending'}${v('thy-tshdate')?' ('+v('thy-tshdate')+')':''}${v('thy-t4')?', T4 '+v('thy-t4'):''}${oVits?', '+oVits:''}. ${v('thy-exam')}\n\nA: ${vp('thy-status')}.\n\nP:\n• ${vp('thy-action')}${nd?' — '+nd:''}.\n${bul(plan)}\n• F/u ${vp('thy-fu')}.`;
},

gerd() {
  const drug=v('gerd-drug')||'PPI/H2 blocker';const med=v('gerd-dose')?drug+' '+v('gerd-dose'):drug;
  const sx=picks([['gerd-heartburn','heartburn'],['gerd-regurgitation','regurgitation'],['gerd-chest','chest discomfort'],['gerd-dysphagia','dysphagia'],['gerd-belching','bloating'],['gerd-nocturnal','nocturnal sx']]);
  const rf=picks([['gerd-weightloss','weight loss'],['gerd-vomiting','persistent vomiting'],['gerd-bleeding','GI bleeding'],['gerd-anaemia','anaemia'],['gerd-mass','abdominal mass']]);
  const plan=picks([['gerd-refill','Refill '+med],['gerd-lifestyle','Lifestyle: elevate head of bed, avoid triggers'],['gerd-antacid','Antacid PRN'],['gerd-scope','GI endoscopy referral'],['gerd-gastro','Gastroenterology referral'],['gerd-alarmwarn','Return if alarm sx']]);
  const oVits=vits([[v('gerd-bp'),'BP'],[v('gerd-wt'),'wt']]);
  return `${pick(RV.compact.gerd.open)} ${med}, ${vp('gerd-adherence')}.${sx.length?' Sx: '+sx.join(', ')+'.':''}${rf.length?' Alarm sx: '+rf.join(', ')+' — investigation warranted.':''}\n\nO: ${oVits||'Vitals stable'}. ${v('gerd-exam')}\n\nA: GERD — ${vp('gerd-status')}.\n\nP:\n• ${vp('gerd-action')}.\n${bul(plan)}\n• F/u ${vp('gerd-fu')}.`;
},

inr() {
  const flags=picks([['inr-bleeding','bleeding/bruising'],['inr-hematuria','hematuria'],['inr-stools','melena'],['inr-missed','missed doses'],['inr-extra','extra doses'],['inr-newmeds','new meds'],['inr-diet','dietary changes'],['inr-newsymptoms','new sx']]);
  const abnSigns=picks([['inr-bruising','Bruising/petechiae'],['inr-bleeding-signs','Active bleeding'],['inr-edema','Edema']]);
  const edu=picks([['inr-edu-diet','Diet/adherence reviewed'],['inr-edu-bleed','Bleeding signs discussed'],['inr-edu-adhere','Adherence reinforced'],['inr-edu-interact','Drug interactions reviewed']]);
  const nd=v('inr-newdose');const dn=v('inr-diet-notes');const mc=v('inr-med-changes');
  const inrStatus=v('inr-status');const inrStable=inrStatus==='within target range';
  const sLines=[];
  if(flags.length) sLines.push('Reports: '+flags.join(', '));
  if(dn) sLines.push('Diet: '+dn);
  if(mc) sLines.push('Med change: '+mc);
  const inrVal=v('inr-value');const inrDose=v('inr-dose');const inrTarget=v('inr-target');
  const oParts=[inrVal?'INR '+inrVal+(inrTarget?' (target '+inrTarget+')':''):'',inrDose?'warfarin '+inrDose:''].filter(Boolean).join(', ');
  return `S: INR check.${sLines.length?' '+sLines.join('. ')+'.':' No concerns.'}\n\nO: ${oParts?oParts+'.':'As per chart.'}${abnSigns.length?' '+abnSigns.join(', ')+'.':''}\n\nA: ${inrStable?'INR therapeutic.':'INR '+vp('inr-status')+' — dose adjustment required.'}\n\nP:\n• ${vp('inr-action')}${nd?' — '+nd:''}.\n• Recheck INR in ${vp('inr-recheck')}.\n${bul(edu)}`;
},

backpain() {
  const rf=picks([['bp-radiation','radiation'],['bp-numbness','numbness/tingling'],['bp-weakness','weakness'],['bp-bowel','bowel/bladder changes'],['bp-fever','fever/weight loss']]);
  const posExam=picks([['bp-stable','Vitals stable'],['bp-tender','Paraspinal tenderness'],['bp-limited-flex','Limited flexion']]);
  const abnExam=picks([['bp-midline-tender','Midline tenderness'],['bp-neuro-deficit','Neuro deficit'],['bp-slr-pos','SLR positive']]);
  const onset=v('bp-onset');const onsetStr=onset.startsWith('gradual')?'gradual onset':'onset '+onset;
  const plan=picks([['bp-reassure','Reassured'],['bp-activity','Gentle activity'],['bp-ibu','Ibuprofen 400 mg q6–8h PRN'],['bp-heat','Heat'],['bp-stretch','Stretching'],['bp-physio','Physio referral'],['bp-imaging','Imaging ordered'],['bp-neuro-warn','Return if neuro sx']]);
  const examOut=[...posExam,...(abnExam.length?['Abnormal: '+abnExam.join(', ')]:['Neuro intact, SLR negative'])];
  return `S: Low back pain for ${vp('bp-duration')}, ${onsetStr}. ${vp('bp-char')}${pain('bp-pain-rest','rest')}${pain('bp-pain-move','mvmt')}.${rf.length?' Red flags: '+rf.join(', ')+'.':''}\n\nO: ${examOut.join('. ')}.\n\nA: ${vp('bp-dx')}.${rf.length?' Red flags present — serious pathology to be excluded.':''}\n\nP:\n${bul(plan)}\n• F/u ${vp('bp-fu')}.`;
},

headache() {
  const assoc=picks([['ha-nausea','nausea'],['ha-vomit','vomiting'],['ha-visual','visual changes'],['ha-photo','photophobia'],['ha-phono','phonophobia'],['ha-weakness','weakness']]);
  const abnExam=picks([['ha-neuro-deficit','Focal neuro deficit'],['ha-cn-deficit','Cranial nerve deficit'],['ha-papilloedema','Papilloedema'],['ha-neck-stiff','Neck stiffness'],['ha-sinus-tender','Sinus/temporal artery tenderness'],['ha-disoriented','Disoriented']]);
  const plan=picks([['ha-reassure','Reassurance, stress management'],['ha-sleep','Adequate sleep advised'],['ha-apap','Acetaminophen 500 mg q6h PRN'],['ha-ibu','Ibuprofen 400 mg q6–8h PRN'],['ha-hydration','Hydration/regular meals'],['ha-caffeine','Reduce caffeine/screen time'],['ha-triptan','Triptan prescribed'],['ha-neuro','Neurology referral']]);
  return `S: Headache for ${vp('ha-dur')}, ${vp('ha-onset')}. ${vp('ha-loc')}, ${vp('ha-char')}${pain('ha-pain')}.${assoc.length?' '+assoc.join(', ')+'.':''} Aggravated by ${vp('ha-aggr')}.\n\nO:${chk('ha-disoriented')?'':' Alert, oriented.'}${abnExam.length?' Abnormal: '+abnExam.join(', ')+'.':' No focal neuro deficits.'}\n\nA: ${vp('ha-dx')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('ha-fu')}.`;
},

chestpain() {
  const assoc=picks([['cp-radiation','radiation to arm/jaw'],['cp-sob','SOB'],['cp-nausea','nausea'],['cp-diaphoresis','diaphoresis'],['cp-palp','palpitations'],['cp-syncope','syncope']]);
  const hx=picks([['cp-htn','HTN'],['cp-cardiac','cardiac hx'],['cp-smoker','smoker'],['cp-dm','DM'],['cp-trauma','recent trauma']]);
  const abnExam=picks([['cp-acute-distress','Acute distress'],['cp-murmur','Murmur'],['cp-lungs-abn','Lungs abnormal'],['cp-abd-tender','Abdominal tenderness'],['cp-cw-tender','Chest wall tenderness']]);
  const plan=picks([['cp-ecg-ord','ECG ordered'],['cp-troponin','Troponin ordered'],['cp-reassure','Reassured'],['cp-no-exert','Avoid exertion'],['cp-nsaid','NSAID if cardiac excluded'],['cp-er-warn','ER precautions given'],['cp-cardio','Cardiology referral'],['cp-stress','Stress test ordered']]);
  const oVits=vits([[v('cp-bp'),'BP'],[v('cp-hr'),'HR'],[v('cp-rr'),'RR'],[v('cp-temp'),'T'],[v('cp-spo2'),'SpO2']]);
  return `S: Chest pain for ${vp('cp-dur')}, ${vp('cp-loc').toLowerCase()}${pain('cp-pain')}, ${vp('cp-onset').toLowerCase()}.${assoc.length?' '+assoc.join(', ')+'.':''}${hx.length?' PMHx: '+hx.join(', ')+'.':''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':''} ECG: ${vp('cp-ecg')}.\n\nA: ${vp('cp-dx')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('cp-fu')}.`;
},

cold() {
  const sx=picks([['cold-cough','cough'],['cold-throat','sore throat'],['cold-runny','runny nose'],['cold-fatigue','fatigue'],['cold-congestion','congestion'],['cold-fever','fever'],['cold-sob','SOB'],['cold-myalgia','myalgia']]);
  const abnExam=picks([['cold-nasal-congest','Nasal congestion'],['cold-pharynx','Pharyngeal erythema'],['cold-exudate','Tonsillar exudate'],['cold-lymph','Lymphadenopathy'],['cold-lungs-abn','Lungs abnormal']]);
  const plan=picks([['cold-reassure','Reassured — viral'],['cold-rest','Rest + fluids'],['cold-gargle','Saltwater gargles'],['cold-saline','Saline nasal spray'],['cold-apap','Acetaminophen/ibuprofen PRN'],['cold-no-abx','No antibiotics'],['cold-swab','Swab ordered'],['cold-return','Return if >10d, worse, or fever >38.5\u00b0C']]);
  const oVits=vits([[v('cold-temp'),'T'],[v('cold-spo2'),'SpO2'],[v('cold-hr'),'HR']]);
  return `S: ${sx.length?sx.join(', '):'Upper respiratory sx'} for ${vp('cold-dur')}. ${v('cold-self')}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':' Lungs clear, no lymphadenopathy, no exudate.'}\n\nA: ${vp('cold-dx')}.\n\nP:\n${bul(plan)}`;
},

uti() {
  const usx=picks([['uti-dysuria','dysuria'],['uti-frequency','frequency'],['uti-urgency','urgency'],['uti-hematuria','hematuria'],['uti-cloudy','cloudy urine'],['uti-suprapubic','suprapubic pain']]);
  const upsx=picks([['uti-fever','fever/chills'],['uti-flank','flank pain'],['uti-nausea','nausea'],['uti-rigors','rigors'],['uti-malaise','malaise']]);
  const abnExam=picks([['uti-suprapubic-tender','Suprapubic tenderness'],['uti-cva-tender','CVA tenderness'],['uti-vaginitis','Vaginitis on exam']]);
  const plan=picks([['uti-abxed','Abx course explained'],['uti-hydration','Increased fluids'],['uti-analgesia','Analgesic PRN'],['uti-culture','Urine C&S sent'],['uti-return','Return if no improvement 48–72h'],['uti-prevention','Prevention advice'],['uti-refer','Urology/gynaecology referral']]);
  const abx=v('uti-abx');const abxdose=v('uti-abxdose');
  const oVits=vits([[v('uti-temp'),'T'],[v('uti-bp'),'BP'],[v('uti-hr'),'HR']]);
  return `S: ${vp('uti-sex')} — ${usx.length?usx.join(', '):'urinary sx'} for ${vp('uti-duration')}.${upsx.length?' Systemic: '+upsx.join(', ')+'.':''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':''} UA: ${vp('uti-ua')}.\n\nA: ${vp('uti-dx')}.\n\nP:\n${abx?'• '+abx+(abxdose?' '+abxdose:'')+' prescribed.\n':''}${bul(plan)}\n• F/u ${vp('uti-fu')}.`;
},

child() {
  const st=picks([['ch-eating','eating well'],['ch-sleeping','sleeping well'],['ch-active','active'],['ch-milestones','milestones met']]);
  const age=v('ch-age');
  const abnSys=picks([['ch-general-abn','distress/unwell'],['ch-heent-abn','HEENT abnormal'],['ch-neck-abn','Lymphadenopathy/neck stiffness'],['ch-cardiac-abn','Murmur/irregular rhythm'],['ch-resp-abn','Abnormal breath sounds'],['ch-abd-abn','Abdomen: tender/organomegaly'],['ch-skin-abn','Rash/lesion'],['ch-msk-abn','Abnormal tone/gait'],['ch-neuro-abn','Developmental concern']]);
  const plan=picks([['ch-diet','Healthy diet/activity'],['ch-safety','Anticipatory guidance'],['ch-nutrition','Nutrition counselling'],['ch-screen','Screen time guidance'],['ch-referral','Referral placed — details in chart']]);
  const wt=v('ch-wt');const wtpct=v('ch-wt-pct');const ht=v('ch-ht');const htpct=v('ch-ht-pct');
  const growthLine=[wt?'Wt '+wt+' lbs'+(wtpct?' ('+wtpct+' %ile)':''):'',ht?'Ht '+ht+(htpct?' ('+htpct+' %ile)':''):''].filter(Boolean).join(', ');
  const immDeclined=v('ch-imm').toLowerCase().includes('declin');
  return `S: ${age?age+', ':''}${vp('ch-type')}.${st.length?' Child is '+st.join(', ')+'.':''} ${v('ch-illness')} ${v('ch-imm')}\n\nO: ${growthLine||'Growth reviewed'}.${abnSys.length?' Abnormal: '+abnSys.join(', ')+'.':' Exam unremarkable.'}\n\nA: ${vp('ch-dx')}.\n\nP:\n${bul(plan)}${immDeclined?'':'\n• Immunizations updated.'}\n• F/u ${vp('ch-fu')}.`;
},

ocp() {
  const contra=picks([['ocp-smoke','smoker \u226535y'],['ocp-aura','migraine with aura'],['ocp-dvt','DVT/PE hx'],['ocp-liver','liver disease'],['ocp-htn','uncontrolled HTN'],['ocp-pregnant','pregnant'],['ocp-bf','breastfeeding'],['ocp-cvd','CVD']]);
  const counsel=picks([['ocp-options','Options discussed'],['ocp-howto','Use and timing explained'],['ocp-missed','Missed pill instructions'],['ocp-se','Side effects reviewed'],['ocp-sti','STI prevention — condoms advised'],['ocp-bp-check','BP monitoring while on OCP'],['ocp-interact','Drug interactions reviewed'],['ocp-fertility','Return to fertility discussed']]);
  const rx=v('ocp-rx');const oVits=vits([[v('ocp-bp'),'BP'],[v('ocp-bmi'),'BMI']]);
  return `S: OCP counselling.${contra.length?' Contraindications: '+contra.join(', ')+'.':''}\n\nO: ${oVits||'Vitals stable'}.\n\nA: ${vp('ocp-suit')}.\n\nP:\n${rx?'• '+rx+'.\n':''}${bul(counsel)}\n• F/u ${vp('ocp-fu')}.`;
},

handpain() {
  const sx=picks([['hp-swelling','swelling'],['hp-stiffness','morning stiffness'],['hp-numbness','numbness/tingling'],['hp-weakness','grip weakness'],['hp-nightsymptoms','night sx'],['hp-locking','locking/triggering']]);
  const hx=picks([['hp-oa','OA'],['hp-ra','RA'],['hp-trauma','trauma'],['hp-repetitive','repetitive use'],['hp-diabetes','DM'],['hp-thyroid','thyroid hx']]);
  const exam=picks([['hp-swelling-exam','Swelling'],['hp-tenderness','Tenderness'],['hp-reduced-rom','Reduced ROM'],['hp-grip-weak','Reduced grip strength'],['hp-deformity','Deformity']]);
  const plan=picks([['hp-reassure','Reassured'],['hp-analgesia','Analgesia PRN'],['hp-splint','Splint'],['hp-physio','Hand physio/OT referral'],['hp-injection','Steroid injection arranged'],['hp-imaging-plan','Imaging ordered'],['hp-rheum','Rheumatology referral'],['hp-ortho','Orthopedic referral'],['hp-nerve','Nerve conduction study ordered']]);
  return `S: ${vp('hp-dominant').replace(' affected','')} — ${vp('hp-char')}, ${vp('hp-duration')}, ${vp('hp-onset').toLowerCase()}. ${vp('hp-loc')}${pain('hp-pain')}.${sx.length?' '+sx.join(', ')+'.':''}${hx.length?' PMHx: '+hx.join(', ')+'.':''}\n\nO:${exam.length?' '+exam.join(', ')+'.':' No significant findings.'}\nTests: ${vp('hp-tests')}.\nImaging: ${vp('hp-xray')}.\n\nA: ${vp('hp-dx')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('hp-fu')}.`;
},

kneepain() {
  const sx=picks([['kp-swelling','effusion'],['kp-stiffness','morning stiffness'],['kp-locking','locking'],['kp-giving-way','giving way'],['kp-crepitus','crepitus'],['kp-night','night pain']]);
  const hx=picks([['kp-oa','OA'],['kp-ra','RA'],['kp-trauma','trauma'],['kp-overweight','obesity'],['kp-prev-injury','prior knee injury/surgery'],['kp-sport','high-impact sport']]);
  const exam=picks([['kp-effusion','Effusion'],['kp-tender','Joint line tenderness'],['kp-reduced-rom','Reduced ROM'],['kp-instability','Ligamentous instability'],['kp-neuro-deficit','Neurovascular deficit']]);
  const plan=picks([['kp-reassure','Reassured'],['kp-analgesia','Analgesia PRN'],['kp-ice','Ice/elevation'],['kp-physio','Physio referral'],['kp-weightloss','Weight loss'],['kp-brace','Brace'],['kp-injection','Steroid / hyaluronic acid injection'],['kp-imaging-plan','Imaging ordered'],['kp-ortho','Orthopedic referral'],['kp-activity-mod','Activity modification']]);
  return `S: ${vp('kp-side')} pain for ${vp('kp-duration')}, ${vp('kp-onset').toLowerCase()}. ${vp('kp-loc')}, ${vp('kp-char')}${pain('kp-pain')}.${sx.length?' '+sx.join(', ')+'.':''}${hx.length?' PMHx: '+hx.join(', ')+'.':''}\n\nO:${exam.length?' '+exam.join(', ')+'.':' No significant findings.'}\nTests: ${vp('kp-tests')}.\nImaging: ${vp('kp-xray')}.\n\nA: ${vp('kp-dx')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('kp-fu')}.`;
},

ihd() {
  const meds=v('ihd-meds');
  const sx=picks([['ihd-angina','angina'],['ihd-sob','exertional SOB'],['ihd-sob-rest','SOB at rest'],['ihd-palpitations','palpitations'],['ihd-syncope','syncope'],['ihd-edema','oedema'],['ihd-fatigue','fatigue'],['ihd-orthopnoea','orthopnoea']]);
  const rf=picks([['ihd-smoking','smoking'],['ihd-dm','DM (suboptimal)'],['ihd-htn-uctrl','HTN (suboptimal)'],['ihd-dyslip','dyslipidaemia'],['ihd-overweight','obesity'],['ihd-inactive','sedentary']]);
  const abnExam=picks([['ihd-acute-distress','Acute distress'],['ihd-murmur','Murmur'],['ihd-lungs-abn','Lungs abnormal'],['ihd-edema-exam','Oedema'],['ihd-raised-jvp','Raised JVP']]);
  const plan=picks([['ihd-contmeds','Continue cardiac meds'],['ihd-aspirin','Antiplatelet continued'],['ihd-statin','Statin continued'],['ihd-bblocker','Beta-blocker reviewed'],['ihd-acei','ACEi/ARB reviewed'],['ihd-lipids','Lipids if due'],['ihd-ecg','ECG reviewed'],['ihd-exercise','Cardiac rehab/exercise'],['ihd-smoking-cessation','Smoking cessation'],['ihd-diet','Heart-healthy diet'],['ihd-cardio-ref','Cardiology referral'],['ihd-stress','Stress test ordered']]);
  const ldl=v('ihd-ldl');const oVits=vits([[v('ihd-bp'),'BP'],[v('ihd-hr'),'HR'],[v('ihd-wt'),'wt']]);
  return `S: F/u IHD.${meds?' Meds: '+meds+'.':''} ${v('ihd-adherence')}${sx.length?' Sx: '+sx.join(', ')+'.':' Asymptomatic.'} GTN: ${vp('ihd-gtn')}.${rf.length?' Risk factors: '+rf.join(', ')+'.':''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':' No acute distress. CV normal. Lungs clear.'} ${ldl?ldl+'.':''} ${v('ihd-invx')}\n\nA: ${vp('ihd-status')}. ${vp('ihd-riskctrl')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('ihd-fu')}.`;
},

hf() {
  const meds=v('hf-meds');
  const sx=picks([['hf-sob-exert','exertional SOB'],['hf-sob-rest','SOB at rest'],['hf-orthopnoea','orthopnoea'],['hf-pnd','PND'],['hf-edema','oedema'],['hf-fatigue','fatigue'],['hf-palpitations','palpitations'],['hf-syncope','syncope']]);
  const abnExam=picks([['hf-acute-distress','Acute distress'],['hf-murmur','Murmur/abnormal rhythm'],['hf-crackles','Crackles'],['hf-edema-exam','Oedema'],['hf-raised-jvp','Raised JVP']]);
  const plan=picks([['hf-contmeds','Continue HF meds'],['hf-diuretic','Diuretic reviewed'],['hf-acei-arb','ACEi/ARB/ARNI reviewed'],['hf-bblocker','Beta-blocker reviewed'],['hf-mra','Mineralocorticoid antagonist reviewed'],['hf-sglt2','SGLT2 inhibitor reviewed'],['hf-electrolytes','Renal/electrolytes monitored'],['hf-bnp','BNP ordered'],['hf-echo','Echo reviewed'],['hf-fluid-ed','Fluid/salt restriction reinforced'],['hf-weight-ed','Daily weights reinforced'],['hf-rehab','Cardiac rehab'],['hf-cardio','Cardiology referral'],['hf-er-warn','ER precautions: acute SOB / weight gain >2 kg (5 lbs) in 3 days']]);
  const ef=v('hf-ef');const oVits=vits([[v('hf-bp'),'BP'],[v('hf-hr'),'HR'],[v('hf-wt'),'wt'],[v('hf-spo2'),'SpO2']]);
  const hfType=v('hf-type').charAt(0).toLowerCase()+v('hf-type').slice(1).replace(/\.$/,'');
  return `S: F/u ${hfType}.${meds?' Meds: '+meds+'.':''} ${v('hf-adherence')}${sx.length?' Sx: '+sx.join(', ')+'.':' Compensated, no decompensation sx.'} ${vp('hf-nyha')}.\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':' Chest clear, no oedema.'}${ef?' '+ef+'.':''}\n\nA: ${vp('hf-status')}. ${vp('hf-volume')}.\n\nP:\n${bul(plan)}\n• F/u ${vp('hf-fu')}.`;
},

labs() {
  const sx=picks([['lab-fatigue','fatigue'],['lab-sob','SOB'],['lab-palpitations','palpitations'],['lab-dizzy','dizziness'],['lab-weightchange','weight change'],['lab-polyuria','polyuria/polydipsia'],['lab-pain','chest/abd pain'],['lab-bleeding','unusual bleeding']]);
  const flags=picks([['lab-flag-high','above normal range'],['lab-flag-low','below normal range'],['lab-flag-critical','critical value'],['lab-flag-trend','worsening trend'],['lab-flag-new','new abnormality'],['lab-flag-stable','stable/unchanged']]);
  const actions=picks([['lab-action-discussed','Results discussed'],['lab-action-nodx','No change — reassuring'],['lab-action-repeat','Repeat labs ordered'],['lab-action-medsadj','Medication adjusted'],['lab-action-newrx','New medication started'],['lab-action-referral','Referral placed'],['lab-action-imaging','Imaging ordered'],['lab-action-diet','Dietary/lifestyle advice'],['lab-action-urgent','Urgent follow-up arranged']]);
  const labPairs=[['Hgb',v('lab-hgb')],['WBC',v('lab-wbc')],['Plt',v('lab-plt')],['Na',v('lab-na')],['K',v('lab-k')],['Cr',v('lab-creat')],['eGFR',v('lab-egfr')],['Gluc',v('lab-gluc')],['A1C',v('lab-a1c')+'%'],['TSH',v('lab-tsh')],['T4',v('lab-t4')],['LDL',v('lab-ldl')],['Chol',v('lab-tchol')],['HDL',v('lab-hdl')],['TG',v('lab-trig')],['ALT',v('lab-alt')],['AST',v('lab-ast')],['ALP',v('lab-alp')],['Bili',v('lab-bili')],['INR',v('lab-inr')],['B12',v('lab-b12')],['Ferritin',v('lab-ferritin')]];
  const labList=labPairs.filter(([,val])=>val&&val!='%').map(([k,val])=>k+' '+val);
  if(v('lab-other'))labList.push(v('lab-other'));
  const labResults=labList.join(', ');
  return `S: ${v('lab-reason')} ${v('lab-aware')}${sx.length?' Sx: '+sx.join(', ')+'.':''}\n\nO: ${labResults||'Results as per chart'}.${flags.length?' Flags: '+flags.join(', ')+'.':''}\n\nA: ${vp('lab-interp')}. ${vp('lab-sig')}.\n\nP:\n${bul(actions)}\n• Next labs: ${vp('lab-nextlabs')}.\n• ${vp('lab-fu')}.`;
},

medrx() {
  const concerns=picks([['mr-adherence-concern','difficulty with medications'],['mr-cost','cost concerns'],['mr-se-concern','side effects'],['mr-effectiveness','effectiveness concerns'],['mr-complexity','complex regimen'],['mr-newmeds','new medication recently started'],['mr-otc','OTC/herbal use'],['mr-stopped','stopped medication without advice']]);
  const findings=picks([['mr-interaction','Drug interaction identified'],['mr-duplication','Therapeutic duplication'],['mr-underdose','Possible underdosing'],['mr-overdose','Possible overdosing/toxicity'],['mr-inappropriate','Potentially inappropriate medication'],['mr-missing','Missing medication for known indication'],['mr-monitoring','Monitoring not up to date'],['mr-deprescribe','Candidate for deprescribing']]);
  const actions=picks([['mr-no-change','No changes — regimen appropriate'],['mr-stopped-med','Medication stopped — details in chart'],['mr-dose-change','Dose adjusted — details in chart'],['mr-new-med','New medication started — details in chart'],['mr-switched','Medication switched — details in chart'],['mr-counselled','Patient counselled on all medications'],['mr-adherence-plan','Adherence strategy discussed'],['mr-pharmacist','Pharmacist referral / MedsCheck'],['mr-labs','Labs ordered for monitoring'],['mr-reconciled','Medication list reconciled and updated']]);
  const oVits=vits([[v('mr-bp'),'BP'],[v('mr-hr'),'HR'],[v('mr-wt'),'wt'],[v('mr-egfr'),'eGFR']]);
  const allergies=v('mr-allergies');
  return `S: ${v('mr-reason')} ${vp('mr-count')} medications. ${v('mr-adherence')}${concerns.length?' Concerns: '+concerns.join(', ')+'.':''}${allergies?' Allergies: '+allergies+'.':''}\n\nO: ${oVits||'Vitals as per chart'}.${findings.length?'\nFindings: '+findings.join(', ')+'.':''}\n\nA: ${vp('mr-safety')}.\n\nP:\n${bul(actions)}\n• F/u: ${vp('mr-fu')}.`;
}

}; // end C

// ── GENERATE (with error handling) ───────────────────────────
// tidy(): final-output safety net — collapses accidental double periods,
// double spaces, and space-before-period artifacts no matter which
// field or dropdown value caused them.
function tidy(t) {
  return t
    .replace(/[ \t]+\./g, '.')
    .replace(/\.{2,}/g, '.')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n');
}

/* ══════════════════════════════════════════════════════════════════════
   VISIT ENGINE
   A visit can have any number of reasons. Each reason still owns its own
   form and its own generator (untouched below) — this layer runs each one,
   splits the result into S / O / A / P, and writes them up as ONE note.
   With a single reason ticked the output is byte-identical to before.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Short problem labels, used to head each block of the Plan ── */
const TYPE_LABEL = {
  'dep-initial':'Depression', 'depression':'Depression',
  'anx-initial':'Anxiety',    'anxiety':'Anxiety',
  'refill':'Medication refill',
  't2dm':'T2DM', 'htn':'Hypertension', 'thyroid':'Hypothyroidism', 'gerd':'GERD',
  'ihd':'Ischemic heart disease', 'hf':'Heart failure', 'inr':'INR / warfarin',
  'backpain':'Low back pain', 'kneepain':'Knee pain', 'handpain':'Hand pain',
  'headache':'Headache', 'chestpain':'Chest pain', 'cold':'Common cold / URI', 'uti':'UTI',
  'child':'Well-child visit', 'ocp':'Contraception',
  'labs':'Lab results', 'medrx':'Medication review'
};

/* Extra words that should match in the sidebar search box */
const SEARCH_ALIASES = {
  'refill':'medication prescription renew rx repeat script general any',
  't2dm':'diabetes diabetic sugar metformin a1c insulin',
  'htn':'blood pressure hypertension bp amlodipine ramipril',
  'thyroid':'hypothyroid levothyroxine synthroid tsh',
  'gerd':'reflux heartburn acid ppi pantoprazole omeprazole',
  'ihd':'angina coronary cad heart ischemic',
  'hf':'chf congestive heart failure',
  'inr':'warfarin coumadin anticoagulation blood thinner',
  'dep-initial':'mood sad low phq9 mental',
  'depression':'mood sad low phq9 mental',
  'anx-initial':'worry panic gad7 mental',
  'anxiety':'worry panic gad7 mental',
  'backpain':'lumbar spine sciatica back',
  'kneepain':'joint knee leg',
  'handpain':'wrist carpal finger hand',
  'headache':'migraine head',
  'chestpain':'angina chest',
  'cold':'uri cough flu sore throat virus congestion',
  'uti':'urine urinary bladder dysuria infection',
  'child':'well baby paediatric pediatric immunisation immunization growth',
  'ocp':'birth control contraception pill oral',
  'labs':'bloodwork blood work results review',
  'medrx':'medication review polypharmacy reconciliation'
};

function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function ensureDot(s){ return /[.!?:]$/.test(s.trim()) ? s.trim() : s.trim() + '.'; }

/* Builds "drug A 10 mg daily, drug B 5 mg BID and drug C" from paired fields */
function medList(prefix){
  const out = [];
  for (let i = 1; i <= 3; i++){
    const drug = v(prefix + '-drug' + i);
    if (!drug) continue;
    const dose = v(prefix + '-dose' + i);
    out.push(dose ? drug + ' ' + dose : drug);
  }
  if (out.length <= 1) return out[0] || '';
  return out.slice(0, -1).join(', ') + ' and ' + out[out.length - 1];
}

function typeLabel(type){
  if (type === 'refill'){
    const cond = v('rx-condition');
    return cond ? cap(cond) : 'Medication refill';
  }
  return TYPE_LABEL[type] || type;
}
function sidebarLabel(type){
  const btn = document.querySelector('.soap-btn[data-type="' + type + '"]');
  return btn ? btn.textContent.trim() : typeLabel(type);
}

/* ── Splitting a finished note back into its four sections ───────────── */
function splitNote(text){
  const keys = ['S','O','A','P'];
  const found = [];
  let from = 0;
  for (const k of keys){
    const re = new RegExp('(?:^|\\n)' + k + ':[ \\t]*\\n?', 'g');
    re.lastIndex = from;
    const m = re.exec(text);
    if (!m) return null;
    found.push({ k: k, head: m.index, body: m.index + m[0].length });
    from = m.index + m[0].length;
  }
  const out = {};
  found.forEach((f, i) => {
    const end = (i + 1 < found.length) ? found[i + 1].head : text.length;
    out[f.k] = text.slice(f.body, end).trim();
  });
  return out;
}

/* Turn a section body into a list of items, bulleted or not */
function toItems(section){
  if (!section) return [];
  const out = [];
  section.split('\n').forEach(line => {
    const t = line.trim();
    if (!t) return;
    out.push(t.replace(/^•\s*/, '').trim());
  });
  return out;
}

/* Drop sentences that are word-for-word repeats of one already written.
   Only exact duplicates go — no clinical content can be lost this way. */
function dedupeSentences(text){
  const seen = new Set();
  return text.split('\n').map(line => {
    const parts = line.replace(/([.!?])\s+/g, '$1\u0001').split('\u0001');
    const keep = parts.filter(p => {
      const key = p.trim().toLowerCase();
      if (!key) return false;
      if (key.length < 5) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return keep.join(' ');
  }).filter(l => l.trim()).join('\n');
}

/* One set of vitals per visit, however many forms recorded them */
const VITAL_RE = /\b(BP|HR|Weight|Wt|Temp|RR|SpO2|O2 sat)\s*:\s*[^,.;\n]+/gi;
function dedupeVitals(text){
  const seen = new Set();
  let out = text.replace(VITAL_RE, m => {
    const key = m.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) return '\u0000';
    seen.add(key);
    return m;
  });
  return out
    .replace(/\s*,\s*\u0000/g, '')
    .replace(/\u0000\s*,\s*/g, '')
    .replace(/\u0000/g, '');
}

/* Second and later reasons read as part of the same visit, not a new note */
function linkOpener(s){
  return s
    .replace(/^Patient presents for follow-up of /i, 'Also seen for follow-up of ')
    .replace(/^Patient presents for /i,              'Also presents for ')
    .replace(/^Patient presents with /i,             'Also reports ')
    .replace(/^Patient presents requesting /i,       'Also requesting ')
    .replace(/^Patient presents /i,                  'Also presents ')
    .replace(/^Seen today for /i,                    'Also seen today for ')
    .replace(/^Attends for /i,                       'Also attends for ')
    .replace(/^Patient reports /i,                   'Also reports ')
    .replace(/^Patient is here for /i,               'Also here for ');
}

/* ── The merge itself ────────────────────────────────────────────────── */
function mergeNotes(items){
  const parts = [];
  for (const it of items){
    const p = splitNote(it.note);
    if (!p) return null;                  // unexpected shape — caller falls back
    parts.push({ type: it.type, p: p });
  }

  /* Subjective — one running account of the visit */
  let S = compactMode
    ? parts.map(x => x.p.S.trim()).filter(Boolean).join(' ')
    : parts.map((x, i) => i === 0 ? x.p.S.trim() : linkOpener(x.p.S.trim()))
           .filter(Boolean).join('\n');
  S = dedupeSentences(S);

  /* Objective — one set of findings, vitals recorded once */
  let O = parts.map(x => x.p.O.trim()).filter(Boolean).join(compactMode ? ' ' : '\n');
  O = dedupeVitals(dedupeSentences(O));

  /* Assessment — a single problem list */
  const aItems = [];
  parts.forEach(x => toItems(x.p.A).forEach(s => {
    if (!aItems.some(e => e.toLowerCase() === s.toLowerCase())) aItems.push(s);
  }));
  const A = aItems.map(s => '• ' + ensureDot(s)).join('\n');

  /* Plan — grouped under each problem, with follow-up stated once at the end */
  const groups = [];
  const followUps = [];
  parts.forEach(x => {
    const items = [];
    toItems(x.p.P).forEach(s => {
      if (/^(follow[-\s]?up|f\/u)\b/i.test(s)){
        followUps.push({ label: typeLabel(x.type), text: ensureDot(s) });
      } else if (!items.some(e => e.toLowerCase() === s.toLowerCase())){
        items.push(s);
      }
    });
    if (items.length) groups.push({ label: typeLabel(x.type), items: items });
  });

  let P;
  if (groups.length <= 1){
    P = (groups[0] ? groups[0].items : []).map(s => '• ' + ensureDot(s)).join('\n');
  } else {
    P = groups.map(g => g.label + ':\n' + g.items.map(s => '• ' + ensureDot(s)).join('\n'))
              .join('\n\n');
  }
  const fuLines = consolidateFollowUps(followUps);
  if (fuLines.length) P += (P ? '\n\n' : '') + fuLines.join('\n');

  return compactMode
    ? 'S: ' + S + '\n\nO: ' + O + '\n\nA:\n' + A + '\n\nP:\n' + P
    : 'S:\n' + S + '\n\nO:\n' + O + '\n\nA:\n' + A + '\n\nP:\n' + P;
}

/* One follow-up line for the visit. Reasons that share an interval are said
   once; genuinely different intervals are kept and labelled, because "come
   back in two weeks for the back" and "three months for the diabetes" are
   different instructions and neither can be dropped. */
function consolidateFollowUps(list){
  if (!list.length) return [];
  const groups = [];
  list.forEach(f => {
    const m = f.text.match(/^(?:follow[-\s]?up|f\/u)\b\s*(?::|in\b)?\s*(.*)$/i);
    let rest = ((m ? m[1] : f.text) || '').trim().replace(/\.$/, '');
    if (!rest) rest = f.text.replace(/\.$/, '');
    const dur = rest.match(/^(\d+(?:\s*[–—-]\s*\d+)?\s*(?:day|week|month|year)s?)/i);
    const key = (dur ? dur[1] : rest).toLowerCase().replace(/\s+/g, ' ');
    let g = groups.find(x => x.key === key);
    if (!g){ groups.push({ key: key, display: rest, labels: [f.label] }); return; }
    if (rest.length > g.display.length) g.display = rest;
    if (g.labels.indexOf(f.label) === -1) g.labels.push(f.label);
  });
  const verb = compactMode ? 'F/u' : 'Follow up';
  if (groups.length === 1){
    const d = groups[0].display;
    return ['• ' + verb + (/^\d/.test(d) ? ' in ' : ': ') + ensureDot(d)];
  }
  return ['• ' + verb + ': ' +
    groups.map(g => g.display + ' (' + g.labels.join(', ') + ')').join('; ') + '.'];
}

/* ── Selection state ─────────────────────────────────────────────────── */
let selected = [];

function toggleType(type){
  const i = selected.indexOf(type);
  if (i > -1) selected.splice(i, 1); else selected.push(type);
  syncVisit();
  saveState();
  if (i === -1){
    const panel = document.getElementById('panel-' + type);
    if (panel) setTimeout(() => scrollMainTo(panel), 40);
  }
}

function removeType(type){
  const i = selected.indexOf(type);
  if (i === -1) return;
  selected.splice(i, 1);
  syncVisit();
  saveState();
}

function syncVisit(){
  const bar = document.getElementById('visit-bar');
  document.querySelectorAll('.soap-btn').forEach(b => {
    const on = selected.indexOf(b.dataset.type) > -1;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.querySelectorAll('.form-panel').forEach(p => {
    p.classList.toggle('active', selected.indexOf(p.id.replace('panel-', '')) > -1);
  });
  /* show the forms in the order they were ticked */
  selected.forEach(t => {
    const panel = document.getElementById('panel-' + t);
    if (panel && bar) bar.parentNode.insertBefore(panel, bar);
  });

  const any = selected.length > 0;
  document.getElementById('empty-state').style.display = any ? 'none' : 'flex';
  document.getElementById('visit-head').style.display  = any ? 'flex' : 'none';
  bar.style.display = any ? 'flex' : 'none';
  const gen = document.getElementById('visit-generate');
  gen.textContent = selected.length > 1
    ? 'Generate Note (' + selected.length + ' reasons)'
    : 'Generate Note';
  renderChips();
  syncVitals();
  if (!any) hideVisitOut();
}

function renderChips(){
  const wrap = document.getElementById('visit-chips');
  wrap.textContent = '';
  selected.forEach(t => {
    const label = sidebarLabel(t);
    const chip = document.createElement('span');
    chip.className = 'chip';
    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'chip-go';
    go.textContent = label;
    go.title = 'Jump to this form';
    go.onclick = () => { const p = document.getElementById('panel-' + t); if (p) scrollMainTo(p); };
    chip.appendChild(go);
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'chip-x';
    x.setAttribute('aria-label', 'Remove ' + label + ' from this visit');
    x.textContent = '✕';
    x.onclick = () => removeType(t);
    chip.appendChild(x);
    wrap.appendChild(chip);
  });
}

/* ── Vitals typed once, shared across every form in the visit ─────────── */
const VITAL_KEYS = ['bp','hr','wt','temp'];
function vitalKey(id){
  const k = id.split('-').pop();
  return VITAL_KEYS.indexOf(k) > -1 ? k : null;
}
function vitalFields(key){
  return [...document.querySelectorAll('.form-panel input[type="text"]')]
    .filter(el => vitalKey(el.id) === key);
}
function syncVitals(){
  VITAL_KEYS.forEach(key => {
    const active = vitalFields(key).filter(el => {
      const panel = el.closest('.form-panel');
      return panel && panel.classList.contains('active');
    });
    const typed = active
      .filter(el => el.dataset.manual === '1' && el.value.trim())
      .sort((a, b) => (+b.dataset.vitalTs || 0) - (+a.dataset.vitalTs || 0));
    const source = typed[0] || active.find(el => el.value.trim());
    if (!source) return;
    active.forEach(el => {
      if (el === source || el.dataset.manual === '1') return;
      el.value = source.value;
    });
  });
}

/* ── Generate, copy, clear ───────────────────────────────────────────── */
function generateVisit(){
  if (!selected.length) return;
  syncVitals();
  const set = compactMode ? C : G;
  const items = [], failed = [];
  selected.forEach(t => {
    const gen = set[t];
    if (typeof gen !== 'function'){ failed.push(sidebarLabel(t) + ' — not available in ' + (compactMode ? 'compact' : 'full') + ' mode'); return; }
    try { items.push({ type: t, note: gen() }); }
    catch (err){ console.error('Note generation failed for ' + t, err); failed.push(sidebarLabel(t) + ' — ' + err.message); }
  });
  if (!items.length){
    alert('Sorry — this note could not be generated.\n\n' + failed.join('\n'));
    return;
  }
  let text;
  if (items.length === 1){
    text = tidy(items[0].note);
  } else {
    const merged = mergeNotes(items);
    text = tidy(merged !== null ? merged : items.map(i => i.note).join('\n\n──────────\n\n'));
  }
  showVisit(text);
  if (failed.length) alert('Everything else was included, but these could not be:\n\n• ' + failed.join('\n• '));
}

function showVisit(text){
  document.getElementById('visit-text').textContent = text;
  const out = document.getElementById('visit-out');
  out.style.display = 'block';
  setTimeout(() => scrollMainTo(out), 50);
}
/* Scroll so the target sits just below the pinned "This visit" bar,
   rather than underneath it. */
function scrollMainTo(el){
  const main = document.getElementById('main-area');
  const head = document.getElementById('visit-head');
  const offset = (head && head.offsetParent !== null ? head.offsetHeight : 0) + 16;
  const top = main.scrollTop + el.getBoundingClientRect().top - main.getBoundingClientRect().top - offset;
  main.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function hideVisitOut(){ document.getElementById('visit-out').style.display = 'none'; }

function copyVisit(btn){
  const text = document.getElementById('visit-text').textContent;
  const done = () => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 3000);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(() => copyFallback(text, done));
  else copyFallback(text, done);
}
function copyFallback(text, done){
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  done();
}

function clearVisit(){
  if (!confirm('Start a new patient?\n\nEverything ticked and everything typed in will be cleared.')) return;
  document.querySelectorAll('.form-panel').forEach(p => {
    p.querySelectorAll('input[type="text"],input[type="number"],textarea').forEach(el => { el.value = ''; delete el.dataset.manual; delete el.dataset.vitalTs; });
    p.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    p.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = el.defaultChecked);
  });
  selected = [];
  hideVisitOut();
  syncVisit();
  const search = document.getElementById('type-search');
  search.value = '';
  filterTypes('');
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  document.getElementById('main-area').scrollTop = 0;
}

/* ── Sidebar search ──────────────────────────────────────────────────── */
function filterTypes(query){
  const q = query.trim().toLowerCase();
  let hits = 0;
  document.querySelectorAll('.soap-btn').forEach(b => {
    const hay = b.textContent.toLowerCase() + ' ' + (SEARCH_ALIASES[b.dataset.type] || '');
    const on = !q || hay.indexOf(q) > -1;
    b.style.display = on ? '' : 'none';
    if (on) hits++;
  });
  document.querySelectorAll('.sidebar-section').forEach(sec => {
    const visible = [...sec.querySelectorAll('.soap-btn')].some(b => b.style.display !== 'none');
    sec.style.display = visible ? '' : 'none';
  });
  document.querySelectorAll('.sidebar-divider').forEach(d => { d.style.display = q ? 'none' : ''; });
  document.getElementById('no-results').style.display = hits ? 'none' : 'block';
}

/* ── Autosave, so a closed tab never costs a half-finished note ───────── */
const SAVE_KEY = 'soap-visit-v2';
let saveTimer = null;
function saveState(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const fields = {};
      document.querySelectorAll('.form-panel input, .form-panel select, .form-panel textarea').forEach(el => {
        if (!el.id) return;
        if (el.type === 'checkbox'){ if (el.checked !== el.defaultChecked) fields[el.id] = el.checked ? 1 : 0; }
        else if (el.tagName === 'SELECT'){ if (el.selectedIndex !== 0) fields[el.id] = el.value; }
        else if (el.value !== ''){ fields[el.id] = el.value; }
      });
      localStorage.setItem(SAVE_KEY, JSON.stringify({ selected: selected, compact: compactMode, fields: fields }));
    } catch(e){}
  }, 400);
}
function restoreState(){
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch(e){}
  if (!saved) return;
  Object.keys(saved.fields || {}).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!saved.fields[id];
    else el.value = saved.fields[id];
  });
  if (saved.compact && !compactMode) toggleMode();
  selected = (saved.selected || []).filter(t => document.getElementById('panel-' + t));
}

/* ── Install as a desktop app ────────────────────────────────────────── */
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvent = e;
  const btn = document.getElementById('install-btn');
  if (btn) btn.style.display = 'block';
});
function installApp(){
  if (!installEvent) return;
  installEvent.prompt();
  installEvent.userChoice.finally(() => {
    installEvent = null;
    const btn = document.getElementById('install-btn');
    if (btn) btn.style.display = 'none';
  });
}
function markInstalled(){
  ['install-btn','install-manual'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const done = document.getElementById('install-done');
  if (done) done.style.display = 'block';
}
window.addEventListener('appinstalled', markInstalled);

/* ── Boot ────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  /* every form gets a "Remove" control in its heading */
  document.querySelectorAll('.form-panel').forEach(p => {
    const type = p.id.replace('panel-', '');
    const title = p.querySelector('.note-title');
    if (!title) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-remove';
    btn.textContent = 'Remove';
    btn.setAttribute('aria-label', 'Remove this reason from the visit');
    btn.onclick = () => removeType(type);
    title.appendChild(btn);
  });

  restoreState();
  syncVisit();

  /* typing anywhere: share the vitals, and save */
  document.addEventListener('input', e => {
    const el = e.target;
    if (el && el.id && el.closest && el.closest('.form-panel')){
      const key = vitalKey(el.id);
      if (key && el.type === 'text'){
        el.dataset.manual = '1';
        el.dataset.vitalTs = String(Date.now());
        vitalFields(key).forEach(other => {
          if (other === el || other.dataset.manual === '1') return;
          const panel = other.closest('.form-panel');
          if (panel && panel.classList.contains('active')) other.value = el.value;
        });
      }
    }
    saveState();
  });
  document.addEventListener('change', saveState);

  /* Ctrl/Cmd + Enter writes the note from anywhere on the page */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && selected.length){
      e.preventDefault();
      generateVisit();
    }
  });

  /* Enter in the search box ticks the top match and clears the search */
  document.getElementById('type-search').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const first = [...document.querySelectorAll('.soap-btn')].find(b => b.style.display !== 'none');
    if (!first) return;
    if (selected.indexOf(first.dataset.type) === -1) toggleType(first.dataset.type);
    e.target.value = '';
    filterTypes('');
  });

  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) markInstalled();

  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

// build-marker: multi-reason visits + general refill v2 (2026-08-20)
