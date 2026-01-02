# Webhook Response Debug Guide

## Expected Response Structure

Your n8n webhook at `https://ftlteam4160.app.n8n.cloud/webhook-test/medexplain-query` must return a JSON response with the following structure:

```json
{
  "response_type": "PATIENT_SUPPORT",
  "emergency_detected": false,
  "urgency_level": "moderate",
  "rag_results": "Retrieved relevant information about medication",
  "pgx_results": {
    "drug_labels": [
      "Clopidogrel is used to prevent blood clots by blocking platelets from forming clumps.",
      "Activation of clopidogrel in the liver depends on the CYP2C19 enzyme."
    ],
    "genes": [
      "CYP2C19: crucial for activating clopidogrel; variations affect drug effect and side effect likelihood.",
      "ABCB1: influences how clopidogrel moves through the body."
    ],
    "variants": [
      "CYP2C19*1: typical function variant.",
      "CYP2C19*2, *3: reduce enzyme activity, possibly lowering drug effect."
    ],
    "phenotypes": [
      "Loss-of-function variants can lead to reduced response to clopidogrel.",
      "Increased-function variants like CYP2C19*17 may raise bruising or bleeding risk."
    ],
    "testing_guidelines": {
      "fda_level": "Actionable PGx",
      "cpic_dosing_info": true,
      "has_dosing_guideline": true
    }
  },
  "final_answer_markdown": "### Understanding Your Concern\n\nYour markdown content here..."
}
```

## Required Fields

### Top Level (All Required)
- `response_type`: String (e.g., "PATIENT_SUPPORT", "CLINICIAN_SUPPORT")
- `emergency_detected`: Boolean (true/false)
- `urgency_level`: String (e.g., "low", "moderate", "high", "critical")
- `rag_results`: String (description of retrieved data)
- `pgx_results`: Object (see below)
- `final_answer_markdown`: String (MOST IMPORTANT - contains the formatted response)

### pgx_results Object (Required, but arrays can be empty)
- `drug_labels`: Array of strings
- `genes`: Array of strings
- `variants`: Array of strings
- `phenotypes`: Array of strings
- `testing_guidelines`: Object (optional) with:
  - `fda_level`: String (e.g., "Actionable PGx")
  - `cpic_dosing_info`: Boolean
  - `has_dosing_guideline`: Boolean

## Expected Markdown Sections in final_answer_markdown

The `final_answer_markdown` field should contain markdown text with these sections (using ### headers):

1. `### Understanding Your Concern`
2. `### About This Medication`
3. `### Why These Symptoms May Occur`
4. `### Genetic Information (Educational)`
5. `### How Common Are These Side Effects?`
6. `### What You Can Do Now`
7. `### When to Contact Your Doctor`
8. `### When to Seek Emergency Care`
9. `### Important Safety Reminders`
10. `### What to Expect Moving Forward`

## Debugging Steps

### 1. Check Browser Console
When you submit the form, open your browser's Developer Tools (F12) and check the Console tab. You should see:

```
Sending payload to n8n: {...}
Response status: 200
Response ok: true
Raw response text: {...}
Parsed response data: {...}
Response data structure check:
- Has final_answer_markdown: true
- Has pgx_results: true
- Has emergency_detected: true
- Has response_type: true
- Has urgency_level: true
```

### 2. Check for Missing Fields
If you see warnings like:
```
WARNING: Missing final_answer_markdown in response
WARNING: Missing pgx_results in response
```

This means your n8n webhook is not returning the complete structure.

### 3. Verify Your n8n Webhook Response Node

In your n8n workflow, the final "Respond to Webhook" node should:

1. **Set Response Code**: 200
2. **Set Response Headers**:
   - `Content-Type: application/json`
3. **Set Response Body**: The JSON structure shown above

Example n8n expression:
```javascript
{
  "response_type": "PATIENT_SUPPORT",
  "emergency_detected": false,
  "urgency_level": "moderate",
  "rag_results": "{{ $json.rag_output }}",
  "pgx_results": {
    "drug_labels": {{ $json.drug_labels || [] }},
    "genes": {{ $json.genes || [] }},
    "variants": {{ $json.variants || [] }},
    "phenotypes": {{ $json.phenotypes || [] }}
  },
  "final_answer_markdown": "{{ $json.final_markdown }}"
}
```

### 4. Common Issues

**Issue**: ResultsDisplay shows "No results data available"
**Cause**: `final_answer_markdown` is missing or empty
**Fix**: Ensure your AI response is being captured and added to `final_answer_markdown`

**Issue**: Sections not appearing in results
**Cause**: Markdown sections are missing or using wrong header format
**Fix**: Use `### Section Name` format (3 hashtags, space, title)

**Issue**: PGX results not showing
**Cause**: `pgx_results` object is missing or empty
**Fix**: Ensure all 4 arrays (drug_labels, genes, variants, phenotypes) are present even if empty

### 5. Test with Mock Data

You can test the display without calling the webhook by clicking the "Test with Mock Data" button. This will show you what a properly formatted response looks like.

## Making Changes in n8n

If your n8n webhook is not returning the correct structure:

1. Open your n8n workflow
2. Find the "Respond to Webhook" node (usually at the end)
3. Make sure it's set to "Respond With" = "Using JSON"
4. Update the JSON structure to match the required format above
5. Test the workflow
6. Try submitting the form again

## Example Minimal Valid Response

If you want to test with minimal data:

```json
{
  "response_type": "PATIENT_SUPPORT",
  "emergency_detected": false,
  "urgency_level": "moderate",
  "rag_results": "Test data retrieved",
  "pgx_results": {
    "drug_labels": [],
    "genes": [],
    "variants": [],
    "phenotypes": []
  },
  "final_answer_markdown": "### Understanding Your Concern\n\nThis is a test response.\n\n### Educational Purpose Only\n\nThis is for testing only."
}
```
