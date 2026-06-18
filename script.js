document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-CA',{weekday:'short',year:'numeric',month:'short',day:'numeric'});

// ── HELP PANEL ───────────────────────────────────────────────
function toggleHelp(){
  document.getElementById('help-panel').classList.toggle('open');
  document.getElementById('help-overlay').classList.toggle('open');
}

// ── NOTE PANEL SWITCHING ─────────────────────────────────────
function show(type, btn) {
  document.querySelectorAll('.form-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.soap-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('empty-state').style.display='none';
  document.getElementById('panel-'+type).classList.add('active');
  btn.classList.add('active');
  document.getElementById('main-area').scrollTop=0;
  // Remember last used note type
  try{localStorage.setItem('soap-last-type', type);}catch(e){}
}

// Restore last used note on load
window.addEventListener('DOMContentLoaded', ()=>{
  try{
    const last = localStorage.getItem('soap-last-type');
    if(last){
      const btn = document.querySelector(`.soap-btn[onclick="show('${last}',this)"]`);
      const panel = document.getElementById('panel-'+last);
      if(btn && panel){
        document.getElementById('empty-state').style.display='none';
        panel.classList.add('active');
        btn.classList.add('active');
      }
    }
  }catch(e){}
});

function v(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function chk(id){const el=document.getElementById(id);return el?el.checked:false;}
function picks(pairs){return pairs.filter(([id])=>chk(id)).map(([,lbl])=>lbl);}
function bul(arr){return arr.map(s=>'• '+s+(s.endsWith('.')?'':'.')).join('\n');}

function clearForm(type){
  const p=document.getElementById('panel-'+type);
  p.querySelectorAll('input[type="text"],input[type="number"]').forEach(el=>el.value='');
  p.querySelectorAll('select').forEach(el=>el.selectedIndex=0);
  p.querySelectorAll('input[type="checkbox"]').forEach(el=>el.checked=el.defaultChecked);
  document.getElementById('out-'+type).style.display='none';
}

function copyNote(type,btn){
  const text=document.getElementById('text-'+type).textContent;
  const done=()=>{btn.textContent='Copied!';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},3000);};
  if(navigator.clipboard){navigator.clipboard.writeText(text).then(done).catch(()=>fallback(text,done));}
  else{fallback(text,done);}
}
function fallback(text,done){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);done();}

function showOut(type,text){
  document.getElementById('text-'+type).textContent=text;
  const out=document.getElementById('out-'+type);
  out.style.display='block';
  setTimeout(()=>out.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
}

const G={

depression(){
  const drug=v('dep-drug')||'current antidepressant';
  const med=v('dep-dose')?drug+' '+v('dep-dose'):drug;
  const sx=picks([['dep-fatigue','fatigue'],['dep-motivation','low motivation'],['dep-anhedonia','anhedonia'],['dep-concentration','poor concentration']]);
  const abnAppear=picks([['dep-agitated','Agitated / psychomotor agitation'],['dep-dishevelled','Dishevelled / poor self-care'],['dep-uncooperative','Uncooperative'],['dep-abnormal-speech','Abnormal rate or tone of speech'],['dep-disorganised','Disorganised / illogical thought']]);
  const plan=picks([['dep-monitor','Monitor for side effects and mood changes'],['dep-sleep-hyg','Encourage sleep hygiene and routine'],['dep-activity','Physical activity encouraged'],['dep-crisis','Crisis contact information provided'],['dep-referral','Referral to mental health / counselling placed'],['dep-therapy','CBT / therapy discussed']]);
  return `S:\nPatient presents for follow-up of depression. Mood reported as ${v('dep-mood')} since initiating ${med}. ${v('dep-si')} ${sx.length?'Ongoing symptoms include: '+sx.join(', ')+'. ':'No significant ongoing symptoms reported. '}Sleep is ${v('dep-sleep')}. Appetite is ${v('dep-appetite')}. ${v('dep-se')}\n\nO:\nMood: ${v('dep-omood')}. Affect: ${v('dep-affect')}.${abnAppear.length?' Abnormal behaviour / appearance: '+abnAppear.join(', ')+'.':' Cooperative, appropriate appearance, normal speech, logical thought process.'} ${v('dep-psych')}\n\nA:\n• Major Depressive Disorder — ${v('dep-status')}.\n• Safety: ${v('dep-safety')}\n\nP:\n• ${v('dep-rx')} (${med}).\n${bul(plan)}\n• Follow up in ${v('dep-fu')}.`;
},

t2dm(){
  const drug=v('dm-drug')||'current diabetes medication';
  const med=v('dm-dose')?drug+' '+v('dm-dose'):drug;
  const sx=picks([['dm-hypo','hypoglycemia'],['dm-hyper','hyperglycemia'],['dm-polyuria','polyuria'],['dm-polydipsia','polydipsia'],['dm-fatigue','fatigue'],['dm-se','medication side effects']]);
  const plan=picks([['dm-refill','Refill '+med],['dm-continue','Continue current diabetes management'],['dm-diet','Encourage diet/exercise adherence'],['dm-labs','Plan A1C and labs if due'],['dm-footcheck','Foot exam completed / referred'],['dm-bp-plan','BP management reviewed']]);
  const a1c=v('dm-a1c');const a1cd=v('dm-a1cdate');
  const vits=[v('dm-bp')?'BP: '+v('dm-bp'):'',v('dm-hr')?'HR: '+v('dm-hr')+' bpm':'',v('dm-wt')?'Weight: '+v('dm-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\nPatient presents for Type 2 Diabetes Mellitus (T2DM) medication refill. Reports ${v('dm-adherence')} with ${med}. ${sx.length?'Symptoms reported: '+sx.join(', ')+'. ':'No recent episodes of hypoglycemia or hyperglycemia. Denies polyuria, polydipsia, or fatigue. No medication side effects. '}\n\nO:\nLast A1C: ${a1c?a1c+'%':'[pending]'}${a1cd?' ('+a1cd+')':''}. ${vits?vits+'.':''} ${v('dm-exam')}\n\nA:\n• T2DM — ${v('dm-status')}. ${v('dm-hypoglycemia')} ${v('dm-tol')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('dm-fu')}.`;
},

htn(){
  const med1=v('htn-med1');const med2=v('htn-med2');
  const meds=[med1,med2].filter(Boolean).join(' and ')||'current antihypertensive medications';
  const sx=picks([['htn-cp','chest pain'],['htn-sob','shortness of breath'],['htn-ha','headache'],['htn-dizzy','dizziness'],['htn-se','medication side effects'],['htn-er','recent ER/urgent care visit']]);
  const abnExam=picks([['htn-acute-distress','Acute distress'],['htn-murmur','Murmur heard'],['htn-lungs-abn','Lungs abnormal'],['htn-edema','Edema present']]);
  const plan=picks([['htn-refill','Refill '+meds],['htn-lifestyle','Continue lifestyle modifications'],['htn-homebp-plan','Recommend home BP monitoring'],['htn-cmp','CMP if not done within last year'],['htn-echo','Echo / cardiology referral placed'],['htn-sodium','Low-sodium diet counselled']]);
  const homebp=v('htn-homebp');
  const bp=v('htn-bp');const hr=v('htn-hr');
  const oVits=[bp?'BP: '+bp:'',hr?'HR: '+hr+' bpm':''].filter(Boolean).join(', ');
  return `S:\nPatient presents for routine hypertension medication refill. Denies ${sx.length?sx.join(', '):'chest pain, shortness of breath, headache, dizziness, or side effects'}. Reports ${v('htn-adherence')}.${homebp?' Home BP average ~'+homebp+'.':''} No recent ER or urgent care visits.\n\nO:\n${oVits?oVits+'. ':'Vitals stable. '}${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'Gen: NAD. CV: regular rate and rhythm, no murmur. Lungs: clear. No edema.'}\n\nA:\nHypertension \u2014 ${v('htn-control')}. ${v('htn-concerns')}\n\nP:\n${bul(plan)}\n\u2022 Follow up in ${v('htn-fu')}.`;
},

inr(){
  const flags=picks([['inr-bleeding','unusual bleeding or bruising'],['inr-hematuria','hematuria'],['inr-stools','black or tarry stools'],['inr-missed','missed warfarin doses'],['inr-extra','extra/double doses taken'],['inr-newmeds','new medications started'],['inr-diet','significant dietary changes'],['inr-newsymptoms','new symptoms']]);
  const abnSigns=picks([['inr-bruising','Bruising or petechiae noted'],['inr-bleeding-signs','Signs of active bleeding'],['inr-edema','Edema']]);
  const edu=picks([['inr-edu-diet','Reinforced consistent diet and medication adherence'],['inr-edu-bleed','Educated on signs of bleeding and when to seek medical attention'],['inr-edu-adhere','Medication adherence reinforced'],['inr-edu-interact','Drug interaction counselling provided']]);
  const nd=v('inr-newdose');const dn=v('inr-diet-notes');const mc=v('inr-med-changes');
  const inrStatus=v('inr-status');
  const inrStable=inrStatus==='within target range';
  const inrVal=v('inr-value');const inrDose=v('inr-dose');const inrTarget=v('inr-target');const inrBP=v('inr-bp');
  return `S:\nPatient presents for routine INR monitoring. ${flags.length?'Reports: '+flags.join(', ')+'. ':'No bleeding, bruising, hematuria, or black stools reported. No missed or extra warfarin doses. '}${dn?'Dietary notes: '+dn+'. ':'No recent dietary changes. '}${mc?'Recent medication changes: '+mc+'.':'No recent medication changes.'}\n\nO:\nVitals stable.${abnSigns.length?' '+abnSigns.join('. ')+'.':''}\n${inrVal?'INR today: '+inrVal+'. ':''}${inrTarget?'Target range: '+inrTarget+'. ':''}${inrDose?'Current warfarin dose: '+inrDose+'.':''}${inrBP?' BP: '+inrBP+'.':''}\n\nA:\n\u2022 ${inrStable?'Stable anticoagulation management on warfarin.':'Anticoagulation on warfarin \u2014 requires dose adjustment.'}\n\u2022 INR ${inrStatus}.\n\nP:\n\u2022 ${v('inr-action')}${nd?': '+nd:''}.\n\u2022 Recheck INR in ${v('inr-recheck')}.\n${bul(edu)}`;
},

backpain(){
  const rf=picks([['bp-radiation','radiation to lower limb(s)'],['bp-numbness','numbness/tingling'],['bp-weakness','limb weakness'],['bp-bowel','bowel/bladder changes'],['bp-fever','fever or unexplained weight loss']]);
  const posExam=picks([['bp-stable','Vitals stable'],['bp-tender','Lumbar paraspinal tenderness'],['bp-limited-flex','Limited flexion due to pain']]);
  const abnExam=picks([['bp-midline-tender','Midline tenderness'],['bp-neuro-deficit','Neurological deficit in lower limbs'],['bp-slr-pos','Positive straight leg raise']]);
  const onset=v('bp-onset');
  const onsetStr=onset.startsWith('gradual')?'Gradual onset, no clear trigger.':'Onset '+onset+'.';
  const plan=picks([['bp-reassure','Reassure and educate'],['bp-activity','Continue gentle activity; avoid prolonged rest'],['bp-ibu','Ibuprofen 400 mg PO q6\u20138h PRN with food'],['bp-heat','Apply heat to affected area'],['bp-stretch','Stretching exercises recommended'],['bp-physio','Physiotherapy referral placed'],['bp-imaging','Imaging ordered (X-ray / MRI)'],['bp-neuro-warn','Advised to return immediately if new neurological symptoms develop']]);
  const examOut=[...posExam,...(abnExam.length?['Abnormal: '+abnExam.join(', ')]:['Normal strength, sensation, and reflexes in lower limbs','Negative straight leg raise'])];
  return `S:\nLow back pain for ${v('bp-duration')}. ${onsetStr} ${v('bp-char')}, ${v('bp-pain-rest')||'?'}/10 at rest, ${v('bp-pain-move')||'?'}/10 with movement. ${rf.length?'Red flag symptoms present: '+rf.join(', ')+' \u2014 further evaluation warranted.':'No radiation, numbness, weakness, or bowel/bladder changes.'} Worse with movement, improved with ${v('bp-relief')}. ${v('bp-hx')}\n\nO:\n${examOut.join('. ')}.\n\nA:\nDiagnosis: ${v('bp-dx')}\nDDx: disc herniation, spinal stenosis, vertebral fracture (less likely).\n\nP:\n${bul(plan)}\n\u2022 Follow up in ${v('bp-fu')}.`;
},

headache(){
  const assoc=picks([['ha-nausea','nausea'],['ha-vomit','vomiting'],['ha-visual','visual changes'],['ha-photo','photophobia'],['ha-phono','phonophobia'],['ha-weakness','weakness/neurological changes']]);
  const abnExam=picks([['ha-neuro-deficit','Focal neurological deficit'],['ha-cn-deficit','Cranial nerve deficit'],['ha-papilloedema','Papilloedema on fundoscopy'],['ha-neck-stiff','Neck stiffness / meningismus'],['ha-sinus-tender','Sinus / temporal artery tenderness'],['ha-disoriented','Disoriented / altered consciousness']]);
  const plan=picks([['ha-reassure','Reassure patient; discuss stress management and adequate sleep'],['ha-sleep','Adequate sleep advised'],['ha-apap','Acetaminophen 500 mg PO q6h PRN'],['ha-ibu','Ibuprofen 400 mg PO q6\u20138h PRN'],['ha-hydration','Encourage hydration and regular meals'],['ha-caffeine','Avoid excessive caffeine and screen time'],['ha-triptan','Triptan prescribed'],['ha-neuro','Neurology referral placed']]);
  return `S:\nHeadache for ${v('ha-dur')} with ${v('ha-onset')}. Located ${v('ha-loc')}, ${v('ha-char')}, ${v('ha-pain')||'?'}/10 in intensity. ${assoc.length?'Associated symptoms: '+assoc.join(', ')+'. ':'No nausea, vomiting, visual changes, weakness, photophobia, or phonophobia. '}Worsened by ${v('ha-aggr')}; relieved by ${v('ha-relief')}. ${v('ha-hx')}\n\nO:\nAlert and oriented. Vitals stable.${abnExam.length?' Abnormal findings: '+abnExam.join(', ')+'.':' No focal neurological deficits. Cranial nerves intact. Neck supple.'}\n\nA:\nDiagnosis: ${v('ha-dx')}\nDDx: migraine, sinus headache, secondary causes (e.g. hypertension, infection \u2014 less likely).\n\nP:\n${bul(plan)}\n\u2022 Follow up ${v('ha-fu')}.`;
},

chestpain(){
  const assoc=picks([['cp-radiation','radiation to arm or jaw'],['cp-sob','shortness of breath'],['cp-nausea','nausea'],['cp-diaphoresis','diaphoresis'],['cp-palp','palpitations'],['cp-syncope','syncope/pre-syncope']]);
  const hx=picks([['cp-htn','hypertension'],['cp-cardiac','known cardiac history'],['cp-smoker','smoker'],['cp-dm','diabetes'],['cp-trauma','recent trauma or cough']]);
  const abnExam=picks([['cp-acute-distress','Acute distress'],['cp-murmur','Cardiac murmur'],['cp-lungs-abn','Respiratory abnormality (wheeze / crackles)'],['cp-abd-tender','Abdominal tenderness'],['cp-cw-tender','Chest wall tenderness']]);
  const plan=picks([['cp-ecg-ord','Order ECG and troponin to rule out cardiac etiology'],['cp-troponin','Troponin ordered'],['cp-reassure','Reassure and observe; advise to avoid exertion until ruled out'],['cp-no-exert','Avoid exertion until cardiac cause excluded'],['cp-nsaid','If cardiac cause excluded: NSAID for pain, rest, and stress reduction'],['cp-er-warn','Educate on warning signs: worsening pain, radiation, diaphoresis, or syncope \u2192 go to ER'],['cp-cardio','Cardiology referral placed'],['cp-stress','Stress test ordered']]);
  const vits=[v('cp-bp')?'BP: '+v('cp-bp'):'',v('cp-hr')?'HR: '+v('cp-hr')+' bpm':'',v('cp-rr')?'RR: '+v('cp-rr'):'',v('cp-temp')?'Temp: '+v('cp-temp')+'\u00b0C':'',v('cp-spo2')?'SpO\u2082: '+v('cp-spo2'):''].filter(Boolean).join(', ');
  return `S:\n${v('cp-loc')}, ${v('cp-pain')||'?'}/10 intensity, for ${v('cp-dur')}, ${v('cp-onset').toLowerCase()} ${assoc.length?'Associated symptoms: '+assoc.join(', ')+'. ':'No radiation to arm or jaw, shortness of breath, nausea, diaphoresis, palpitations, or syncope. '}Past medical history: ${hx.length?hx.join(', '):'no significant cardiac history; non-smoker'}.\n\nO:\n${vits?vits+'. ':'Vitals stable. '}${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'No acute distress. CV: regular rate and rhythm, no murmurs. Chest clear.'}\nECG: ${v('cp-ecg')}\n\nA:\nDiagnosis: ${v('cp-dx')}\nDDx: stable angina, GERD, costochondritis, anxiety, ACS (rule out).\n\nP:\n${bul(plan)}\n\u2022 Follow up in ${v('cp-fu')}.`;
},

cold(){
  const sx=picks([['cold-cough','cough'],['cold-throat','sore throat'],['cold-runny','runny nose'],['cold-fatigue','mild fatigue'],['cold-congestion','nasal congestion'],['cold-fever','fever'],['cold-sob','shortness of breath'],['cold-cp','chest pain'],['cold-myalgia','myalgia']]);
  const abnExam=picks([['cold-nasal-congest','Nasal congestion'],['cold-pharynx','Pharyngeal erythema'],['cold-exudate','Tonsillar exudate'],['cold-lymph','Lymphadenopathy'],['cold-lungs-abn','Abnormal lung sounds']]);
  const plan=picks([['cold-reassure','Reassure; likely viral and self-limiting'],['cold-rest','Rest, fluids, warm saltwater gargles, saline nasal spray'],['cold-gargle','Warm saltwater gargles'],['cold-saline','Saline nasal spray'],['cold-apap','Acetaminophen or ibuprofen PRN for fever or discomfort'],['cold-no-abx','Avoid antibiotics'],['cold-swab','Throat swab / COVID test ordered'],['cold-return','Return if symptoms persist beyond 10 days, worsen, or fever >38.5\u00b0C develops']]);
  const vits=[v('cold-bp')?'BP: '+v('cold-bp'):'',v('cold-hr')?'HR: '+v('cold-hr'):'',v('cold-temp')?'Temp: '+v('cold-temp')+'\u00b0C':'',v('cold-rr')?'RR: '+v('cold-rr'):'',v('cold-spo2')?'SpO\u2082: '+v('cold-spo2'):''].filter(Boolean).join(', ');
  const s=sx.length?sx.join(', '):'upper respiratory symptoms';
  return `S:\nPatient presents with ${s} for ${v('cold-dur')}. Self-treatment tried: ${v('cold-self')} Past medical history: ${v('cold-pmh')}\n\nO:\n${vits?vits+'. ':'Vitals stable. '}${abnExam.length?'Exam: '+abnExam.join(', ')+'.':'Lungs clear to auscultation. No lymphadenopathy. No tonsillar exudate.'}\n\nA:\nDiagnosis: ${v('cold-dx')}\nDDx: influenza, allergic rhinitis, COVID-19 (less likely).\n\nP:\n${bul(plan)}`;
},

child(){
  const st=picks([['ch-eating','eating well'],['ch-sleeping','sleeping well'],['ch-active','active and playful'],['ch-milestones','meeting developmental milestones appropriate for age']]);
  const age=v('ch-age');
  const abnSys=picks([['ch-general-abn','General: distress / unwell appearance'],['ch-heent-abn','HEENT: abnormal finding'],['ch-neck-abn','Neck: lymphadenopathy / stiffness'],['ch-cardiac-abn','Cardiac: murmur / irregular rhythm'],['ch-resp-abn','Respiratory: abnormal breath sounds'],['ch-abd-abn','Abdomen: tender / organomegaly'],['ch-skin-abn','Skin: rash or lesion'],['ch-msk-abn','Musculoskeletal: abnormal tone or gait'],['ch-neuro-abn','Neuro: developmental concern']]);
  const plan=picks([['ch-diet','Continue healthy diet, regular physical activity, and adequate sleep'],['ch-safety','Anticipatory guidance given on safety, nutrition, and screen time'],['ch-nutrition','Nutrition counselling provided'],['ch-screen','Screen time guidance provided'],['ch-referral','Referral placed \u2014 see notes']]);
  const wt=v('ch-wt');const wtpct=v('ch-wt-pct');const ht=v('ch-ht');const htpct=v('ch-ht-pct');
  const growthLine=[wt?'Weight: '+wt+' lbs'+(wtpct?' ('+wtpct+' %ile)':''):'',ht?'Height: '+ht+(htpct?' ('+htpct+' %ile)':''):''].filter(Boolean).join(', ');
  return `S:\n${age?'Child ('+age+')':'Child'} brought in by parent for ${v('ch-type')}. ${v('ch-concerns')} ${st.length?'Child is '+st.join(', ')+'. ':''}${v('ch-illness')} ${v('ch-imm')}\n\nO:\n${growthLine?growthLine+'. ':''}${abnSys.length?'Abnormal findings: '+abnSys.join('. ')+'.':'Physical exam unremarkable. All systems within normal limits.'}\n\nA:\nAssessment: ${v('ch-dx')}\n\nP:\n${bul(plan)}\n\u2022 Immunizations reviewed and updated as needed.\n\u2022 Follow up ${v('ch-fu')}.`;
},


ocp(){
  const contra=picks([['ocp-smoke','smoker \u226535 years'],['ocp-aura','migraines with aura'],['ocp-dvt','history of DVT/PE'],['ocp-liver','liver disease'],['ocp-htn','uncontrolled hypertension'],['ocp-pregnant','currently pregnant'],['ocp-bf','currently breastfeeding'],['ocp-cvd','cardiovascular disease']]);
  const counsel=picks([['ocp-options','Discussed options: combined vs. progestin-only pills, benefits, and risks'],['ocp-howto','Explained correct use, missed pill instructions, and potential side effects'],['ocp-missed','Missed pill instructions reviewed'],['ocp-se','Potential side effects discussed (e.g. nausea, breast tenderness, spotting)'],['ocp-sti','Advised on STI prevention \u2014 OCP does not protect against infections; recommend condom use'],['ocp-bp-check','Check BP regularly while on OCP'],['ocp-interact','Drug interaction counselling provided'],['ocp-fertility','Return to fertility discussed']]);
  const rx=v('ocp-rx');
  const bp=v('ocp-bp');const bmi=v('ocp-bmi');
  const oVits=[bp?'BP: '+bp:'',bmi?'BMI: '+bmi:''].filter(Boolean).join('. ');
  return `S:\nPatient presents requesting information and advice about oral contraceptive pills. ${contra.length?'Contraindications identified on screening: '+contra.join(', ')+'. ':'No history of smoking, migraines with aura, thromboembolic disease, or liver problems. '}Patient reports ${v('ocp-periods').replace(/\.$/, '').toLowerCase()}. Medications / allergies: ${v('ocp-meds')} Patient is not currently pregnant or breastfeeding.\n\nO:\n${oVits?oVits+'. ':''}Exam: ${v('ocp-exam')}\n\nA:\n\u2022 ${v('ocp-suit')}\n\nP:\n${rx?'\u2022 '+rx+'.\n':''}${bul(counsel)}\n\u2022 Follow up in ${v('ocp-fu')}.`;
},

labs(){
  const sx=picks([['lab-fatigue','fatigue'],['lab-sob','shortness of breath'],['lab-palpitations','palpitations'],['lab-dizzy','dizziness/lightheadedness'],['lab-weightchange','unexplained weight change'],['lab-polyuria','polyuria/polydipsia'],['lab-pain','chest or abdominal pain'],['lab-bleeding','unusual bleeding or bruising']]);
  const flags=picks([['lab-flag-high','one or more values above normal range'],['lab-flag-low','one or more values below normal range'],['lab-flag-critical','critical value — patient notified urgently'],['lab-flag-trend','worsening trend vs. prior results'],['lab-flag-new','new abnormality identified'],['lab-flag-stable','values stable / unchanged']]);
  const actions=picks([['lab-action-discussed','Results discussed with patient'],['lab-action-nodx','No change to management — results reassuring'],['lab-action-repeat','Repeat labs ordered'],['lab-action-medsadj','Medication adjusted — see notes'],['lab-action-newrx','New medication initiated'],['lab-action-referral','Referral placed'],['lab-action-imaging','Imaging ordered'],['lab-action-diet','Dietary / lifestyle advice given'],['lab-action-urgent','Urgent follow-up arranged']]);
  const meds=v('lab-meds');
  // Build lab results line — only include values that were entered
  const labPairs=[['Hgb',v('lab-hgb')],['WBC',v('lab-wbc')],['Plt',v('lab-plt')],['Na',v('lab-na')],['K',v('lab-k')],['Cr',v('lab-creat')],['eGFR',v('lab-egfr')],['Glucose',v('lab-gluc')],['A1C',v('lab-a1c')+'%'],['TSH',v('lab-tsh')],['T4',v('lab-t4')],['LDL',v('lab-ldl')],['Chol',v('lab-tchol')],['HDL',v('lab-hdl')],['TG',v('lab-trig')],['ALT',v('lab-alt')],['AST',v('lab-ast')],['ALP',v('lab-alp')],['Bili',v('lab-bili')],['INR',v('lab-inr')],['B12',v('lab-b12')],['Ferritin',v('lab-ferritin')]];
  const otherLab=v('lab-other');
  const labResults=labPairs.filter(([,val])=>val&&val!='%').map(([k,v])=>k+': '+v).join(', ')+(otherLab?', '+otherLab:'');
  return `S:\n${v('lab-reason')} ${v('lab-aware')}${sx.length?' Patient reports: '+sx.join(', ')+'.':''} ${meds?'Current medications: '+meds+'.':''}\n\nO:\n${labResults?'Lab results — '+labResults+'.':'Lab results as per chart.'}\n${flags.length?'Flags: '+flags.join('; ')+'.' :''}\n\nA:\n\u2022 ${v('lab-interp')}\n\u2022 ${v('lab-sig')}\n\nP:\n${bul(actions)}\n\u2022 Next labs: ${v('lab-nextlabs')}\n\u2022 ${v('lab-fu')}`;
},

medrx(){
  const concerns=picks([['mr-adherence-concern','difficulty remembering / taking medications'],['mr-cost','medication cost concerns'],['mr-se-concern','side effects reported'],['mr-effectiveness','concerns about effectiveness'],['mr-complexity','complex regimen / too many pills'],['mr-newmeds','new medication recently started'],['mr-otc','using OTC / herbal / supplements'],['mr-stopped','stopped a medication without advice']]);
  const findings=picks([['mr-interaction','Potential drug interaction identified'],['mr-duplication','Therapeutic duplication identified'],['mr-underdose','Possible underdosing'],['mr-overdose','Possible overdosing / toxicity concern'],['mr-inappropriate','Potentially inappropriate medication for age / comorbidity'],['mr-missing','Missing medication for known indication'],['mr-monitoring','Monitoring not up to date for high-risk medication'],['mr-deprescribe','Candidate for deprescribing identified']]);
  const actions=picks([['mr-no-change','No medication changes — regimen appropriate'],['mr-stopped-med','Medication stopped — see notes'],['mr-dose-change','Dose adjusted — see notes'],['mr-new-med','New medication started — see notes'],['mr-switched','Medication switched — see notes'],['mr-counselled','Patient counselled on all medications'],['mr-adherence-plan','Adherence strategy discussed (pill organiser / blister pack)'],['mr-pharmacist','Pharmacist referral / MedsCheck arranged'],['mr-labs','Labs ordered for medication monitoring'],['mr-reconciled','Medication list reconciled and updated in chart']]);
  const meds=v('mr-meds');
  const vits=[v('mr-bp')?'BP: '+v('mr-bp'):'',v('mr-hr')?'HR: '+v('mr-hr')+' bpm':'',v('mr-wt')?'Weight: '+v('mr-wt')+' lbs':'',v('mr-egfr')?'eGFR: '+v('mr-egfr'):''].filter(Boolean).join(', ');
  const allergies=v('mr-allergies');
  return `S:\n${v('mr-reason')} Patient on ${v('mr-count')} regular medications. ${v('mr-adherence')}${concerns.length?' Patient-reported concerns: '+concerns.join(', ')+'.':''}${allergies?' Known allergies: '+allergies+'.':''}\n\nCurrent medications:\n${meds||'[see medication list in chart]'}\n\nO:\n${vits||'Vitals as per chart.'}\n${findings.length?'Review findings:\n'+bul(findings):'\u2022 No medication safety concerns identified on review.'}\n\nA:\n\u2022 ${v('mr-safety')}\n\u2022 Polypharmacy: ${v('mr-poly')}\n\nP:\n${bul(actions)}\n\u2022 Follow up: ${v('mr-fu')}`;
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
  return `S:\nPatient presents with ${v('ai-reason')} for ${v('ai-duration')}. Symptoms include: ${sx.length?sx.join(', '):'[see notes]'}.${phys.length?' Physical symptoms: '+phys.join(', ')+'.':''} ${v('ai-avoidance')} ${v('ai-trigger')} ${v('ai-pmh')} ${v('ai-etoh')}${meds?' Current medications: '+meds+'.':' No current medications or known allergies.'}\n\nO:\n${v('ai-appear')}. Affect: ${v('ai-affect')}.${abnExam.length?' Abnormal findings: '+abnExam.join(', ')+'.':' Normal rate and tone of speech. Logical, goal-directed thought. No evidence of psychosis.'}${gad?' GAD-7: '+gad+'.':''}\n\nA:\n\u2022 ${v('ai-dx')}\n\u2022 Severity: ${v('ai-severity')}.\n\u2022 ${v('ai-safety')}\n\nP:\n\u2022 ${v('ai-tx')}${med?'\n\u2022 '+med+' initiated.':''}\n${bul(plan)}\n\u2022 Follow up in ${v('ai-fu')}.`;
};

G.anxiety=function(){
  const drug=v('anx-drug');const med=drug?(v('anx-dose')?drug+' '+v('anx-dose'):drug):null;
  const sx=picks([['anx-worry','excessive worry'],['anx-restless','restlessness/on edge'],['anx-fatigue','fatigue'],['anx-concentration','poor concentration'],['anx-irritable','irritability'],['anx-muscle','muscle tension'],['anx-sleep','sleep disturbance'],['anx-avoidance','avoidance behaviour']]);
  const abnExam=picks([['anx-abnormal-speech','Abnormal speech'],['anx-disorganised','Disorganised thought'],['anx-psychosis-signs','Signs of psychosis']]);
  const plan=picks([['anx-monitor','Monitor for side effects and symptom changes'],['anx-lifestyle2','Lifestyle advice reinforced: sleep, exercise, limit caffeine'],['anx-breathing2','Breathing / relaxation techniques reinforced'],['anx-crisis','Crisis contact information provided'],['anx-referral2','Referral to mental health / counselling placed'],['anx-gad7rep','GAD-7 to be repeated at follow-up']]);
  const gad=v('anx-gad7');const panicVal=v('anx-panic');
  return `S:\nPatient presents for follow-up of anxiety. ${panicVal} ${sx.length?'Ongoing symptoms include: '+sx.join(', ')+'. ':'No significant ongoing symptoms reported. '}${v('anx-therapy')} ${v('anx-se')}\n\nO:\n${v('anx-appear')}. Affect: ${v('anx-affect')}.${abnExam.length?' Abnormal findings: '+abnExam.join(', ')+'.':' Normal speech, logical thought, no evidence of psychosis.'}${gad?' GAD-7: '+gad+'.':''}\n\nA:\n\u2022 ${v('anx-status')}\n\u2022 Safety: ${v('anx-safety')}\n\nP:\n\u2022 ${v('anx-rx')}${med?' ('+med+')':''}.\n${bul(plan)}\n\u2022 Follow up in ${v('anx-fu')}.`;
};

G.thyroid=function(){
  const drug=v('thy-drug')||'levothyroxine';const med=v('thy-dose')?drug+' '+v('thy-dose'):drug;
  const hyposx=picks([['thy-fatigue','fatigue'],['thy-weightgain','weight gain'],['thy-cold','cold intolerance'],['thy-constipation','constipation'],['thy-dryskin','dry skin/hair loss'],['thy-brainfog','brain fog'],['thy-depression','depressed mood'],['thy-bradycardia','bradycardia']]);
  const hypersx=picks([['thy-palp','palpitations'],['thy-sweating','sweating/heat intolerance'],['thy-tremor','tremor'],['thy-weightloss','weight loss'],['thy-insomnia','insomnia'],['thy-anxious','anxiety/restlessness']]);
  const plan=picks([['thy-refill','Refill '+med],['thy-timing','Reinforce correct timing: empty stomach 30\u201360 min before food'],['thy-labs','Repeat TSH in 6\u20138 weeks after any dose change'],['thy-labs-annual','Annual TSH and free T4 if stable'],['thy-interactions','Medication interactions reviewed (calcium, iron, antacids)'],['thy-endo','Endocrinology referral placed']]);
  const nd=v('thy-newdose');const mc=v('thy-medchanges');
  const vits=[v('thy-hr')?'HR: '+v('thy-hr')+' bpm':'',v('thy-wt')?'Weight: '+v('thy-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\nPatient presents for hypothyroidism medication refill. ${v('thy-adherence')} with ${med}.${mc?' Recent medication/supplement changes: '+mc+'.':' No recent medication or supplement changes.'} ${hyposx.length?'Hypothyroid symptoms: '+hyposx.join(', ')+'. ':'No hypothyroid symptoms reported. '}${hypersx.length?'Signs of possible over-replacement: '+hypersx.join(', ')+'. ':'No symptoms of over-replacement. '}\n\nO:\nTSH: ${v('thy-tsh')||'[pending]'}${v('thy-tshdate')?' ('+v('thy-tshdate')+')':''}. ${v('thy-t4')?'Free T4: '+v('thy-t4')+'. ':''}${vits?vits+'. ':''} ${v('thy-exam')}\n\nA:\n\u2022 Hypothyroidism \u2014 ${v('thy-status')}.\n\u2022 ${v('thy-tol')}\n\nP:\n\u2022 ${v('thy-action')}${nd?' New dose: '+nd+'.':''}.\n${bul(plan)}\n\u2022 Follow up in ${v('thy-fu')}.`;
};

G.gerd=function(){
  const drug=v('gerd-drug')||'PPI/H2 blocker';const med=v('gerd-dose')?drug+' '+v('gerd-dose'):drug;
  const sx=picks([['gerd-heartburn','heartburn/acid burning'],['gerd-regurgitation','regurgitation'],['gerd-chest','chest discomfort'],['gerd-dysphagia','dysphagia'],['gerd-belching','excessive belching/bloating'],['gerd-nocturnal','nocturnal symptoms']]);
  const rf=picks([['gerd-weightloss','unexplained weight loss'],['gerd-vomiting','persistent vomiting'],['gerd-bleeding','GI bleeding/melena'],['gerd-anaemia','anaemia'],['gerd-mass','palpable abdominal mass']]);
  const plan=picks([['gerd-refill','Refill '+med],['gerd-lifestyle','Lifestyle advice: elevate head of bed, avoid triggers, small meals'],['gerd-antacid','Antacid for breakthrough symptoms as needed'],['gerd-scope','Upper GI endoscopy referral placed'],['gerd-gastro','Gastroenterology referral placed'],['gerd-alarmwarn','Patient advised to return if alarm symptoms develop']]);
  const vits=[v('gerd-bp')?'BP: '+v('gerd-bp'):'',v('gerd-wt')?'Weight: '+v('gerd-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\nPatient presents for GERD medication refill. ${v('gerd-adherence')} with ${med}. ${sx.length?'Ongoing symptoms: '+sx.join(', ')+'. ':'No significant GERD symptoms reported. '}${v('gerd-control')} ${v('gerd-triggers')} ${rf.length?'Alarm symptoms present: '+rf.join(', ')+' \u2014 further investigation warranted.':'No alarm symptoms identified.'}\n\nO:\n${vits?vits+'. ':''} ${v('gerd-exam')}\n\nA:\n\u2022 GERD \u2014 ${v('gerd-status')}.\n\u2022 ${v('gerd-redflag')}\n\nP:\n\u2022 ${v('gerd-action')}.\n${bul(plan)}\n\u2022 Follow up in ${v('gerd-fu')}.`;
};

G.uti=function(){
  const usx=picks([['uti-dysuria','dysuria'],['uti-frequency','urinary frequency'],['uti-urgency','urinary urgency'],['uti-hematuria','haematuria'],['uti-cloudy','cloudy/foul-smelling urine'],['uti-suprapubic','suprapubic discomfort']]);
  const upsx=picks([['uti-fever','fever/chills'],['uti-flank','flank/loin pain'],['uti-nausea','nausea/vomiting'],['uti-rigors','rigors'],['uti-malaise','malaise']]);
  const abnExam=picks([['uti-suprapubic-tender','Suprapubic tenderness'],['uti-cva-tender','CVA tenderness'],['uti-vaginitis','Evidence of vaginitis']]);
  const plan=picks([['uti-abxed','Antibiotic course and completion explained'],['uti-hydration','Increased fluid intake advised'],['uti-analgesia','Analgesic for symptom relief if needed'],['uti-culture','Urine culture sent prior to antibiotics'],['uti-return','Return if no improvement in 48\u201372 hours or symptoms worsen'],['uti-prevention','Prevention advice: hygiene and voiding habits discussed'],['uti-refer','Urology / gynaecology referral for recurrent UTI']]);
  const abx=v('uti-abx');const abxdose=v('uti-abxdose');const allergies=v('uti-allergies');
  const vits=[v('uti-temp')?'Temp: '+v('uti-temp')+'\u00b0C':'',v('uti-bp')?'BP: '+v('uti-bp'):'',v('uti-hr')?'HR: '+v('uti-hr')+' bpm':''].filter(Boolean).join(', ');
  return `S:\n${v('uti-sex')} patient presents with ${usx.length?usx.join(', '):'urinary symptoms'} for ${v('uti-duration')}.${upsx.length?' Upper UTI / systemic symptoms: '+upsx.join(', ')+'.':' No fever, flank pain, nausea, or systemic symptoms.'} ${v('uti-recurrent')} ${v('uti-pregnant')}${allergies?' Allergies: '+allergies+'.':' No known allergies.'}\n\nO:\n${vits||'Vitals stable.'}${abnExam.length?' Exam: '+abnExam.join(', ')+'.':' Abdomen: suprapubic area non-tender. No CVA tenderness.'}\nUrinalysis: ${v('uti-ua')}\n\nA:\n\u2022 ${v('uti-dx')}\n\nP:\n${abx?'\u2022 '+abx+(abxdose?' '+abxdose:'')+' prescribed.\n':''}${bul(plan)}\n\u2022 Follow up: ${v('uti-fu')}.`;
};

// ── NEW GENERATORS ──────────────────────────────────────────

G['dep-initial']=function(){
  const drug=v('di-drug'); const dose=v('di-dose'); const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['di-low-mood','persistent low mood'],['di-anhedonia','anhedonia (loss of interest/pleasure)'],['di-fatigue','fatigue/low energy'],['di-concentration','poor concentration'],['di-worthless','feelings of worthlessness/guilt'],['di-sleep','sleep disturbance'],['di-appetite','appetite/weight change'],['di-psychomotor','psychomotor changes']]);
  const abnAppear=picks([['di-agitated','Agitated / psychomotor agitation'],['di-dishevelled','Dishevelled / poor self-care'],['di-uncooperative','Uncooperative'],['di-abnormal-speech','Abnormal rate or tone of speech'],['di-disorganised','Disorganised / illogical thought']]);
  const plan=picks([['di-edu','Psychoeducation on depression provided'],['di-lifestyle','Lifestyle advice: sleep hygiene, physical activity, routine'],['di-monitor','Monitor for side effects and response in 2\u20134 weeks'],['di-crisis','Crisis contact information provided'],['di-referral','Referral to mental health / counselling placed'],['di-safety-plan','Safety plan documented'],['di-phq9-repeat','PHQ-9 to be repeated at follow-up']]);
  const phq=v('di-phq9'); const meds=v('di-meds');
  return `S:\nPatient presents with depressive symptoms for ${v('di-duration')}. Presenting concern: ${v('di-reason')}. Symptoms include: ${sx.length?sx.join(', '):'[see notes]'}. ${v('di-si')} Precipitating factors: ${v('di-trigger')} Psychiatric history: ${v('di-pmh')} Family psychiatric history: ${v('di-fmh')} Substance use: ${v('di-etoh')}${meds?' Current medications: '+meds+'.':' No current medications or known allergies.'}\n\nO:\nMood: ${v('di-omood')}. Affect: ${v('di-affect')}.${abnAppear.length?' Abnormal behaviour / appearance: '+abnAppear.join(', ')+'.':' Cooperative, appropriate appearance, normal speech, logical thought process.'} ${v('di-psych')}${phq?' PHQ-9 score: '+phq+'.':''}\n\nA:\n\u2022 ${v('di-dx')}\n\u2022 Severity: ${v('di-severity')}.\n\u2022 Safety: ${v('di-safety')}\n\nP:\n\u2022 ${v('di-tx')}${med?'\n\u2022 '+med+' initiated.':''}\n${bul(plan)}\n\u2022 Follow up in ${v('di-fu')}.`;
};

G.handpain=function(){
  const sx=picks([['hp-swelling','swelling of joint(s)'],['hp-stiffness','morning stiffness >30 min'],['hp-numbness','numbness/tingling in fingers'],['hp-weakness','weakness/reduced grip strength'],['hp-nightsymptoms','night-time symptoms'],['hp-locking','locking or triggering of finger(s)']]);
  const hx=picks([['hp-oa','osteoarthritis'],['hp-ra','rheumatoid arthritis'],['hp-trauma','recent trauma/fracture'],['hp-repetitive','repetitive occupational use'],['hp-diabetes','diabetes'],['hp-thyroid','thyroid disorder']]);
  const exam=picks([['hp-swelling-exam','Swelling noted'],['hp-tenderness','Tenderness on palpation'],['hp-reduced-rom','Reduced range of motion'],['hp-grip-weak','Reduced grip strength'],['hp-deformity','Joint deformity noted']]);
  const plan=picks([['hp-reassure','Reassure and educate patient'],['hp-analgesia','Analgesia: acetaminophen / NSAID PRN'],['hp-splint','Splinting recommended'],['hp-physio','Hand physiotherapy / occupational therapy referral placed'],['hp-injection','Corticosteroid injection considered / arranged'],['hp-imaging-plan','Imaging ordered (X-ray / ultrasound / MRI)'],['hp-rheum','Rheumatology referral placed'],['hp-ortho','Orthopedic / hand surgery referral placed'],['hp-nerve','Nerve conduction study ordered']]);
  return `S:\nPatient presents with ${v('hp-char')} affecting the ${v('hp-dominant').toLowerCase().replace(' affected','')} for ${v('hp-duration')}. Onset: ${v('hp-onset')}. Location: ${v('hp-loc')}. Intensity ${v('hp-pain')||'?'}/10. ${sx.length?'Associated symptoms: '+sx.join(', ')+'. ':'No significant associated symptoms. '}Aggravated by ${v('hp-aggr')}; relieved by ${v('hp-relief')}. ${hx.length?'Relevant history: '+hx.join(', ')+'.':'No significant past hand or joint history.'}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\nSpecial tests: ${v('hp-tests')}\nImaging: ${v('hp-xray')}\n\nA:\nDiagnosis: ${v('hp-dx')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('hp-fu')}.`;
};

G.kneepain=function(){
  const sx=picks([['kp-swelling','swelling/effusion'],['kp-stiffness','morning stiffness >30 min'],['kp-locking','locking or catching'],['kp-giving-way','giving way/instability'],['kp-crepitus','crepitus'],['kp-night','night pain']]);
  const hx=picks([['kp-oa','osteoarthritis'],['kp-ra','rheumatoid arthritis'],['kp-trauma','recent trauma/twisting injury'],['kp-overweight','overweight/obesity'],['kp-prev-injury','previous knee injury or surgery'],['kp-sport','high-impact sport/activity']]);
  const exam=picks([['kp-effusion','Effusion on exam'],['kp-tender','Joint line tenderness'],['kp-reduced-rom','Reduced range of motion'],['kp-instability','Ligamentous instability on exam'],['kp-neuro-deficit','Neurovascular deficit']]);
  const plan=picks([['kp-reassure','Reassure and educate patient'],['kp-analgesia','Analgesia: acetaminophen / NSAID PRN'],['kp-ice','Ice and elevation for acute swelling'],['kp-physio','Physiotherapy referral for strengthening and mobility'],['kp-weightloss','Weight loss counselled'],['kp-brace','Knee brace / support recommended'],['kp-injection','Corticosteroid / hyaluronic acid injection considered'],['kp-imaging-plan','Further imaging ordered (X-ray / MRI)'],['kp-ortho','Orthopedic referral placed'],['kp-activity-mod','Activity modification advised']]);
  const kpOnset=v('kp-onset');
  const kpOnsetStr=kpOnset.toLowerCase().includes('onset')?kpOnset:kpOnset+'.';
  return `S:\nPatient presents with ${v('kp-side').toLowerCase()} pain for ${v('kp-duration')}. Onset: ${kpOnsetStr} Location: ${v('kp-loc')}, character: ${v('kp-char')}, ${v('kp-pain')||'?'}/10 intensity. ${sx.length?'Associated symptoms: '+sx.join(', ')+'. ':'No swelling, locking, giving way, or significant associated symptoms. '}Aggravated by ${v('kp-aggr')}; relieved by ${v('kp-relief')}. ${hx.length?'Relevant history: '+hx.join(', ')+'.':'No significant past knee or joint history.'}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\nSpecial tests: ${v('kp-tests')}\nImaging: ${v('kp-xray')}\n\nA:\nDiagnosis: ${v('kp-dx')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('kp-fu')}.`;
};

G.ihd=function(){
  const meds=v('ihd-meds');
  const sx=picks([['ihd-angina','chest pain/angina'],['ihd-sob','shortness of breath on exertion'],['ihd-sob-rest','shortness of breath at rest'],['ihd-palpitations','palpitations'],['ihd-syncope','syncope/pre-syncope'],['ihd-edema','peripheral oedema'],['ihd-fatigue','fatigue/reduced exercise tolerance'],['ihd-orthopnoea','orthopnoea/PND']]);
  const rf=picks([['ihd-smoking','active smoking'],['ihd-dm','poorly controlled diabetes'],['ihd-htn-uctrl','poorly controlled hypertension'],['ihd-dyslip','dyslipidaemia on treatment'],['ihd-overweight','overweight/obesity'],['ihd-inactive','sedentary lifestyle']]);
  const abnExam=picks([['ihd-acute-distress','Acute distress'],['ihd-murmur','Cardiac murmur'],['ihd-lungs-abn','Lungs abnormal (crackles / wheeze)'],['ihd-edema-exam','Peripheral oedema'],['ihd-raised-jvp','Raised JVP']]);
  const plan=picks([['ihd-contmeds','Continue all current cardiac medications'],['ihd-aspirin','Aspirin / antiplatelet therapy continued'],['ihd-statin','Statin therapy reviewed and continued'],['ihd-bblocker','Beta-blocker dose reviewed'],['ihd-acei','ACE inhibitor / ARB reviewed'],['ihd-lipids','Lipid panel ordered if not done within last year'],['ihd-ecg','ECG ordered / reviewed'],['ihd-exercise','Cardiac rehabilitation / structured exercise advised'],['ihd-smoking-cessation','Smoking cessation support offered'],['ihd-diet','Heart-healthy diet counselled'],['ihd-cardio-ref','Cardiology referral placed'],['ihd-stress','Stress test / imaging ordered']]);
  const ldl=v('ihd-ldl');
  return `S:\nPatient presents for follow-up of ischemic heart disease. ${meds?'Current medications: '+meds+'. ':''}${v('ihd-adherence')} ${sx.length?'Current symptoms: '+sx.join(', ')+'. ':'Denies chest pain, shortness of breath, palpitations, syncope, fatigue, or reduced exercise tolerance. '}Angina: ${v('ihd-angina-freq')} GTN use: ${v('ihd-gtn')} ${rf.length?'Active cardiac risk factors: '+rf.join(', ')+'.':''}\n\nO:\n${[v('ihd-bp')?'BP: '+v('ihd-bp'):'',v('ihd-hr')?'HR: '+v('ihd-hr')+' bpm':'',v('ihd-wt')?'Weight: '+v('ihd-wt')+' lbs':'',v('ihd-spo2')?'SpO\u2082: '+v('ihd-spo2'):''].filter(Boolean).join('. ')}\n${exam.length?exam.join('. ')+'.':''}\nInvestigations: ${v('ihd-invx')}${ldl?'\n'+ldl+'.':''}\n\nA:\n• Status: ${v('ihd-status')}\n• Risk factor control: ${v('ihd-riskctrl')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('ihd-fu')}.`;
};

G.hf=function(){
  const meds=v('hf-meds');
  const sx=picks([['hf-sob-exert','shortness of breath on exertion'],['hf-sob-rest','shortness of breath at rest'],['hf-orthopnoea','orthopnoea'],['hf-pnd','paroxysmal nocturnal dyspnoea (PND)'],['hf-edema','peripheral oedema'],['hf-fatigue','fatigue/reduced exercise tolerance'],['hf-palpitations','palpitations'],['hf-syncope','syncope/pre-syncope']]);
  const abnExam=picks([['hf-acute-distress','Acute distress'],['hf-murmur','Murmur / abnormal rhythm'],['hf-crackles','Bibasal crackles on auscultation'],['hf-edema-exam','Peripheral oedema'],['hf-raised-jvp','Raised JVP']]);
  const plan=picks([['hf-contmeds','Continue all current heart failure medications'],['hf-diuretic','Diuretic dose reviewed and optimised'],['hf-acei-arb','ACE inhibitor / ARB / ARNI reviewed'],['hf-bblocker','Beta-blocker reviewed'],['hf-mra','Mineralocorticoid antagonist reviewed'],['hf-sglt2','SGLT2 inhibitor reviewed / initiated'],['hf-electrolytes','Renal function and electrolytes monitored'],['hf-bnp','BNP / NT-proBNP ordered'],['hf-echo','Echocardiogram ordered / reviewed'],['hf-fluid-ed','Fluid restriction and low-sodium diet reinforced'],['hf-weight-ed','Daily weight monitoring reinforced'],['hf-rehab','Cardiac rehabilitation referral placed'],['hf-cardio','Cardiology referral placed'],['hf-er-warn','Patient advised to present to ER if: acute shortness of breath, weight gain >2 kg in 3 days, or worsening symptoms']]);
  const ef=v('hf-ef');
  const hfType=v('hf-type').charAt(0).toLowerCase()+v('hf-type').slice(1).replace(/\.$/,'');
  return `S:\nPatient presents for follow-up of ${hfType}. ${meds?'Current medications: '+meds+'. ':''}${v('hf-adherence')} Weight monitoring: ${v('hf-weight-mon')} ${sx.length?'Current symptoms: '+sx.join(', ')+'. ':'No significant symptoms of decompensation reported. '}Functional class: ${v('hf-nyha')} Fluid and dietary adherence: ${v('hf-fluid')}\n\nO:\n${[v('hf-bp')?'BP: '+v('hf-bp'):'',v('hf-hr')?'HR: '+v('hf-hr')+' bpm':'',v('hf-wt')?'Weight: '+v('hf-wt')+' lbs':'',v('hf-spo2')?'SpO\u2082: '+v('hf-spo2'):'',v('hf-rr')?'RR: '+v('hf-rr'):''].filter(Boolean).join('. ')}\n${abnExam.length?'Abnormal findings: '+abnExam.join(', ')+'.':'No acute distress. Regular rate and rhythm. Lungs clear. No oedema. No raised JVP.'}\nInvestigations: ${v('hf-invx')}${ef?'\n'+ef+'.':''}\n\nA:\n• Status: ${v('hf-status')}\n• Volume status: ${v('hf-volume')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('hf-fu')}.`;
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
  const active = document.querySelector('.form-panel.active');
  if (active) {
    const type = active.id.replace('panel-', '');
    const out = document.getElementById('out-' + type);
    if (out && out.style.display !== 'none') generate(type);
  }
}

// ── COMPACT GENERATORS ──────────────────────────────────────
// Same forms, same checkbox IDs. Output only positive findings.

function vits(pairs) {
  return pairs.filter(([val]) => val).map(([val, lbl]) => lbl + ': ' + val).join(', ');
}

const C = {

'dep-initial'() {
  const drug=v('di-drug');const dose=v('di-dose');const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['di-low-mood','low mood'],['di-anhedonia','anhedonia'],['di-fatigue','fatigue'],['di-concentration','poor concentration'],['di-worthless','worthlessness/guilt'],['di-sleep','sleep disturbance'],['di-appetite','appetite change'],['di-psychomotor','psychomotor changes']]);
  const abnAppear=picks([['di-agitated','Agitated'],['di-dishevelled','Dishevelled'],['di-uncooperative','Uncooperative'],['di-abnormal-speech','Abnormal speech'],['di-disorganised','Disorganised thought']]);
  const plan=picks([['di-edu','Psychoeducation provided'],['di-lifestyle','Lifestyle advice given'],['di-monitor','Monitor response 2–4 wks'],['di-crisis','Crisis line provided'],['di-referral','Mental health referral'],['di-safety-plan','Safety plan documented'],['di-phq9-repeat','PHQ-9 at f/u']]);
  const phq=v('di-phq9');const siVal=v('di-si');const siLine=siVal.toLowerCase().startsWith('denies')?'':'SI: '+siVal;
  return `S: New presentation — depressive sx × ${v('di-duration')}.${sx.length?' Sx: '+sx.join(', ')+'.':''} ${v('di-trigger')} ${v('di-etoh')}${siLine?' '+siLine:''}\n\nO: Mood: ${v('di-omood')}. Affect: ${v('di-affect')}.${abnAppear.length?' Abnormal: '+abnAppear.join(', ')+'.':''} ${v('di-psych')}${phq?' PHQ-9: '+phq:''}\n\nA: ${v('di-dx')} — ${v('di-severity')}.\n\nP:\n• ${v('di-tx')}${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• F/u ${v('di-fu')}.`;
},

depression() {
  const drug=v('dep-drug')||'current antidepressant';const med=v('dep-dose')?drug+' '+v('dep-dose'):drug;
  const sx=picks([['dep-fatigue','fatigue'],['dep-motivation','low motivation'],['dep-anhedonia','anhedonia'],['dep-concentration','poor concentration']]);
  const abnAppear=picks([['dep-agitated','Agitated'],['dep-dishevelled','Dishevelled'],['dep-uncooperative','Uncooperative'],['dep-abnormal-speech','Abnormal speech'],['dep-disorganised','Disorganised thought']]);
  const plan=picks([['dep-monitor','Monitor side effects and mood'],['dep-sleep-hyg','Sleep hygiene and routine'],['dep-activity','Regular physical activity'],['dep-crisis','Crisis line provided'],['dep-referral','Mental health / counselling referral'],['dep-therapy','CBT / therapy discussed']]);
  const safetyVal=v('dep-safety');const safetyLine=safetyVal.toLowerCase().includes('no acute')?'':'Safety: '+safetyVal;
  const seVal=v('dep-se');
  return `S: F/u depression. Mood ${v('dep-mood')} on ${med}.${sx.length?' Sx: '+sx.join(', ')+'.':''} Sleep: ${v('dep-sleep')}. Appetite: ${v('dep-appetite')}.${!seVal.toLowerCase().startsWith('no')?' '+seVal:''}\n\nO: Mood: ${v('dep-omood')}. Affect: ${v('dep-affect')}.${abnAppear.length?' Abnormal: '+abnAppear.join(', ')+'.':''}\n\nA: MDD — ${v('dep-status')}.${safetyLine?' '+safetyLine:''}\n\nP:\n• ${v('dep-rx')} (${med}).\n${bul(plan)}\n• F/u ${v('dep-fu')}.`;
},

'anx-initial'() {
  const drug=v('ai-drug');const dose=v('ai-dose');const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['ai-worry','excessive worry'],['ai-restless','restlessness'],['ai-fatigue','fatigue'],['ai-concentration','poor concentration'],['ai-irritable','irritability'],['ai-muscle','muscle tension'],['ai-sleep','sleep disturbance'],['ai-panic','panic attacks']]);
  const phys=picks([['ai-palpitations','palpitations'],['ai-sweating','sweating'],['ai-trembling','trembling'],['ai-sob','SOB'],['ai-chest','chest tightness'],['ai-dizziness','dizziness']]);
  const plan=picks([['ai-edu','Psychoeducation provided'],['ai-lifestyle','Lifestyle: sleep, exercise, limit caffeine'],['ai-breathing','Breathing/relaxation techniques'],['ai-monitor','Monitor response'],['ai-crisis','Crisis line provided'],['ai-referral','Mental health referral'],['ai-gad7rep','GAD-7 at f/u']]);
  const gad=v('ai-gad7');
  return `S: ${v('ai-reason')} × ${v('ai-duration')}.${sx.length?' Sx: '+sx.join(', ')+'.':''}${phys.length?' Physical: '+phys.join(', '):''}\n\nO: ${v('ai-appear')}.${gad?' GAD-7: '+gad:''}\n\nA: ${v('ai-dx')} — ${v('ai-severity')}.\n\nP:\n• ${v('ai-tx')}${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• F/u ${v('ai-fu')}.`;
},

anxiety() {
  const drug=v('anx-drug');const med=drug?(v('anx-dose')?drug+' '+v('anx-dose'):drug):null;
  const sx=picks([['anx-worry','worry'],['anx-restless','restlessness'],['anx-fatigue','fatigue'],['anx-concentration','poor concentration'],['anx-irritable','irritability'],['anx-muscle','muscle tension'],['anx-sleep','sleep disturbance'],['anx-avoidance','avoidance']]);
  const plan=picks([['anx-monitor','Monitor sx'],['anx-lifestyle2','Lifestyle reinforced'],['anx-breathing2','Breathing/relaxation reinforced'],['anx-crisis','Crisis line provided'],['anx-referral2','Mental health referral'],['anx-gad7rep','GAD-7 at f/u']]);
  const gad=v('anx-gad7');const panicVal=v('anx-panic');
  return `S: F/u anxiety.${!panicVal.toLowerCase().startsWith('no panic')?' '+panicVal:''}${sx.length?' Sx: '+sx.join(', '):''}. ${v('anx-therapy')}.${!v('anx-se').toLowerCase().startsWith('no')?' '+v('anx-se'):''}\n\nO: ${v('anx-appear')}.${gad?' GAD-7: '+gad:''}\n\nA: ${v('anx-status')}.\n\nP:\n• ${v('anx-rx')}${med?' ('+med+')':''}.\n${bul(plan)}\n• F/u ${v('anx-fu')}.`;
},

t2dm() {
  const drug=v('dm-drug')||'DM med';const med=v('dm-dose')?drug+' '+v('dm-dose'):drug;
  const sx=picks([['dm-hypo','hypoglycemia'],['dm-hyper','hyperglycemia'],['dm-polyuria','polyuria'],['dm-polydipsia','polydipsia'],['dm-fatigue','fatigue'],['dm-se','side effects']]);
  const plan=picks([['dm-refill','Refill '+med],['dm-continue','Continue DM management'],['dm-diet','Diet and exercise'],['dm-labs','A1C / labs if due'],['dm-footcheck','Foot exam'],['dm-bp-plan','BP reviewed']]);
  const a1c=v('dm-a1c');const a1cd=v('dm-a1cdate');
  const oVits=vits([[v('dm-bp'),'BP'],[v('dm-hr'),'HR'],[v('dm-wt'),'wt']]);
  const examVal=v('dm-exam');const examLine=examVal.toLowerCase().startsWith('no acute')?'':'Exam: '+examVal;
  return `S: F/u T2DM. ${med}, ${v('dm-adherence')}.${sx.length?' Sx: '+sx.join(', '):''}\n\nO: A1C ${a1c?a1c+'%':'[pending]'}${a1cd?' ('+a1cd+')':''}${oVits?', '+oVits:''}.${examLine?' '+examLine:''}\n\nA: T2DM — ${v('dm-status')}.\n\nP:\n${bul(plan)}\n• F/u ${v('dm-fu')}.`;
},

htn() {
  const med1=v('htn-med1');const med2=v('htn-med2');
  const meds=[med1,med2].filter(Boolean).join(', ')||'antihypertensives';
  const sx=picks([['htn-cp','CP'],['htn-sob','SOB'],['htn-ha','HA'],['htn-dizzy','dizziness'],['htn-se','side effects'],['htn-er','ER visit']]);
  const abnExam=picks([['htn-acute-distress','Acute distress'],['htn-murmur','Murmur'],['htn-lungs-abn','Lungs abnormal'],['htn-edema','Edema']]);
  const plan=picks([['htn-refill','Refill '+meds],['htn-lifestyle','Lifestyle modifications'],['htn-homebp-plan','Home BP monitoring'],['htn-cmp','CMP if due'],['htn-echo','Echo / cardiology referral'],['htn-sodium','Low-sodium diet']]);
  const homebp=v('htn-homebp');const oVits=vits([[v('htn-bp'),'BP'],[v('htn-hr'),'HR']]);
  return `S: F/u HTN. ${meds}.${sx.length?' Reports: '+sx.join(', '):' '+v('htn-adherence')}.${homebp?' Home BP ~'+homebp+'.':''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', '):''}\n\nA: HTN — ${v('htn-control')}.\n\nP:\n${bul(plan)}\n• F/u ${v('htn-fu')}.`;
},

thyroid() {
  const drug=v('thy-drug')||'levothyroxine';const med=v('thy-dose')?drug+' '+v('thy-dose'):drug;
  const hyposx=picks([['thy-fatigue','fatigue'],['thy-weightgain','weight gain'],['thy-cold','cold intolerance'],['thy-constipation','constipation'],['thy-dryskin','dry skin/hair loss'],['thy-brainfog','brain fog'],['thy-depression','low mood'],['thy-bradycardia','bradycardia']]);
  const hypersx=picks([['thy-palp','palpitations'],['thy-sweating','heat intolerance'],['thy-tremor','tremor'],['thy-weightloss','weight loss'],['thy-insomnia','insomnia'],['thy-anxious','anxiety']]);
  const plan=picks([['thy-refill','Refill '+med],['thy-timing','Correct timing reinforced'],['thy-labs','TSH in 6–8 wks (dose change)'],['thy-labs-annual','Annual TSH/T4'],['thy-interactions','Drug interactions reviewed'],['thy-endo','Endocrinology referral']]);
  const nd=v('thy-newdose');const oVits=vits([[v('thy-hr'),'HR'],[v('thy-wt'),'wt']]);
  return `S: F/u hypothyroidism. ${med}, ${v('thy-adherence')}.${hyposx.length?' Hypothyroid sx: '+hyposx.join(', '):''}${hypersx.length?' Over-replacement sx: '+hypersx.join(', '):''}\n\nO: TSH ${v('thy-tsh')||'[pending]'}${v('thy-tshdate')?' ('+v('thy-tshdate')+')':''}${v('thy-t4')?', T4 '+v('thy-t4'):''}${oVits?', '+oVits:''}. ${v('thy-exam')}\n\nA: Hypothyroidism — ${v('thy-status')}.\n\nP:\n• ${v('thy-action')}${nd?' — '+nd:''}.\n${bul(plan)}\n• F/u ${v('thy-fu')}.`;
},

gerd() {
  const drug=v('gerd-drug')||'PPI/H2 blocker';const med=v('gerd-dose')?drug+' '+v('gerd-dose'):drug;
  const sx=picks([['gerd-heartburn','heartburn'],['gerd-regurgitation','regurgitation'],['gerd-chest','chest discomfort'],['gerd-dysphagia','dysphagia'],['gerd-belching','bloating'],['gerd-nocturnal','nocturnal sx']]);
  const rf=picks([['gerd-weightloss','weight loss'],['gerd-vomiting','persistent vomiting'],['gerd-bleeding','GI bleeding'],['gerd-anaemia','anaemia'],['gerd-mass','abdominal mass']]);
  const plan=picks([['gerd-refill','Refill '+med],['gerd-lifestyle','Lifestyle: elevate HOB, avoid triggers'],['gerd-antacid','Antacid PRN'],['gerd-scope','GI endoscopy referral'],['gerd-gastro','Gastroenterology referral'],['gerd-alarmwarn','Return if alarm sx']]);
  const oVits=vits([[v('gerd-bp'),'BP'],[v('gerd-wt'),'wt']]);
  return `S: F/u GERD. ${med}, ${v('gerd-adherence')}.${sx.length?' Sx: '+sx.join(', ')+'.':''}${rf.length?' ⚠ Alarm sx: '+rf.join(', '):''}\n\nO: ${oVits||'Vitals stable'}. ${v('gerd-exam')}\n\nA: GERD — ${v('gerd-status')}.\n\nP:\n• ${v('gerd-action')}.\n${bul(plan)}\n• F/u ${v('gerd-fu')}.`;
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
  return `S: INR check.${sLines.length?' '+sLines.join('. ')+'.':' No concerns.'}\n\nO: ${inrVal?'INR '+inrVal+' ':''} ${inrTarget?'(target '+inrTarget+')':''}${inrDose?' Warfarin '+inrDose+'.':''}.${abnSigns.length?' '+abnSigns.join(', '):''}\n\nA: ${inrStable?'INR therapeutic.':'INR '+inrStatus+' — dose adjustment required.'}\n\nP:\n• ${v('inr-action')}${nd?' — '+nd:''}.\n• Recheck INR in ${v('inr-recheck')}.\n${bul(edu)}`;
},

backpain() {
  const rf=picks([['bp-radiation','radiation'],['bp-numbness','numbness/tingling'],['bp-weakness','weakness'],['bp-bowel','bowel/bladder changes'],['bp-fever','fever/weight loss']]);
  const posExam=picks([['bp-stable','Vitals stable'],['bp-tender','Paraspinal tenderness'],['bp-limited-flex','Limited flexion']]);
  const abnExam=picks([['bp-midline-tender','Midline tenderness'],['bp-neuro-deficit','Neuro deficit'],['bp-slr-pos','SLR positive']]);
  const onset=v('bp-onset');const onsetStr=onset.startsWith('gradual')?'gradual onset':'onset '+onset;
  const plan=picks([['bp-reassure','Reassured'],['bp-activity','Gentle activity'],['bp-ibu','Ibuprofen 400 mg q6–8h PRN'],['bp-heat','Heat'],['bp-stretch','Stretching'],['bp-physio','Physio referral'],['bp-imaging','Imaging ordered'],['bp-neuro-warn','Return if neuro sx']]);
  const examOut=[...posExam,...(abnExam.length?['Abnormal: '+abnExam.join(', ')]:['Neuro intact, SLR negative'])];
  return `S: LBP × ${v('bp-duration')}, ${onsetStr}. ${v('bp-char')}, ${v('bp-pain-rest')||'?'}/10 rest, ${v('bp-pain-move')||'?'}/10 mvmt.${rf.length?' ⚠ '+rf.join(', '):''}\n\nO: ${examOut.join('. ')}.\n\nA: ${v('bp-dx')}\n\nP:\n${bul(plan)}\n• F/u ${v('bp-fu')}.`;
},

headache() {
  const assoc=picks([['ha-nausea','nausea'],['ha-vomit','vomiting'],['ha-visual','visual changes'],['ha-photo','photophobia'],['ha-phono','phonophobia'],['ha-weakness','weakness']]);
  const abnExam=picks([['ha-neuro-deficit','Focal neuro deficit'],['ha-cn-deficit','CN deficit'],['ha-papilloedema','Papilloedema'],['ha-neck-stiff','Neck stiffness'],['ha-sinus-tender','Sinus/TA tenderness'],['ha-disoriented','Disoriented']]);
  const plan=picks([['ha-apap','Acetaminophen 500 mg q6h PRN'],['ha-ibu','Ibuprofen 400 mg q6–8h PRN'],['ha-hydration','Hydration/regular meals'],['ha-caffeine','Reduce caffeine/screen time'],['ha-triptan','Triptan prescribed'],['ha-neuro','Neurology referral']]);
  return `S: HA × ${v('ha-dur')}, ${v('ha-onset')}. ${v('ha-loc')}, ${v('ha-char')}, ${v('ha-pain')||'?'}/10.${assoc.length?' '+assoc.join(', '):''} ↑ ${v('ha-aggr')}.\n\nO: Alert, oriented.${abnExam.length?' Abnormal: '+abnExam.join(', ')+'.':' No focal neuro deficits.'}\n\nA: ${v('ha-dx')}\n\nP:\n${bul(plan)}\n• F/u ${v('ha-fu')}.`;
},

chestpain() {
  const assoc=picks([['cp-radiation','radiation to arm/jaw'],['cp-sob','SOB'],['cp-nausea','nausea'],['cp-diaphoresis','diaphoresis'],['cp-palp','palpitations'],['cp-syncope','syncope']]);
  const hx=picks([['cp-htn','HTN'],['cp-cardiac','cardiac hx'],['cp-smoker','smoker'],['cp-dm','DM'],['cp-trauma','recent trauma']]);
  const abnExam=picks([['cp-acute-distress','Acute distress'],['cp-murmur','Murmur'],['cp-lungs-abn','Lungs abnormal'],['cp-abd-tender','Abd tenderness'],['cp-cw-tender','CW tenderness']]);
  const plan=picks([['cp-ecg-ord','ECG + troponin ordered'],['cp-reassure','Reassured'],['cp-no-exert','Avoid exertion'],['cp-nsaid','NSAID if cardiac excluded'],['cp-er-warn','ER precautions given'],['cp-cardio','Cardiology referral'],['cp-stress','Stress test ordered']]);
  const oVits=vits([[v('cp-bp'),'BP'],[v('cp-hr'),'HR'],[v('cp-rr'),'RR'],[v('cp-temp'),'T'],[v('cp-spo2'),'SpO₂']]);
  return `S: CP × ${v('cp-dur')}, ${v('cp-loc').toLowerCase()}, ${v('cp-pain')||'?'}/10, ${v('cp-onset').toLowerCase()}.${assoc.length?' '+assoc.join(', '):''}${hx.length?' PMHx: '+hx.join(', '):''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':''} ECG: ${v('cp-ecg')}\n\nA: ${v('cp-dx')}\n\nP:\n${bul(plan)}\n• F/u ${v('cp-fu')}.`;
},

cold() {
  const sx=picks([['cold-cough','cough'],['cold-throat','sore throat'],['cold-runny','runny nose'],['cold-fatigue','fatigue'],['cold-congestion','congestion'],['cold-fever','fever'],['cold-sob','SOB'],['cold-myalgia','myalgia']]);
  const abnExam=picks([['cold-nasal-congest','Nasal congestion'],['cold-pharynx','Pharyngeal erythema'],['cold-exudate','Tonsillar exudate'],['cold-lymph','Lymphadenopathy'],['cold-lungs-abn','Lungs abnormal']]);
  const plan=picks([['cold-reassure','Reassured — viral'],['cold-rest','Rest + fluids'],['cold-apap','Acetaminophen/ibuprofen PRN'],['cold-no-abx','No antibiotics'],['cold-swab','Swab ordered'],['cold-return','Return if >10d, worse, or fever >38.5°C']]);
  const oVits=vits([[v('cold-temp'),'T'],[v('cold-spo2'),'SpO₂'],[v('cold-hr'),'HR']]);
  return `S: ${sx.length?sx.join(', '):'URI sx'} × ${v('cold-dur')}. ${v('cold-self')}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':' Lungs clear, no lymphadenopathy, no exudate.'}\n\nA: ${v('cold-dx')}\n\nP:\n${bul(plan)}`;
},

uti() {
  const usx=picks([['uti-dysuria','dysuria'],['uti-frequency','frequency'],['uti-urgency','urgency'],['uti-hematuria','hematuria'],['uti-cloudy','cloudy urine'],['uti-suprapubic','suprapubic pain']]);
  const upsx=picks([['uti-fever','fever/chills'],['uti-flank','flank pain'],['uti-nausea','nausea'],['uti-rigors','rigors']]);
  const abnExam=picks([['uti-suprapubic-tender','Suprapubic tenderness'],['uti-cva-tender','CVA tenderness'],['uti-vaginitis','Vaginitis on exam']]);
  const plan=picks([['uti-abxed','Abx course explained'],['uti-hydration','Increased fluids'],['uti-analgesia','Analgesic PRN'],['uti-culture','Urine C&S sent'],['uti-return','Return if no improvement 48–72h'],['uti-prevention','Prevention advice'],['uti-refer','Urology/gynaecology referral']]);
  const abx=v('uti-abx');const abxdose=v('uti-abxdose');
  const oVits=vits([[v('uti-temp'),'T'],[v('uti-bp'),'BP'],[v('uti-hr'),'HR']]);
  return `S: ${v('uti-sex')} — ${usx.length?usx.join(', '):'urinary sx'} × ${v('uti-duration')}.${upsx.length?' Systemic: '+upsx.join(', '):''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':''} UA: ${v('uti-ua')}\n\nA: ${v('uti-dx')}\n\nP:\n${abx?'• '+abx+(abxdose?' '+abxdose:'')+' prescribed.\n':''}${bul(plan)}\n• F/u ${v('uti-fu')}.`;
},

child() {
  const st=picks([['ch-eating','eating well'],['ch-sleeping','sleeping well'],['ch-active','active'],['ch-milestones','milestones met']]);
  const age=v('ch-age');
  const abnSys=picks([['ch-general-abn','distress/unwell'],['ch-heent-abn','HEENT abnormal'],['ch-neck-abn','Lymphadenopathy/neck stiffness'],['ch-cardiac-abn','Murmur/irregular rhythm'],['ch-resp-abn','Abnormal breath sounds'],['ch-abd-abn','Abd: tender/organomegaly'],['ch-skin-abn','Rash/lesion'],['ch-msk-abn','Abnormal tone/gait'],['ch-neuro-abn','Developmental concern']]);
  const plan=picks([['ch-diet','Healthy diet/activity'],['ch-safety','Anticipatory guidance'],['ch-nutrition','Nutrition counselling'],['ch-screen','Screen time guidance'],['ch-referral','Referral placed']]);
  const wt=v('ch-wt');const wtpct=v('ch-wt-pct');const ht=v('ch-ht');const htpct=v('ch-ht-pct');
  const growthLine=[wt?'Wt '+wt+' lbs'+(wtpct?' ('+wtpct+' %ile)':''):'',ht?'Ht '+ht+(htpct?' ('+htpct+' %ile)':''):''].filter(Boolean).join(', ');
  return `S: ${age?age+', ':''}${v('ch-type')}.${st.length?' Child is '+st.join(', ')+'.':''} ${v('ch-illness')} ${v('ch-imm')}\n\nO: ${growthLine||'Growth reviewed'}.${abnSys.length?' Abnormal: '+abnSys.join(', ')+'.':' Exam unremarkable.'}\n\nA: ${v('ch-dx')}\n\nP:\n${bul(plan)}\n• Immunizations updated.\n• F/u ${v('ch-fu')}.`;
},

ocp() {
  const contra=picks([['ocp-smoke','smoker ≥35y'],['ocp-aura','migraine w/ aura'],['ocp-dvt','DVT/PE hx'],['ocp-liver','liver disease'],['ocp-htn','uncontrolled HTN'],['ocp-pregnant','pregnant'],['ocp-bf','breastfeeding'],['ocp-cvd','CVD']]);
  const counsel=picks([['ocp-options','Options discussed'],['ocp-howto','Use and timing explained'],['ocp-missed','Missed pill instructions'],['ocp-se','Side effects reviewed'],['ocp-sti','STI prevention — condoms advised'],['ocp-bp-check','BP monitoring while on OCP'],['ocp-interact','Drug interactions reviewed'],['ocp-fertility','Return to fertility discussed']]);
  const rx=v('ocp-rx');const oVits=vits([[v('ocp-bp'),'BP'],[v('ocp-bmi'),'BMI']]);
  return `S: OCP counselling.${contra.length?' ⚠ Contraindications: '+contra.join(', '):''} ${oVits||'Vitals stable'}.\n\nA: ${v('ocp-suit')}.\n\nP:\n${rx?'• '+rx+'.\n':''}${bul(counsel)}\n• F/u ${v('ocp-fu')}.`;
},

handpain() {
  const sx=picks([['hp-swelling','swelling'],['hp-stiffness','morning stiffness'],['hp-numbness','numbness/tingling'],['hp-weakness','grip weakness'],['hp-nightsymptoms','night sx'],['hp-locking','locking/triggering']]);
  const hx=picks([['hp-oa','OA'],['hp-ra','RA'],['hp-trauma','trauma'],['hp-repetitive','repetitive use'],['hp-diabetes','DM'],['hp-thyroid','thyroid hx']]);
  const exam=picks([['hp-swelling-exam','Swelling'],['hp-tenderness','Tenderness'],['hp-reduced-rom','↓ ROM'],['hp-grip-weak','↓ Grip'],['hp-deformity','Deformity']]);
  const plan=picks([['hp-analgesia','Analgesia PRN'],['hp-splint','Splint'],['hp-physio','Hand physio/OT referral'],['hp-injection','CSI arranged'],['hp-imaging-plan','Imaging ordered'],['hp-rheum','Rheumatology referral'],['hp-ortho','Orthopedic referral'],['hp-nerve','NCS ordered']]);
  return `S: ${v('hp-dominant').replace(' affected','')} — ${v('hp-char')}, ${v('hp-duration')}, ${v('hp-onset').toLowerCase()}. ${v('hp-loc')}, ${v('hp-pain')||'?'}/10.${sx.length?' '+sx.join(', '):''}.${hx.length?' PMHx: '+hx.join(', '):''}\n\nO:${exam.length?' '+exam.join(', '):' No significant findings.'}\nTests: ${v('hp-tests')}\nImaging: ${v('hp-xray')}\n\nA: ${v('hp-dx')}\n\nP:\n${bul(plan)}\n• F/u ${v('hp-fu')}.`;
},

kneepain() {
  const sx=picks([['kp-swelling','effusion'],['kp-stiffness','morning stiffness'],['kp-locking','locking'],['kp-giving-way','giving way'],['kp-crepitus','crepitus'],['kp-night','night pain']]);
  const hx=picks([['kp-oa','OA'],['kp-ra','RA'],['kp-trauma','trauma'],['kp-overweight','obesity'],['kp-prev-injury','prior knee injury/surgery'],['kp-sport','high-impact sport']]);
  const exam=picks([['kp-effusion','Effusion'],['kp-tender','Joint line tenderness'],['kp-reduced-rom','↓ ROM'],['kp-instability','Ligamentous instability'],['kp-neuro-deficit','Neurovascular deficit']]);
  const plan=picks([['kp-analgesia','Analgesia PRN'],['kp-ice','Ice/elevation'],['kp-physio','Physio referral'],['kp-weightloss','Weight loss'],['kp-brace','Brace'],['kp-injection','CSI/HA injection'],['kp-imaging-plan','Imaging ordered'],['kp-ortho','Orthopedic referral'],['kp-activity-mod','Activity modification']]);
  return `S: ${v('kp-side')} pain × ${v('kp-duration')}, ${v('kp-onset').toLowerCase()}. ${v('kp-loc')}, ${v('kp-char')}, ${v('kp-pain')||'?'}/10.${sx.length?' '+sx.join(', '):''}.${hx.length?' PMHx: '+hx.join(', '):''}\n\nO:${exam.length?' '+exam.join(', '):' No significant findings.'}\nTests: ${v('kp-tests')}\nImaging: ${v('kp-xray')}\n\nA: ${v('kp-dx')}\n\nP:\n${bul(plan)}\n• F/u ${v('kp-fu')}.`;
},

ihd() {
  const meds=v('ihd-meds');
  const sx=picks([['ihd-angina','angina'],['ihd-sob','exertional SOB'],['ihd-sob-rest','SOB at rest'],['ihd-palpitations','palpitations'],['ihd-syncope','syncope'],['ihd-edema','oedema'],['ihd-fatigue','fatigue'],['ihd-orthopnoea','orthopnoea']]);
  const rf=picks([['ihd-smoking','smoking'],['ihd-dm','DM (suboptimal)'],['ihd-htn-uctrl','HTN (suboptimal)'],['ihd-dyslip','dyslipidaemia'],['ihd-overweight','obesity'],['ihd-inactive','sedentary']]);
  const abnExam=picks([['ihd-acute-distress','Acute distress'],['ihd-murmur','Murmur'],['ihd-lungs-abn','Lungs abnormal'],['ihd-edema-exam','Oedema'],['ihd-raised-jvp','↑ JVP']]);
  const plan=picks([['ihd-contmeds','Continue cardiac meds'],['ihd-aspirin','Antiplatelet continued'],['ihd-statin','Statin continued'],['ihd-bblocker','BB reviewed'],['ihd-acei','ACEi/ARB reviewed'],['ihd-lipids','Lipids if due'],['ihd-ecg','ECG reviewed'],['ihd-exercise','Cardiac rehab/exercise'],['ihd-smoking-cessation','Smoking cessation'],['ihd-diet','Heart-healthy diet'],['ihd-cardio-ref','Cardiology referral'],['ihd-stress','Stress test ordered']]);
  const ldl=v('ihd-ldl');const oVits=vits([[v('ihd-bp'),'BP'],[v('ihd-hr'),'HR'],[v('ihd-wt'),'wt']]);
  return `S: F/u IHD.${meds?' Meds: '+meds+'.':''} ${v('ihd-adherence')}${sx.length?' Sx: '+sx.join(', '):' Asymptomatic.'} GTN: ${v('ihd-gtn')}${rf.length?' Risk factors: '+rf.join(', '):''}\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':' No acute distress. CV normal. Lungs clear.'} ${ldl?ldl+'.':''} ${v('ihd-invx')}\n\nA: ${v('ihd-status')}. ${v('ihd-riskctrl')}\n\nP:\n${bul(plan)}\n• F/u ${v('ihd-fu')}.`;
},

hf() {
  const meds=v('hf-meds');
  const sx=picks([['hf-sob-exert','exertional SOB'],['hf-sob-rest','SOB at rest'],['hf-orthopnoea','orthopnoea'],['hf-pnd','PND'],['hf-edema','oedema'],['hf-fatigue','fatigue'],['hf-palpitations','palpitations'],['hf-syncope','syncope']]);
  const abnExam=picks([['hf-acute-distress','Acute distress'],['hf-murmur','Murmur/abnormal rhythm'],['hf-crackles','Crackles'],['hf-edema-exam','Oedema'],['hf-raised-jvp','↑ JVP']]);
  const plan=picks([['hf-contmeds','Continue HF meds'],['hf-diuretic','Diuretic reviewed'],['hf-acei-arb','ACEi/ARB/ARNI reviewed'],['hf-bblocker','BB reviewed'],['hf-mra','MRA reviewed'],['hf-sglt2','SGLT2i reviewed'],['hf-electrolytes','Renal/electrolytes monitored'],['hf-bnp','BNP ordered'],['hf-echo','Echo reviewed'],['hf-fluid-ed','Fluid/salt restriction reinforced'],['hf-weight-ed','Daily weights reinforced'],['hf-rehab','Cardiac rehab'],['hf-cardio','Cardiology referral'],['hf-er-warn','ER: acute SOB/wt gain >2kg/3d']]);
  const ef=v('hf-ef');const oVits=vits([[v('hf-bp'),'BP'],[v('hf-hr'),'HR'],[v('hf-wt'),'wt'],[v('hf-spo2'),'SpO₂']]);
  const hfType=v('hf-type').charAt(0).toLowerCase()+v('hf-type').slice(1).replace(/\.$/,'');
  return `S: F/u ${hfType}.${meds?' Meds: '+meds+'.':''} ${v('hf-adherence')}${sx.length?' Sx: '+sx.join(', '):' Compensated, no decompensation sx.'} ${v('hf-nyha')}.\n\nO: ${oVits||'Vitals stable'}.${abnExam.length?' '+abnExam.join(', ')+'.':' Chest clear, no oedema.'}${ef?' '+ef:''}\n\nA: ${v('hf-status')}. ${v('hf-volume')}\n\nP:\n${bul(plan)}\n• F/u ${v('hf-fu')}.`;
},

labs() {
  const sx=picks([['lab-fatigue','fatigue'],['lab-sob','SOB'],['lab-palpitations','palpitations'],['lab-dizzy','dizziness'],['lab-weightchange','weight change'],['lab-polyuria','polyuria/polydipsia'],['lab-pain','chest/abd pain'],['lab-bleeding','unusual bleeding']]);
  const flags=picks([['lab-flag-high','↑ above range'],['lab-flag-low','↓ below range'],['lab-flag-critical','critical value'],['lab-flag-trend','worsening trend'],['lab-flag-new','new abnormality'],['lab-flag-stable','stable/unchanged']]);
  const actions=picks([['lab-action-discussed','Results discussed'],['lab-action-nodx','No change — reassuring'],['lab-action-repeat','Repeat labs ordered'],['lab-action-medsadj','Medication adjusted'],['lab-action-newrx','New medication started'],['lab-action-referral','Referral placed'],['lab-action-imaging','Imaging ordered'],['lab-action-diet','Dietary/lifestyle advice'],['lab-action-urgent','Urgent follow-up arranged']]);
  const labPairs=[['Hgb',v('lab-hgb')],['WBC',v('lab-wbc')],['Plt',v('lab-plt')],['Na',v('lab-na')],['K',v('lab-k')],['Cr',v('lab-creat')],['eGFR',v('lab-egfr')],['Gluc',v('lab-gluc')],['A1C',v('lab-a1c')+'%'],['TSH',v('lab-tsh')],['T4',v('lab-t4')],['LDL',v('lab-ldl')],['Chol',v('lab-tchol')],['HDL',v('lab-hdl')],['TG',v('lab-trig')],['ALT',v('lab-alt')],['AST',v('lab-ast')],['ALP',v('lab-alp')],['Bili',v('lab-bili')],['INR',v('lab-inr')],['B12',v('lab-b12')],['Ferritin',v('lab-ferritin')]];
  const labResults=labPairs.filter(([,val])=>val&&val!='%').map(([k,val])=>k+' '+val).join(', ')+(v('lab-other')?', '+v('lab-other'):'');
  return `S: ${v('lab-reason')} ${v('lab-aware')}${sx.length?' Sx: '+sx.join(', ')+'.':''}\n\nO: ${labResults||'Results as per chart'}.${flags.length?' Flags: '+flags.join(', '):''}\n\nA: ${v('lab-interp')} ${v('lab-sig')}\n\nP:\n${bul(actions)}\n• Next labs: ${v('lab-nextlabs')}\n• ${v('lab-fu')}`;
},

medrx() {
  const concerns=picks([['mr-adherence-concern','difficulty with medications'],['mr-cost','cost concerns'],['mr-se-concern','side effects'],['mr-effectiveness','effectiveness concerns'],['mr-complexity','complex regimen'],['mr-newmeds','new medication recently started'],['mr-otc','OTC/herbal use'],['mr-stopped','stopped medication without advice']]);
  const findings=picks([['mr-interaction','Drug interaction identified'],['mr-duplication','Therapeutic duplication'],['mr-underdose','Possible underdosing'],['mr-overdose','Possible overdosing/toxicity'],['mr-inappropriate','Potentially inappropriate medication'],['mr-missing','Missing medication for known indication'],['mr-monitoring','Monitoring not up to date'],['mr-deprescribe','Candidate for deprescribing']]);
  const actions=picks([['mr-no-change','No changes — regimen appropriate'],['mr-stopped-med','Medication stopped'],['mr-dose-change','Dose adjusted'],['mr-new-med','New medication started'],['mr-switched','Medication switched'],['mr-counselled','Patient counselled on all medications'],['mr-adherence-plan','Adherence strategy discussed'],['mr-pharmacist','Pharmacist referral / MedsCheck'],['mr-labs','Labs ordered for monitoring'],['mr-reconciled','Medication list reconciled and updated']]);
  const oVits=vits([[v('mr-bp'),'BP'],[v('mr-hr'),'HR'],[v('mr-wt'),'wt'],[v('mr-egfr'),'eGFR']]);
  return `S: ${v('mr-reason')} ${v('mr-count')} medications. ${v('mr-adherence')}${concerns.length?' Concerns: '+concerns.join(', ')+'.':''}\n\nO: ${oVits||'Vitals as per chart'}.${findings.length?'\nFindings: '+findings.join(', '):''}\n\nA: ${v('mr-safety')}\n\nP:\n${bul(actions)}\n• F/u: ${v('mr-fu')}`;
}

}; // end C

// Override generate: pick correct generator set
function generate(type) {
  const gen = compactMode ? C[type] : G[type];
  if (typeof gen === 'function') showOut(type, gen.call(C));
  else console.warn('No generator for:', type, '(mode:', compactMode ? 'compact' : 'full', ')');
}
