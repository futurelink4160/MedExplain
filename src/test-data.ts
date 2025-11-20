export const mockResponseData = {
  response_type: "PATIENT_SUPPORT",
  emergency_detected: false,
  urgency_level: "moderate",
  rag_results: "Retrieved relevant information about medication",
  pgx_results: {
    drug_labels: [
      "FDA Label: Sertraline - CYP2C19 poor metabolizers may require dose adjustment",
      "CPIC Guideline: Consider alternative drug for CYP2C19 poor metabolizers",
      "PharmGKB Annotation: Strong evidence for CYP2C19 genotype effects on sertraline efficacy"
    ],
    genes: [
      "CYP2C19 - Primary metabolizer of sertraline",
      "CYP2D6 - Secondary metabolic pathway",
      "ABCB1 - Affects drug transport and bioavailability"
    ],
    variants: [
      "CYP2C19*2 - Loss of function allele, associated with poor metabolism",
      "CYP2C19*17 - Increased function allele, associated with rapid metabolism",
      "CYP2D6*4 - Non-functional allele affecting secondary metabolism"
    ],
    phenotypes: [
      "Poor Metabolizer (PM) - Reduced enzyme activity, higher drug levels",
      "Intermediate Metabolizer (IM) - Somewhat reduced activity",
      "Normal Metabolizer (NM) - Standard enzyme activity",
      "Rapid/Ultrarapid Metabolizer (RM/UM) - Increased enzyme activity, lower drug levels"
    ]
  },
  final_answer_markdown: `
### Understanding Your Concern

You've mentioned experiencing dizziness and nausea while taking Sertraline (Zoloft), an antidepressant medication. These are known side effects that some people experience, especially when first starting the medication or after a dose change. It's important to understand what might be causing these symptoms and when you should seek medical attention.

### About This Medication

**Sertraline** is a selective serotonin reuptake inhibitor (SSRI) commonly prescribed for:
- Depression
- Anxiety disorders
- Obsessive-compulsive disorder (OCD)
- Post-traumatic stress disorder (PTSD)
- Panic disorder

It works by increasing serotonin levels in your brain, which can help improve mood, sleep, appetite, and energy levels. However, this adjustment period can sometimes cause temporary side effects.

### Why These Symptoms May Happen

Dizziness and nausea with sertraline can occur because:

1. **Initial Adjustment**: Your body is adjusting to changes in serotonin levels
2. **Dosage Changes**: Recent increases in dose can temporarily intensify side effects
3. **Timing of Medication**: Taking the medication on an empty stomach may worsen nausea
4. **Individual Metabolism**: Some people metabolize the medication differently based on their genetics

### How Common Is This?

- **Nausea**: Affects approximately 20-25% of people taking sertraline, especially in the first few weeks
- **Dizziness**: Occurs in about 10-15% of patients
- Most people find these symptoms improve within 1-2 weeks as their body adjusts
- Symptoms are usually mild to moderate in intensity

### What You Can Do Now

✓ **Take with food**: Have your medication with a meal or snack to reduce nausea

✓ **Stay hydrated**: Drink plenty of water throughout the day

✓ **Move slowly**: When standing up, do so gradually to minimize dizziness

✓ **Avoid alcohol**: Alcohol can worsen dizziness and nausea

✓ **Consistent timing**: Take your medication at the same time each day

✓ **Rest when needed**: Give yourself permission to rest if symptoms are bothersome

✓ **Ginger tea**: May help with nausea (check with your healthcare provider first)

### When to Contact Your Doctor

Contact your healthcare provider if:

- Symptoms persist beyond 2-3 weeks
- Symptoms are severe and interfere with daily activities
- You experience new or worsening symptoms
- You're having difficulty eating or drinking due to nausea
- You're considering stopping the medication

Your doctor may:
- Adjust your dosage
- Change the timing of when you take the medication
- Suggest taking it with food if you haven't been
- Prescribe an anti-nausea medication temporarily
- Consider switching to a different SSRI if symptoms don't improve

### When to Seek Emergency Care

Seek immediate medical attention if you experience:

- Severe chest pain or difficulty breathing
- Irregular heartbeat or rapid heart rate
- Severe allergic reactions (rash, swelling, difficulty breathing)
- Seizures
- Thoughts of self-harm
- Serotonin syndrome symptoms (agitation, confusion, rapid heart rate, high fever, muscle stiffness)
- Persistent vomiting preventing you from keeping food or water down

### Important Safety Reminders

**Do not stop taking your medication without medical guidance.** Stopping SSRIs abruptly can cause withdrawal symptoms.

- Never double up on doses if you miss one
- Keep all follow-up appointments with your healthcare provider
- Inform your doctor of all other medications and supplements you're taking
- Be aware that it can take 4-6 weeks to feel the full benefits of the medication
- Report any new or worsening symptoms to your healthcare provider

### What to Expect Going Forward

**Week 1-2**: Side effects like nausea and dizziness are most common during this period. They typically begin to improve as your body adjusts.

**Week 2-4**: Most people notice side effects decreasing significantly. You may start to notice some improvements in your symptoms.

**Week 4-8**: The medication reaches its full therapeutic effect. Side effects should be minimal to none for most people.

If symptoms persist beyond this timeframe or worsen, it's important to follow up with your healthcare provider for potential dosage adjustments or alternative treatment options.

### Educational Purpose Only

*This information is provided for educational purposes only and does not constitute medical advice. It is based on general medical knowledge and FDA-approved prescribing information. Your individual response to medication can vary based on many factors including your medical history, other medications, and genetic factors.*

*Always consult with your healthcare provider or pharmacist for personalized medical advice regarding your specific situation. If you're experiencing concerning symptoms, contact your healthcare provider promptly. In case of emergency, call 911 or go to the nearest emergency room.*
`
};

export const emergencyResponseData = {
  response_type: "PATIENT_SUPPORT",
  emergency_detected: true,
  urgency_level: "critical",
  rag_results: "",
  pgx_results: {
    drug_labels: [],
    genes: [],
    variants: [],
    phenotypes: []
  },
  final_answer_markdown: ""
};
