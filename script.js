document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-CA',{weekday:'short',year:'numeric',month:'short',day:'numeric'});

function show(type, btn) {
  document.querySelectorAll('.form-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.soap-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('empty-state').style.display='none';
  document.getElementById('panel-'+type).classList.add('active');
  btn.classList.add('active');
  document.getElementById('main-area').scrollTop=0;
}

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
  const done=()=>{btn.textContent='Copied!';btn.classList.add('copied');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},2000);};
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
  const appear=picks([['dep-groomed','well-groomed'],['dep-coop','cooperative']]);
  const plan=picks([['dep-monitor','Monitor for side effects and mood changes'],['dep-sleephyg','Encourage sleep hygiene and routine'],['dep-activity','Physical activity encouraged'],['dep-crisis','Crisis contact information provided'],['dep-referral','Referral to mental health / counselling placed'],['dep-therapy','CBT / therapy discussed']]);
  const speech=chk('dep-speech');const thought=chk('dep-thought');
  return `S:\nPatient presents for follow-up of depression. Mood reported as ${v('dep-mood')} since initiating ${med}. ${v('dep-si')} ${sx.length?'Ongoing symptoms include: '+sx.join(', ')+'. ':'No significant ongoing symptoms reported. '}Sleep is ${v('dep-sleep')}. Appetite is ${v('dep-appetite')}. ${v('dep-se')}\n\nO:\nMood: ${v('dep-omood')}. Affect: ${v('dep-affect')}.${appear.length?' Appearance: '+appear.join(', ')+'.':''} ${speech?'Speech: normal rate and tone.':''} ${thought?'Thought process: logical, goal-directed.':''} ${v('dep-psych')}\n\nA:\n• Major Depressive Disorder — ${v('dep-status')}.\n• Safety: ${v('dep-safety')}\n\nP:\n• ${v('dep-rx')} (${med}).\n${bul(plan)}\n• Follow up in ${v('dep-fu')}.`;
},

t2dm(){
  const drug=v('dm-drug')||'current diabetes medication';
  const med=v('dm-dose')?drug+' '+v('dm-dose'):drug;
  const sx=picks([['dm-hypo','hypoglycemia'],['dm-hyper','hyperglycemia'],['dm-polyuria','polyuria'],['dm-polydipsia','polydipsia'],['dm-fatigue','fatigue'],['dm-se','medication side effects']]);
  const plan=picks([['dm-refill','Refill '+med],['dm-continue','Continue current diabetes management'],['dm-diet','Encourage diet/exercise adherence'],['dm-labs','Plan A1C and labs if due'],['dm-footcheck','Foot exam completed / referred'],['dm-eye','Eye exam referral provided'],['dm-bp-plan','BP management reviewed']]);
  const a1c=v('dm-a1c');const a1cd=v('dm-a1cdate');
  const vits=[v('dm-bp')?'BP: '+v('dm-bp'):'',v('dm-hr')?'HR: '+v('dm-hr')+' bpm':'',v('dm-wt')?'Weight: '+v('dm-wt')+' lbs':''].filter(Boolean).join(', ');
  return `S:\nPatient presents for Type 2 Diabetes Mellitus (T2DM) medication refill. Reports ${v('dm-adherence')} with ${med}. ${sx.length?'Symptoms reported: '+sx.join(', ')+'. ':'No recent episodes of hypoglycemia or hyperglycemia. Denies polyuria, polydipsia, or fatigue. No medication side effects. '}\n\nO:\nLast A1C: ${a1c?a1c+'%':'[pending]'}${a1cd?' ('+a1cd+')':''}. ${vits?vits+'.':''} ${v('dm-exam')}\n\nA:\n• T2DM — ${v('dm-status')}. ${v('dm-hypoglycemia')} ${v('dm-tol')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('dm-fu')}.`;
},

htn(){
  const med1=v('htn-med1');const med2=v('htn-med2');
  const meds=[med1,med2].filter(Boolean).join(' and ')||'current antihypertensive medications';
  const sx=picks([['htn-cp','chest pain'],['htn-sob','shortness of breath'],['htn-ha','headache'],['htn-dizzy','dizziness'],['htn-se','medication side effects'],['htn-er','recent ER/urgent care visit']]);
  const exam=picks([['htn-nad','General: no acute distress'],['htn-rrr','CV: regular rate and rhythm, no murmur'],['htn-lungs','Lungs: clear to auscultation'],['htn-noedema','No edema']]);
  const plan=picks([['htn-refill','Refill '+meds],['htn-lifestyle','Continue lifestyle modifications'],['htn-homebpplan','Recommend home BP monitoring'],['htn-cmp','CMP if not done within last year'],['htn-echo','Echo / cardiology referral placed'],['htn-sodium','Low-sodium diet counselled']]);
  const homebp=v('htn-homebp');
  return `S:\nPatient presents for routine hypertension medication refill. Denies ${sx.length?sx.join(', '):'chest pain, shortness of breath, headache, dizziness, or side effects'}. Reports ${v('htn-adherence')}.${homebp?' Home BP average ~'+homebp+'.':''} No recent ER or urgent care visits.\n\nO:\nBP: ${v('htn-bp')||'[not recorded]'}, HR: ${v('htn-hr')||'[not recorded]'}.\n${exam.length?exam.join('. ')+'.':''}\n\nA:\nHypertension — ${v('htn-control')}. ${v('htn-concerns')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('htn-fu')}.`;
},

inr(){
  const flags=picks([['inr-bleeding','unusual bleeding or bruising'],['inr-hematuria','hematuria'],['inr-stools','black or tarry stools'],['inr-missed','missed warfarin doses'],['inr-extra','extra/double doses taken'],['inr-newmeds','new medications started'],['inr-diet','significant dietary changes'],['inr-newsymptoms','new symptoms']]);
  const signs=picks([['inr-no-bruise','No bruising or petechiae'],['inr-no-bleed','No signs of active bleeding'],['inr-no-edema','No edema']]);
  const edu=picks([['inr-edu-diet','Reinforced consistent diet and medication adherence'],['inr-edu-bleed','Educated on signs of bleeding and when to seek medical attention'],['inr-edu-adhere','Medication adherence reinforced'],['inr-edu-interact','Drug interaction counselling provided']]);
  const nd=v('inr-newdose');const dn=v('inr-diet-notes');const mc=v('inr-med-changes');
  const inrStatus=v('inr-status');
  const inrStable=inrStatus==='within target range';
  return `S:\nPatient presents for routine INR monitoring. ${flags.length?'Reports: '+flags.join(', ')+'. ':'No bleeding, bruising, hematuria, or black stools reported. No missed or extra warfarin doses. '}${dn?'Dietary notes: '+dn+'. ':'No recent dietary changes. '}${mc?'Recent medication changes: '+mc+'.':'No recent medication changes.'}\n\nO:\nVitals stable. ${signs.length?signs.join('. ')+'.':''}\nINR today: ${v('inr-value')||'[value]'}. Target range: ${v('inr-target')||'2.0\u20133.0'}. Current warfarin dose: ${v('inr-dose')||'[dose]'}.${v('inr-bp')?' BP: '+v('inr-bp')+'.':''}\n\nA:\n• ${inrStable?'Stable anticoagulation management on warfarin.':'Anticoagulation on warfarin — requires dose adjustment.'}\n• INR ${inrStatus}.\n\nP:\n• ${v('inr-action')}${nd?': '+nd:''}.\n• Recheck INR in ${v('inr-recheck')}.\n${bul(edu)}`;
},

backpain(){
  const rf=picks([['bp-radiation','radiation to lower limb(s)'],['bp-numbness','numbness/tingling'],['bp-weakness','limb weakness'],['bp-bowel','bowel/bladder changes'],['bp-fever','fever or unexplained weight loss']]);
  const exam=picks([['bp-stable','Vitals stable'],['bp-tender','Mild discomfort with movement; lumbar paraspinal tenderness'],['bp-nomidline','No midline tenderness'],['bp-limitedflex','Limited flexion due to pain'],['bp-normalneuro','Normal strength, sensation, and reflexes in lower limbs'],['bp-slrneg','Negative straight leg raise']]);
  const onset=v('bp-onset');
  const onsetStr=onset.startsWith('gradual')?'Gradual onset, no clear trigger.':'Onset '+onset+'.';
  const plan=picks([['bp-reassure','Reassure and educate'],['bp-activity','Continue gentle activity; avoid prolonged rest'],['bp-ibu','Ibuprofen 400 mg PO q6\u20138h PRN with food'],['bp-heat','Apply heat to affected area'],['bp-stretch','Stretching exercises recommended'],['bp-physio','Physiotherapy referral placed'],['bp-imaging','Imaging ordered (X-ray / MRI)'],['bp-neurowarn','Advised to return immediately if new neurological symptoms develop']]);
  return `S:\nLow back pain for ${v('bp-duration')}. ${onsetStr} ${v('bp-char')}, ${v('bp-pain-rest')||'?'}/10 at rest, ${v('bp-pain-move')||'?'}/10 with movement. ${rf.length?'Red flag symptoms present: '+rf.join(', ')+' \u2014 further evaluation warranted.':'No radiation, numbness, weakness, or bowel/bladder changes.'} Worse with movement, improved with ${v('bp-relief')}. ${v('bp-hx')}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\n\nA:\nDiagnosis: ${v('bp-dx')}\nDDx: disc herniation, spinal stenosis, vertebral fracture (less likely).\n\nP:\n${bul(plan)}\n• Follow up in ${v('bp-fu')}.`;
},

headache(){
  const assoc=picks([['ha-nausea','nausea'],['ha-vomit','vomiting'],['ha-visual','visual changes'],['ha-photo','photophobia'],['ha-phono','phonophobia'],['ha-weakness','weakness/neurological changes']]);
  const exam=picks([['ha-stable','Vitals stable'],['ha-oriented','Patient alert and oriented'],['ha-noneuro','No focal neurological deficits'],['ha-cn','Cranial nerves II\u2013XII intact'],['ha-fundoscopy','Normal fundoscopic exam'],['ha-neck','Neck supple, no meningismus'],['ha-nosinus','No sinus tenderness or temporal artery tenderness']]);
  const plan=picks([['ha-reassure','Reassure patient; discuss stress management and adequate sleep'],['ha-sleep','Adequate sleep advised'],['ha-apap','Acetaminophen 500 mg PO q6h PRN'],['ha-ibu','Ibuprofen 400 mg PO q6\u20138h PRN'],['ha-hydration','Encourage hydration and regular meals'],['ha-caffeine','Avoid excessive caffeine and screen time'],['ha-triptan','Triptan prescribed'],['ha-neuro','Neurology referral placed']]);
  return `S:\nHeadache for ${v('ha-dur')} with ${v('ha-onset')}. Located ${v('ha-loc')}, ${v('ha-char')}, ${v('ha-pain')||'?'}/10 in intensity. ${assoc.length?'Associated symptoms: '+assoc.join(', ')+'. ':'No nausea, vomiting, visual changes, weakness, photophobia, or phonophobia. '}Worsened by ${v('ha-aggr')}; relieved by ${v('ha-relief')}. ${v('ha-hx')}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\n\nA:\nDiagnosis: ${v('ha-dx')}\nDDx: migraine, sinus headache, secondary causes (e.g. hypertension, infection \u2014 less likely).\n\nP:\n${bul(plan)}\n• Follow up ${v('ha-fu')}.`;
},

chestpain(){
  const assoc=picks([['cp-radiation','radiation to arm or jaw'],['cp-sob','shortness of breath'],['cp-nausea','nausea'],['cp-diaphoresis','diaphoresis'],['cp-palp','palpitations'],['cp-syncope','syncope/pre-syncope']]);
  const hx=picks([['cp-htn','hypertension'],['cp-cardiac','known cardiac history'],['cp-smoker','smoker'],['cp-dm','diabetes'],['cp-trauma','recent trauma or cough']]);
  const exam=picks([['cp-milddiscomfort','Mild discomfort, alert, no acute distress'],['cp-rrr','Cardiac: regular rate and rhythm, no murmurs'],['cp-clearlungs','Respiratory: clear bilaterally, no wheeze or crackles'],['cp-abdsoft','Abdomen: soft, non-tender'],['cp-nocwtender','No chest wall tenderness']]);
  const plan=picks([['cp-ecgord','Order ECG and troponin to rule out cardiac etiology'],['cp-troponin','Troponin ordered'],['cp-reassure','Reassure and observe; advise to avoid exertion until ruled out'],['cp-noexert','Avoid exertion until cardiac cause excluded'],['cp-nsaid','If cardiac cause excluded: NSAID for pain, rest, and stress reduction'],['cp-erwarn','Educate on warning signs: worsening pain, radiation, diaphoresis, or syncope \u2192 go to ER'],['cp-cardio','Cardiology referral placed'],['cp-stress','Stress test ordered']]);
  return `S:\n${v('cp-loc')}, ${v('cp-pain')||'?'}/10 intensity, for ${v('cp-dur')}, ${v('cp-onset').toLowerCase()} ${assoc.length?'Associated symptoms: '+assoc.join(', ')+'. ':'No radiation to arm or jaw, shortness of breath, nausea, diaphoresis, palpitations, or syncope. '}Past medical history: ${hx.length?hx.join(', '):'no significant cardiac history; non-smoker'}.\n\nO:\nVitals: BP ${v('cp-bp')||'[not recorded]'}, HR ${v('cp-hr')||'[not recorded]'}, RR ${v('cp-rr')||'[not recorded]'}, Temp ${v('cp-temp')||'[not recorded]'}\u00b0C, SpO\u2082 ${v('cp-spo2')||'[not recorded]'}.\n${exam.length?exam.join('. ')+'.':''}\nECG: ${v('cp-ecg')}\n\nA:\nDiagnosis: ${v('cp-dx')}\nDDx: stable angina, GERD, costochondritis, anxiety, ACS (rule out).\n\nP:\n${bul(plan)}\n• Follow up in ${v('cp-fu')}.`;
},

cold(){
  const sx=picks([['cold-cough','cough'],['cold-throat','sore throat'],['cold-runny','runny nose'],['cold-fatigue','mild fatigue'],['cold-congestion','nasal congestion'],['cold-fever','fever'],['cold-sob','shortness of breath'],['cold-cp','chest pain'],['cold-myalgia','myalgia']]);
  const exam=picks([['cold-nasal-congest','Mild nasal congestion'],['cold-pharynx','pharyngeal erythema'],['cold-no-exudate','no tonsillar exudate'],['cold-no-lymph','no lymphadenopathy'],['cold-clear-lungs','Lungs clear to auscultation']]);
  const plan=picks([['cold-reassure','Reassure; likely viral and self-limiting'],['cold-rest','Rest, fluids, warm saltwater gargles, saline nasal spray'],['cold-gargle','Warm saltwater gargles'],['cold-saline','Saline nasal spray'],['cold-apap','Acetaminophen or ibuprofen PRN for fever or discomfort'],['cold-no-abx','Avoid antibiotics'],['cold-swab','Throat swab / COVID test ordered'],['cold-return','Return if symptoms persist beyond 10 days, worsen, or fever >38.5\u00b0C develops']]);
  const vits=[v('cold-bp')?'BP '+v('cold-bp'):'',v('cold-hr')?'HR '+v('cold-hr'):'',v('cold-temp')?'Temp '+v('cold-temp')+'\u00b0C':'',v('cold-rr')?'RR '+v('cold-rr'):'',v('cold-spo2')?'SpO\u2082 '+v('cold-spo2'):''].filter(Boolean).join(', ');
  const s=sx.length?sx.join(', '):'upper respiratory symptoms';
  return `S:\nPatient presents with ${s} for ${v('cold-dur')}. Self-treatment tried: ${v('cold-self')} Past medical history: ${v('cold-pmh')}\n\nO:\nVitals stable: ${vits||'within normal limits'}.\n${exam.length?exam.join('. ')+'.':''}\n\nA:\nDiagnosis: ${v('cold-dx')}\nDDx: influenza, allergic rhinitis, COVID-19 (less likely).\n\nP:\n${bul(plan)}`;
},

child(){
  const st=picks([['ch-eating','eating well'],['ch-sleeping','sleeping well'],['ch-active','active and playful'],['ch-milestones','meeting developmental milestones appropriate for age']]);
  const sys=picks([['ch-general','General: alert, well-nourished, no distress'],['ch-heent','HEENT: normal vision and hearing, clear TMs, no nasal congestion, throat clear'],['ch-neck','Neck: supple, no lymphadenopathy'],['ch-cardiac','Cardiac: regular rate and rhythm, no murmurs'],['ch-resp','Respiratory: clear breath sounds bilaterally'],['ch-abd','Abdomen: soft, non-tender, no organomegaly'],['ch-skin','Skin: no rash or lesions'],['ch-msk','Musculoskeletal: normal tone and gait'],['ch-neuro','Neuro: alert, active, appropriate interaction']]);
  const plan=picks([['ch-diet','Continue healthy diet, regular physical activity, and adequate sleep'],['ch-sleep-plan','Maintain routine and adequate sleep'],['ch-dental','Maintain routine dental and vision care'],['ch-safety','Anticipatory guidance given on safety, nutrition, and screen time'],['ch-nutrition','Nutrition counselling provided'],['ch-screen','Screen time guidance provided'],['ch-referral','Referral placed \u2014 see notes']]);
  const age=v('ch-age');
  return `S:\n${age?'Child ('+age+')':'Child'} brought in by parent for ${v('ch-type')}. ${v('ch-concerns')} ${st.length?'Child is '+st.join(', ')+'. ':''}${v('ch-illness')} ${v('ch-imm')}\n\nO:\nVitals: within normal limits for age.\n${sys.length?sys.join('.\n')+'.':''}\n\nA:\nAssessment: ${v('ch-dx')}\n\nP:\n${bul(plan)}\n• Immunizations reviewed and updated as needed.\n• Follow up ${v('ch-fu')}.`;
},

ocp(){
  const contra=picks([['ocp-smoke','smoker \u226535 years'],['ocp-aura','migraines with aura'],['ocp-dvt','history of DVT/PE'],['ocp-liver','liver disease'],['ocp-htn','uncontrolled hypertension'],['ocp-pregnant','currently pregnant'],['ocp-bf','currently breastfeeding'],['ocp-cvd','cardiovascular disease']]);
  const counsel=picks([['ocp-options','Discussed options: combined vs. progestin-only pills, benefits, and risks'],['ocp-howto','Explained correct use, missed pill instructions, and potential side effects'],['ocp-missed','Missed pill instructions reviewed'],['ocp-se','Potential side effects discussed (e.g. nausea, breast tenderness, spotting)'],['ocp-sti','Advised on STI prevention \u2014 OCP does not protect against infections; recommend condom use'],['ocp-bp-check','Check BP regularly while on OCP'],['ocp-interact','Drug interaction counselling provided'],['ocp-fertility','Return to fertility discussed']]);
  const rx=v('ocp-rx');
  return `S:\nPatient presents requesting information and advice about oral contraceptive pills. ${contra.length?'Contraindications identified on screening: '+contra.join(', ')+'. ':'No history of smoking, migraines with aura, thromboembolic disease, or liver problems. '}Patient reports ${v('ocp-periods').replace(/\.$/, '').toLowerCase()}. Medications / allergies: ${v('ocp-meds')} Patient is not currently pregnant or breastfeeding.\n\nO:\nVitals stable. BP: ${v('ocp-bp')||'[not recorded]'}. BMI: ${v('ocp-bmi')||'[not recorded]'}. Exam: ${v('ocp-exam')}\n\nA:\n• ${v('ocp-suit')}\n\nP:\n${rx?'• '+rx+'.\n':''}${bul(counsel)}\n• Follow up in ${v('ocp-fu')}.`;
}

};

function generate(type){showOut(type,G[type]());}

// ── NEW GENERATORS ──────────────────────────────────────────

G['dep-initial']=function(){
  const drug=v('di-drug'); const dose=v('di-dose'); const med=drug?(dose?drug+' '+dose:drug):null;
  const sx=picks([['di-low-mood','persistent low mood'],['di-anhedonia','anhedonia (loss of interest/pleasure)'],['di-fatigue','fatigue/low energy'],['di-concentration','poor concentration'],['di-worthless','feelings of worthlessness/guilt'],['di-sleep','sleep disturbance'],['di-appetite','appetite/weight change'],['di-psychomotor','psychomotor changes']]);
  const appear=picks([['di-groomed','appropriately groomed'],['di-coop','cooperative']]);
  const speech=chk('di-normal-speech'); const thought=chk('di-goal-directed');
  const plan=picks([['di-edu','Psychoeducation on depression provided'],['di-lifestyle','Lifestyle advice: sleep hygiene, physical activity, routine'],['di-monitor','Monitor for side effects and response in 2\u20134 weeks'],['di-crisis','Crisis contact information provided'],['di-referral','Referral to mental health / counselling placed'],['di-safety-plan','Safety plan documented'],['di-phq9-repeat','PHQ-9 to be repeated at follow-up']]);
  const phq=v('di-phq9'); const meds=v('di-meds');
  return `S:\nPatient presents with depressive symptoms for ${v('di-duration')}. Presenting concern: ${v('di-reason')}. Symptoms include: ${sx.length?sx.join(', '):'[see notes]'}. ${v('di-si')} Precipitating factors: ${v('di-trigger')} Psychiatric history: ${v('di-pmh')} Family psychiatric history: ${v('di-fmh')} Substance use: ${v('di-etoh')}${meds?' Current medications: '+meds+'.':' No current medications or known allergies.'}\n\nO:\nMood: ${v('di-omood')}. Affect: ${v('di-affect')}.${appear.length?' Appearance: '+appear.join(', ')+'.':''} ${speech?'Speech: normal rate and tone.':''} ${thought?'Thought process: logical, goal-directed.':''} ${v('di-psych')}${phq?' PHQ-9 score: '+phq+'.':''}\n\nA:\n• ${v('di-dx')}\n• Severity: ${v('di-severity')}.\n• Safety: ${v('di-safety')}\n\nP:\n• ${v('di-tx')}${med?'\n• '+med+' initiated.':''}\n${bul(plan)}\n• Follow up in ${v('di-fu')}.`;
};

G.handpain=function(){
  const sx=picks([['hp-swelling','swelling of joint(s)'],['hp-stiffness','morning stiffness >30 min'],['hp-numbness','numbness/tingling in fingers'],['hp-weakness','weakness/reduced grip strength'],['hp-nightsymptoms','night-time symptoms'],['hp-locking','locking or triggering of finger(s)']]);
  const hx=picks([['hp-oa','osteoarthritis'],['hp-ra','rheumatoid arthritis'],['hp-trauma','recent trauma/fracture'],['hp-repetitive','repetitive occupational use'],['hp-diabetes','diabetes'],['hp-thyroid','thyroid disorder']]);
  const exam=picks([['hp-vitals','Vitals stable'],['hp-swelling-exam','Swelling noted'],['hp-tenderness','Tenderness on palpation'],['hp-reduced-rom','Reduced range of motion'],['hp-grip-weak','Reduced grip strength'],['hp-deformity','Joint deformity noted']]);
  const plan=picks([['hp-reassure','Reassure and educate patient'],['hp-analgesia','Analgesia: acetaminophen / NSAID PRN'],['hp-splint','Splinting recommended'],['hp-physio','Hand physiotherapy / occupational therapy referral placed'],['hp-injection','Corticosteroid injection considered / arranged'],['hp-imaging-plan','Imaging ordered (X-ray / ultrasound / MRI)'],['hp-rheum','Rheumatology referral placed'],['hp-ortho','Orthopedic / hand surgery referral placed'],['hp-nerve','Nerve conduction study ordered']]);
  return `S:\nPatient presents with ${v('hp-char')} affecting the ${v('hp-dominant').toLowerCase().replace(' affected','')} for ${v('hp-duration')}. Onset: ${v('hp-onset')}. Location: ${v('hp-loc')}. Intensity ${v('hp-pain')||'?'}/10. ${sx.length?'Associated symptoms: '+sx.join(', ')+'. ':'No significant associated symptoms. '}Aggravated by ${v('hp-aggr')}; relieved by ${v('hp-relief')}. ${hx.length?'Relevant history: '+hx.join(', ')+'.':'No significant past hand or joint history.'}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\nSpecial tests: ${v('hp-tests')}\nImaging: ${v('hp-xray')}\n\nA:\nDiagnosis: ${v('hp-dx')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('hp-fu')}.`;
};

G.kneepain=function(){
  const sx=picks([['kp-swelling','swelling/effusion'],['kp-stiffness','morning stiffness >30 min'],['kp-locking','locking or catching'],['kp-giving-way','giving way/instability'],['kp-crepitus','crepitus'],['kp-night','night pain']]);
  const hx=picks([['kp-oa','osteoarthritis'],['kp-ra','rheumatoid arthritis'],['kp-trauma','recent trauma/twisting injury'],['kp-overweight','overweight/obesity'],['kp-prev-injury','previous knee injury or surgery'],['kp-sport','high-impact sport/activity']]);
  const exam=picks([['kp-vitals','Vitals stable'],['kp-effusion','Effusion on exam'],['kp-tender','Joint line tenderness'],['kp-reduced-rom','Reduced range of motion'],['kp-stable','Ligamentous stability intact'],['kp-no-neuro','No neurovascular deficit']]);
  const plan=picks([['kp-reassure','Reassure and educate patient'],['kp-analgesia','Analgesia: acetaminophen / NSAID PRN'],['kp-ice','Ice and elevation for acute swelling'],['kp-physio','Physiotherapy referral for strengthening and mobility'],['kp-weightloss','Weight loss counselled'],['kp-brace','Knee brace / support recommended'],['kp-injection','Corticosteroid / hyaluronic acid injection considered'],['kp-imaging-plan','Further imaging ordered (X-ray / MRI)'],['kp-ortho','Orthopedic referral placed'],['kp-activity-mod','Activity modification advised']]);
  const kpOnset=v('kp-onset');
  const kpOnsetStr=kpOnset.toLowerCase().includes('onset')?kpOnset:kpOnset+'.';
  return `S:\nPatient presents with ${v('kp-side').toLowerCase()} pain for ${v('kp-duration')}. Onset: ${kpOnsetStr} Location: ${v('kp-loc')}, character: ${v('kp-char')}, ${v('kp-pain')||'?'}/10 intensity. ${sx.length?'Associated symptoms: '+sx.join(', ')+'. ':'No swelling, locking, giving way, or significant associated symptoms. '}Aggravated by ${v('kp-aggr')}; relieved by ${v('kp-relief')}. ${hx.length?'Relevant history: '+hx.join(', ')+'.':'No significant past knee or joint history.'}\n\nO:\n${exam.length?exam.join('. ')+'.':''}\nSpecial tests: ${v('kp-tests')}\nImaging: ${v('kp-xray')}\n\nA:\nDiagnosis: ${v('kp-dx')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('kp-fu')}.`;
};

G.ihd=function(){
  const meds=v('ihd-meds');
  const sx=picks([['ihd-angina','chest pain/angina'],['ihd-sob','shortness of breath on exertion'],['ihd-sob-rest','shortness of breath at rest'],['ihd-palpitations','palpitations'],['ihd-syncope','syncope/pre-syncope'],['ihd-edema','peripheral oedema'],['ihd-fatigue','fatigue/reduced exercise tolerance'],['ihd-orthopnoea','orthopnoea/PND']]);
  const rf=picks([['ihd-smoking','active smoking'],['ihd-dm','poorly controlled diabetes'],['ihd-htn-uctrl','poorly controlled hypertension'],['ihd-dyslip','dyslipidaemia on treatment'],['ihd-overweight','overweight/obesity'],['ihd-inactive','sedentary lifestyle']]);
  const exam=picks([['ihd-nad','No acute distress'],['ihd-rrr','Regular rate and rhythm, no murmurs'],['ihd-clear-lungs','Lungs clear to auscultation'],['ihd-no-edema','No peripheral oedema'],['ihd-no-jvd','No raised JVP']]);
  const plan=picks([['ihd-contmeds','Continue all current cardiac medications'],['ihd-aspirin','Aspirin / antiplatelet therapy continued'],['ihd-statin','Statin therapy reviewed and continued'],['ihd-bblocker','Beta-blocker dose reviewed'],['ihd-acei','ACE inhibitor / ARB reviewed'],['ihd-lipids','Lipid panel ordered if not done within last year'],['ihd-ecg','ECG ordered / reviewed'],['ihd-exercise','Cardiac rehabilitation / structured exercise advised'],['ihd-smoking-cessation','Smoking cessation support offered'],['ihd-diet','Heart-healthy diet counselled'],['ihd-cardio-ref','Cardiology referral placed'],['ihd-stress','Stress test / imaging ordered']]);
  const ldl=v('ihd-ldl');
  return `S:\nPatient presents for follow-up of ischemic heart disease. ${meds?'Current medications: '+meds+'. ':''}${v('ihd-adherence')} ${sx.length?'Current symptoms: '+sx.join(', ')+'. ':'Denies chest pain, shortness of breath, palpitations, syncope, fatigue, or reduced exercise tolerance. '}Angina: ${v('ihd-angina-freq')} GTN use: ${v('ihd-gtn')} ${rf.length?'Active cardiac risk factors: '+rf.join(', ')+'.':''}\n\nO:\nBP: ${v('ihd-bp')||'[not recorded]'}. HR: ${v('ihd-hr')||'[not recorded]'} bpm.${v('ihd-wt')?' Weight: '+v('ihd-wt')+' lbs.':''}${v('ihd-spo2')?' SpO\u2082: '+v('ihd-spo2')+'.':''}\n${exam.length?exam.join('. ')+'.':''}\nInvestigations: ${v('ihd-invx')}${ldl?'\n'+ldl+'.':''}\n\nA:\n• Status: ${v('ihd-status')}\n• Risk factor control: ${v('ihd-riskctrl')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('ihd-fu')}.`;
};

G.hf=function(){
  const meds=v('hf-meds');
  const sx=picks([['hf-sob-exert','shortness of breath on exertion'],['hf-sob-rest','shortness of breath at rest'],['hf-orthopnoea','orthopnoea'],['hf-pnd','paroxysmal nocturnal dyspnoea (PND)'],['hf-edema','peripheral oedema'],['hf-fatigue','fatigue/reduced exercise tolerance'],['hf-palpitations','palpitations'],['hf-syncope','syncope/pre-syncope']]);
  const exam_pos=picks([['hf-nad','No acute distress'],['hf-rrr','Regular rate and rhythm'],['hf-clear-lungs','Lungs clear — no crackles'],['hf-no-edema','No peripheral oedema'],['hf-no-jvd','No raised JVP']]);
  const exam_neg=picks([['hf-crackles','Bibasal crackles on auscultation'],['hf-edema-exam','Peripheral oedema on exam'],['hf-raised-jvp','Raised JVP']]);
  const plan=picks([['hf-contmeds','Continue all current heart failure medications'],['hf-diuretic','Diuretic dose reviewed and optimised'],['hf-acei-arb','ACE inhibitor / ARB / ARNI reviewed'],['hf-bblocker','Beta-blocker reviewed'],['hf-mra','Mineralocorticoid antagonist reviewed'],['hf-sglt2','SGLT2 inhibitor reviewed / initiated'],['hf-electrolytes','Renal function and electrolytes monitored'],['hf-bnp','BNP / NT-proBNP ordered'],['hf-echo','Echocardiogram ordered / reviewed'],['hf-fluid-ed','Fluid restriction and low-sodium diet reinforced'],['hf-weight-ed','Daily weight monitoring reinforced'],['hf-rehab','Cardiac rehabilitation referral placed'],['hf-cardio','Cardiology referral placed'],['hf-er-warn','Patient advised to present to ER if: acute shortness of breath, weight gain >2 kg in 3 days, or worsening symptoms']]);
  const ef=v('hf-ef');
  const allexam=[...exam_pos,...exam_neg];
  const hfType=v('hf-type').charAt(0).toLowerCase()+v('hf-type').slice(1).replace(/\.$/,'');
  return `S:\nPatient presents for follow-up of ${hfType}. ${meds?'Current medications: '+meds+'. ':''}${v('hf-adherence')} Weight monitoring: ${v('hf-weight-mon')} ${sx.length?'Current symptoms: '+sx.join(', ')+'. ':'No significant symptoms of decompensation reported. '}Functional class: ${v('hf-nyha')} Fluid and dietary adherence: ${v('hf-fluid')}\n\nO:\nBP: ${v('hf-bp')||'[not recorded]'}. HR: ${v('hf-hr')||'[not recorded]'} bpm.${v('hf-wt')?' Weight: '+v('hf-wt')+' lbs.':''}${v('hf-spo2')?' SpO\u2082: '+v('hf-spo2')+'.':''}${v('hf-rr')?' RR: '+v('hf-rr')+'.':''}\n${allexam.length?allexam.join('. ')+'.':''}\nInvestigations: ${v('hf-invx')}${ef?'\n'+ef+'.':''}\n\nA:\n• Status: ${v('hf-status')}\n• Volume status: ${v('hf-volume')}\n\nP:\n${bul(plan)}\n• Follow up in ${v('hf-fu')}.`;
};