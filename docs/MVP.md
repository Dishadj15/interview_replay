# **Interview Replay MVP**

## **Goal**

Allow users to upload interview recordings and receive actionable communication analytics.

## **Tech Stack**

Frontend:

* React  
* TypeScript  
* Tailwind CSS

Backend:

* FastAPI  
* Python

Database:

* PostgreSQL (Supabase)

Auth:

* Supabase Auth

Storage:

* Supabase Storage

Deployment:

* Vercel  
* Railway

## **Features**

### **Authentication**

* Sign up  
* Login  
* Logout

### **Interview Upload**

* Upload mp3/wav files  
* Store in Supabase Storage

### **Transcription**

* Generate transcript using Whisper

### **Analytics**

* Filler word detection  
* Speaking pace calculation  
* Pause detection

### **Dashboard**

* List uploaded interviews  
* View transcript  
* View analytics

## **Database**

Users

* id  
* email

Interviews

* id  
* user\_id  
* audio\_url  
* transcript  
* status

Reports

* id  
* interview\_id  
* filler\_count  
* speaking\_rate  
* pause\_count  
* feedback

## **API Endpoints**

POST /interviews

GET /interviews

GET /interviews/{id}

GET /interviews/{id}/analytics

## **Important**

Do NOT use:

* Celery  
* Redis  
* Webhooks  
* Queues  
* Microservices

Build a working MVP first.

