# 🏥 HealEasy

> **Find your way. Tell your story once.**

[![AWS](https://img.shields.io/badge/Built%20on-AWS-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Bedrock](https://img.shields.io/badge/AI-Amazon%20Bedrock-028090)](https://aws.amazon.com/bedrock)
[![Hackathon](https://img.shields.io/badge/AWS%20Hackathon-2026-F4A535)](https://aws.amazon.com)

---

## What problem are we solving?

Walk into any government hospital or private clinic in India. You'll see the same thing every time — patients standing at three different counters repeating the same symptoms, not knowing which floor to go to, waiting with no idea how long they'll be there. And when they finally reach the doctor, the doctor starts from scratch with zero context about why they're there.

On the doctor's side, a 15-minute consultation ends with 5 minutes of paperwork. Notes get rushed. Records get lost. The next time the same patient comes back, nothing is remembered.

We built HealEasy to fix both of these — not as two separate apps, but as one connected system.

---

## How it works

A patient opens HealEasy, taps a mic button, and speaks their symptoms in their own language. An AI agent asks a few simple follow-up questions. The patient approves the summary, gets routed to the right department, and receives a live queue token with the floor and room number. When they walk into the doctor's room, the doctor already has their full summary on screen.

During the consultation, the doctor taps one button. An ambient AI scribe listens to the conversation and drafts a structured clinical note. The doctor reviews it, edits anything that needs changing, and approves it. That note goes into the patient's permanent record — which they can access anytime from their phone.

One voice interaction. Three outputs: a navigation token, a doctor briefing, and a clinical record.

---

## Why this doesn't exist yet

Existing solutions all solve one piece:
- AI scribes like Nuance DAX cost thousands of dollars per doctor per year and need EHR integration
- Queue token machines exist but are completely disconnected from patient history
- Symptom checkers live on the patient's phone and never reach the doctor

None of them work for the 80% of Indian clinics that have no existing software at all. HealEasy requires no hospital IT infrastructure — just a smartphone on either side.

---

## Tech stack

| Layer | Service | What it does |
|---|---|---|
| Frontend | AWS Amplify | Hosts the React web app |
| Auth | Amazon Cognito | Separate login for patients and doctors |
| API | API Gateway + Lambda | All backend logic |
| Voice | Amazon Transcribe | Speech to text for both patient and doctor |
| AI | Amazon Bedrock (Claude) | Department routing and SOAP note generation |
| Workflow | AWS Step Functions | Forces human approval before anything is saved |
| Database | Amazon DynamoDB | Queue tokens, records, department directory |
| Storage | Amazon S3 + KMS | Encrypted audio and documents |
| Audit | AWS CloudTrail | Every access logged for consent compliance |

---

## Architecture

```
Patient speaks             Doctor speaks
      │                         │
Amazon Cognito ──► API Gateway ◄─── AWS Lambda
                       │
        ┌──────────────┴──────────────────┐
        ▼                                 ▼
 Amazon Transcribe                Amazon Transcribe
 (symptom intake)                 (consult recording)
        │                                 │
 Bedrock Claude                   Bedrock Claude
 (routing + summary)              (SOAP note draft)
        │                                 │
        └──────────┬───────────────────────┘
                   ▼
          AWS Step Functions
       (human verification gate)
                   │
    ┌──────────────┼──────────┬────────────┐
    ▼              ▼          ▼            ▼
DynamoDB       DynamoDB    S3 + KMS   CloudTrail
(tokens)      (records)   (audio)    (audit log)
```

The key design decision: Step Functions sits **after** the AI generates something and **before** anything gets saved. Reception staff confirm the department suggestion. The doctor approves the SOAP note. The system cannot save anything without a human sign-off — this is enforced in the infrastructure, not just in policy.

---

## Running locally

**Clone the repo**
```bash
git clone https://github.com/HARIPRASAD0311/Heal-Easy.git
cd Heal-Easy/frontend
npm install
```

**Set up environment**
```bash
cp .env.example .env
# Fill in your API Gateway URL and Cognito details from AWS console
```

**Start the app**
```bash
npm start
# Opens at http://localhost:3000
```

**Demo credentials**
- Patient flow: just open the app, no login needed
- Doctor login: `priya.sharma` / `heal2026`

---

## AWS setup (for judges)

**DynamoDB tables**
- `healeasy-patients` — partition key: patientId
- `healeasy-queue` — partition key: hospitalId, sort key: departmentId
- `healeasy-departments` — pre-loaded with 4 departments

**Lambda functions**
- `healeasy-upload-audio` — saves audio to S3
- `healeasy-transcribe` — runs Transcribe job
- `healeasy-process-symptoms` — calls Bedrock for routing
- `healeasy-generate-soap` — calls Bedrock for SOAP note
- `healeasy-confirm-routing` — triggers Step Functions patient workflow
- `healeasy-approve-note` — triggers Step Functions doctor workflow

**Region:** ap-south-1 (Mumbai)

---

## What we built vs what's roadmap

**Built for this submission**
- Patient voice intake with AI follow-up questions
- AI department routing with confidence score
- Live queue token with floor/room directory
- Doctor pre-visit summary view
- Ambient consultation recording
- AI-drafted SOAP note with doctor approval
- Patient longitudinal health record

**Roadmap**
- Multi-hospital onboarding via login codes
- Real indoor positioning (BLE/UWB)
- FHIR R4 integration with existing EHR systems
- More Indian regional languages

---

## Team

| Person | Role |
|---|---|
| Person A | Patient frontend — voice intake, token, floor map |
| Person B | Doctor frontend — queue, consultation, SOAP review |
| Person C | AI pipeline — Lambda, Transcribe, Bedrock prompts |
| Person D | Backend — DynamoDB, Step Functions, S3, deployment |

---

*HealEasy · AWS Healthcare Hackathon 2026*
