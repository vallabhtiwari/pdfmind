# PDFMind 🤖📄

A powerful AI-powered PDF chat application that allows you to have intelligent conversations with your PDF documents. Upload any PDF and chat with it using text or voice queries, powered by advanced AI models.

## 📸 Screenshots

### Homepage (Empty State)

![Homepage Empty](./public/screenshots/two.png)

### Homepage (With PDF Uploaded)

![Homepage with PDF](./public/screenshots/one.png)

### Profile Page

![Profile Page](./public/screenshots/three.png)

## ✨ Features

### 🎯 Core Functionality

- **PDF Upload & Processing**: Drag-and-drop or click to upload PDF files
- **Split-Screen Interface**: View PDF on the left, chat interface on the right
- **Intelligent Chat**: Ask questions about your PDF content and get contextual answers
- **Voice Queries**: Use voice input for hands-free interaction
- **Real-time Responses**: Stream responses from AI models for better user experience

### 🔐 User Management

- **Google OAuth**: Secure authentication with Google accounts
- **User Limits**: Rate limiting system with daily and monthly upload limits
- **Usage Tracking**: Monitor your PDF upload and chat usage
- **Profile Management**: View your usage statistics and account information

### 🧠 AI-Powered Features

- **Vector Search**: Advanced similarity search using ChromaDB
- **Text Embeddings**: OpenAI embeddings for semantic understanding
- **AI Responses**: Gemini AI for generating human-like responses
- **Voice Transcription**: Whisper integration for speech-to-text conversion

### 🎨 User Experience

- **Responsive Design**: Modern, clean interface built with Tailwind CSS
- **PDF Viewer**: Interactive PDF viewer with zoom and navigation controls
- **Chat History**: View conversation history during your session
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth loading indicators for better UX

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Lucide React** - Icon library

### Backend & AI

- **LangChain** - PDF parsing and document processing
- **ChromaDB** - Vector database for similarity search
- **OpenAI** - Text embeddings and Whisper transcription
- **Google Gemini** - AI response generation
- **Prisma** - Database ORM
- **NextAuth.js** - Authentication

### Infrastructure

- **PostgreSQL** - Primary database
- **ChromaDB Cloud** - Vector database hosting
- **Upstash QStash** - Cron job scheduling
- **Vercel** - Deployment platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Google OAuth credentials
- API keys for OpenAI, Google Gemini, and ChromaDB

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/pdfmind.git
   cd pdfmind
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/pdfmind"

   # Authentication
   NEXTAUTH_SECRET="your-nextauth-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # AI Services
   OPENAI_API_KEY="your-openai-api-key"
   EMBEDDING_MODEL="text-embedding-3-small"
   GEMINI_API_KEY="your-gemini-api-key"
   GEMINI_MODEL="gemini-1.5-flash"

   # Vector Database
   CHROMA_API_KEY="your-chroma-api-key"
   CHROMA_DATABASE="your-chroma-database"
   CHROMA_TENANT="your-chroma-tenant"

   # Cron Jobs
   QSTASH_CURRENT_SIGNING_KEY="your-qstash-current-key"
   QSTASH_NEXT_SIGNING_KEY="your-qstash-next-key"

   # Rate Limiting
   DAILY_LIMIT="1"
   MONTHLY_LIMIT="5"
   EMBEDDING_THRESHOLD="40000"
   ```

4. **Set up the database**

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Authentication

- Click "Sign In" to authenticate with your Google account
- Your account will be automatically created with default usage limits

### 2. Uploading PDFs

- **Drag & Drop**: Simply drag a PDF file onto the left panel
- **Click Upload**: Use the upload button in the navbar
- **File Requirements**:
  - Maximum token count: 40,000 tokens
  - Supported format: PDF only
  - Rate limits: 1 daily, 5 monthly uploads

### 3. Chatting with Your PDF

- **Text Queries**: Type your questions in the chat input
- **Voice Queries**: Click the microphone icon and speak your question
- **Contextual Responses**: AI will search through your PDF content and provide relevant answers
- **Streaming**: Responses appear in real-time as they're generated

### 4. PDF Navigation

- **Zoom Controls**: Use the zoom buttons to adjust PDF size
- **Page Navigation**: Navigate between pages using the controls
- **Full-Screen View**: PDF viewer supports responsive sizing

### 5. Managing Your Account

- Visit `/auth` to view your profile and usage statistics
- Monitor your daily and monthly upload limits
- View total upload count

## 🔧 Configuration

### Rate Limiting

Adjust user limits by modifying environment variables:

- `DAILY_LIMIT`: Maximum PDF uploads per day (default: 1)
- `MONTHLY_LIMIT`: Maximum PDF uploads per month (default: 5)
- `EMBEDDING_THRESHOLD`: Maximum tokens per PDF (default: 40,000)

### AI Models

Customize AI models in environment variables:

- `EMBEDDING_MODEL`: OpenAI embedding model (default: text-embedding-3-small)
- `GEMINI_MODEL`: Google Gemini model (default: gemini-1.5-flash)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `pnpm build`
2. Start production server: `pnpm start`
3. Set up reverse proxy (nginx recommended)

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (OpenAI/Gemini)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PDF Viewer    │    │   ChromaDB      │    │   Whisper       │
│   (react-pdf)   │    │   (Vector DB)   │    │   (Speech)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🙏 Acknowledgments

- [LangChain](https://langchain.com/) for document processing
- [ChromaDB](https://www.trychroma.com/) for vector storage
- [OpenAI](https://openai.com/) for embeddings and transcription
- [Google Gemini](https://ai.google.dev/) for AI responses
- [Next.js](https://nextjs.org/) for the framework
- [Vercel](https://vercel.com/) for hosting

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Made with ❤️ by [Vallabh Tiwari](https://github.com/vallabhtiwari)**
