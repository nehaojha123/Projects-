import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, where } from 'firebase/firestore';

// SVG Icons for the UI
const Sparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
const MessageSquareText = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square-text"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="13" x2="19" y1="10" y2="10"/><line x1="13" x2="17" y1="14" y2="14"/></svg>;
const Image = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.66"/><path d="M3 10v1a8 8 0 0 0 8 8h1"/><path d="m3 10 2.29-2.29"/><path d="m5.71 12.71 6-6"/><path d="m5.71 12.71 2.5-2.5"/></svg>;
const AlertCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;
const Loader = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin lucide lucide-loader-2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const LayoutDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const Briefcase = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const FileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const ThumbsUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up"><path d="M7 10v12c0 .28 0 .53.11 1a1 1 0 0 0 1.25.75L12 21.6v-7.2h3.25l.8.8V19a2 2 0 0 0 2 2h2.25l.65-.65.25-.25a1 1 0 0 0-.25-1.5L16.25 15.6l-1.5 1.5.25.25V13a2 2 0 0 0-2-2h-2.5V8.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1.5a1 1 0 0 0 1 1h1z"/><path d="M2 13h2"/></svg>;
const ThumbsDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-down"><path d="M17 14V2c0-.28 0-.53-.11-1a1 1 0 0 0-1.25-.75L12 2.4v7.2H8.75l-.8-.8V5a2 2 0 0 0-2-2H3.75L3.1.65.85 2.25a1 1 0 0 0 .25 1.5L7.75 8.4l1.5-1.5-.25-.25V11a2 2 0 0 0 2 2h2.5v1.5a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-1.5a1 1 0 0 0-1-1h-1z"/><path d="M22 11h-2"/></svg>;


// Global variables for Firebase config (provided by the environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

function App() {
  // State for Firebase and User
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appError, setAppError] = useState(''); // General app-level error

  // State for Message Analysis
  const [messageInput, setMessageInput] = useState('');
  const [messageResult, setMessageResult] = useState(null);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);
  const [messageFeedbackReason, setMessageFeedbackReason] = useState('');

  // State for Image Analysis
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageResult, setImageResult] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showFeedbackImage, setShowFeedbackImage] = useState(false);
  const [imageFeedbackReason, setImageFeedbackReason] = useState('');

  // State for Dashboard & History
  const [detectionCounts, setDetectionCounts] = useState({ fake: 0, genuine: 0, uncertain: 0 });
  const [userAnalyses, setUserAnalyses] = useState([]);

  // API Key - IMPORTANT: Replace this with your actual API key for local development
  // In the Canvas environment, this key is automatically provided.
  const apiKey = "AIzaSyCrpesRKZKw_YsAI-9GTz7b1CSD7Dh_YAc"; 

  // 1. Firebase Initialization and Authentication
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
            setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
          } catch (error) {
            console.error("Error during authentication:", error);
            setAppError("Authentication failed. Some features may not work.");
            setUserId(crypto.randomUUID()); // Fallback
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setAppError("Failed to initialize application. Check console.");
      setIsAuthReady(true);
    }
  }, []);

  // 2. Dashboard Data Fetching (Real-time global counts)
  useEffect(() => {
    if (db && isAuthReady) {
      const detectionResultsRef = collection(db, `artifacts/${appId}/public/data/detectionResults`);
      const q = query(detectionResultsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let fakeCount = 0;
        let genuineCount = 0;
        let uncertainCount = 0;

        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.assessment) {
            if (data.assessment.includes("Likely Fake")) {
              fakeCount++;
            } else if (data.assessment.includes("Likely Genuine")) {
              genuineCount++;
            } else if (data.assessment.includes("Uncertain")) {
              uncertainCount++;
            }
          }
        });
        setDetectionCounts({ fake: fakeCount, genuine: genuineCount, uncertain: uncertainCount });
      }, (error) => {
        console.error("Error fetching detection counts:", error);
        setAppError("Failed to load dashboard data.");
      });

      return () => unsubscribe();
    }
  }, [db, isAuthReady]);

  // 3. User-Specific History Fetching (Real-time for current user)
  useEffect(() => {
    if (db && userId && isAuthReady) {
      const userDetectionResultsRef = collection(db, `artifacts/${appId}/public/data/detectionResults`);
      const q = query(userDetectionResultsRef, where("userId", "==", userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedAnalyses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        fetchedAnalyses.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
        setUserAnalyses(fetchedAnalyses);
      }, (error) => {
        console.error("Error fetching user-specific analyses:", error);
        setAppError("Failed to load your past analyses.");
      });

      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady]);

  // Utility to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // 4. Detect Fake Message (Text) - Enhanced Prompt
  const detectFakeMessage = async () => {
    if (!messageInput.trim()) {
      setMessageError("Please enter a message to analyze.");
      return;
    }
    if (!db || !userId) {
      setAppError("Application not ready. Please wait for authentication.");
      return;
    }

    setIsMessageLoading(true);
    setMessageResult(null);
    setMessageError('');
    setShowFeedbackMessage(false);
    setMessageFeedbackReason('');

    try {
      const chatHistory = [];
      const prompt = `As a highly advanced fake message detection system, perform a deep linguistic and contextual analysis of the following message. Identify any signs of being a scam, phishing attempt, misinformation, or a hoax. Look for:
      - **Urgent/Threatening Language:** Phrases designed to create panic or immediate action.
      - **Unusual Requests:** Asking for personal information (passwords, bank details) or unusual payment methods.
      - **Grammatical/Spelling Errors:** Common in quickly crafted fake messages.
      - **Suspicious Links (Simulated Check):** If a URL is present, analyze its context. *Note: A real-time Google Safe Browsing API check is beyond this client-side system's scope and would require a dedicated backend for security.*
      - **Emotional Manipulation:** Attempts to evoke strong emotions (fear, greed, sympathy).
      - **Inconsistencies:** Contradictions in facts or claims.
      - **Impersonation:** Claims to be from a known entity (bank, government, famous person).
      
      Based on your analysis, provide a clear "Assessment: [Likely Fake/Likely Genuine/Uncertain]" and a detailed "Reasoning: [Explanation based on the identified red flags or genuine indicators]." Also, explicitly state if any URLs were detected and their potential risk based on context.

      Message: "${messageInput}"`;

      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      let assessmentText = "Could not get a clear assessment. Please try again.";
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        assessmentText = result.candidates[0].content.parts[0].text;
      }

      setMessageResult(assessmentText);

      const detectionType = "text";
      const assessmentMatch = assessmentText.match(/Assessment:\s*\[(.*?)\]/);
      const detectedAssessment = assessmentMatch ? assessmentMatch[1].trim() : "Uncertain";

      await addDoc(collection(db, `artifacts/${appId}/public/data/detectionResults`), {
        type: detectionType,
        content: messageInput,
        aiAssessment: assessmentText,
        assessment: detectedAssessment,
        timestamp: serverTimestamp(),
        userId: userId
      });

    } catch (error) {
      console.error("Error detecting fake message:", error);
      setMessageError(`Error analyzing message: ${error.message}. Please try again.`);
      setMessageResult(null);
    } finally {
      setIsMessageLoading(false);
    }
  };

  // 5. Detect Fake Image - Enhanced Prompt
  const detectFakeImage = async () => {
    if (!imageFile) {
      setImageError("Please upload an image to analyze.");
      return;
    }
    if (!db || !userId) {
      setAppError("Application not ready. Please wait for authentication.");
      return;
    }

    setIsImageLoading(true);
    setImageResult(null);
    setImageError('');
    setShowFeedbackImage(false);
    setImageFeedbackReason('');

    try {
      const base64ImageData = await fileToBase64(imageFile);

      const prompt = `As a highly advanced fake message detection system, analyze the text content within this image (if any) and the image itself for signs of being a scam, phishing attempt, misinformation, or a hoax.
      **First, perform OCR to extract all visible text from the image.**
      **Then, analyze both the extracted text and the visual elements for:**
      - **Image Manipulation:** Signs of Photoshopping, deepfakes, unnatural distortions, or inconsistent lighting.
      - **Low Quality/Pixelation:** Especially if claiming to be official.
      - **Suspicious Logos/Branding:** Incorrect, blurry, or altered logos.
      - **Urgent/Threatening Language (from text):** Phrases designed to create panic or immediate action.
      - **Unusual Requests (from text):** Asking for personal information or unusual payments.
      - **Grammatical/Spelling Errors (from text):**
      - **Suspicious Links (Simulated Check):** If a URL is present in the image text, analyze its context. *Note: A real-time Google Safe Browsing API check is beyond this client-side system's scope and would require a dedicated backend for security.*

      Based on your comprehensive analysis, provide a clear "Assessment: [Likely Fake/Likely Genuine/Uncertain]" and a detailed "Reasoning: [Explanation based on extracted text and visual cues, mentioning specific red flags identified]."

      `;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64ImageData
                }
              }
            ]
          }
        ],
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      let assessmentText = "Could not get a clear assessment. Please try again.";
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        assessmentText = result.candidates[0].content.parts[0].text;
      }

      setImageResult(assessmentText);

      const detectionType = "image";
      const assessmentMatch = assessmentText.match(/Assessment:\s*\[(.*?)\]/);
      const detectedAssessment = assessmentMatch ? assessmentMatch[1].trim() : "Uncertain";

      await addDoc(collection(db, `artifacts/${appId}/public/data/detectionResults`), {
        type: detectionType,
        content: imagePreviewUrl,
        aiAssessment: assessmentText,
        assessment: detectedAssessment,
        timestamp: serverTimestamp(),
        userId: userId
      });

    } catch (error) {
      console.error("Error detecting fake image:", error);
      setImageError(`Error analyzing image: ${error.message}. Please try again.`);
      setImageResult(null);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Handle image file selection for preview and upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageError('');
      setImageResult(null);
    } else {
      setImageFile(null);
      setImagePreviewUrl('');
    }
    setShowFeedbackImage(false);
    setImageFeedbackReason('');
  };

  // Handle Feedback Submission (Detailed Feedback)
  const handleFeedback = async (type, originalContent, aiAssessment, userCorrection, userReason) => {
    if (!db || !userId) {
      setAppError("Application not ready. Please wait for authentication.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/feedback`), {
        type: type,
        originalContent: originalContent,
        aiAssessment: aiAssessment,
        userCorrection: userCorrection,
        userReason: userReason,
        timestamp: serverTimestamp(),
        userId: userId
      });
      if (type === 'text') {
        setShowFeedbackMessage(true);
      } else {
        setShowFeedbackImage(true);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setAppError("Failed to submit feedback. Please try again.");
    }
  };

  // Utility functions for UI
  const getResultBoxClasses = (result) => {
    if (!result) return 'bg-gray-100 border-gray-300';
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes('likely fake')) return 'bg-red-100 border-red-300 text-red-800';
    if (lowerResult.includes('likely genuine')) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  };

  const getResultIcon = (result) => {
    if (!result) return <Sparkles />;
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes('likely fake') || lowerResult.includes('uncertain')) return <AlertCircle />;
    return <CheckCircle />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-800 p-4 font-sans flex flex-col items-center justify-center">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

      <style>
        {`
          body { font-family: 'Inter', sans-serif; }
          .scroll-container { max-height: 50vh; overflow-y: auto; }
          .scroll-container::-webkit-scrollbar { width: 8px; }
          .scroll-container::-webkit-scrollbar-track { background-color: #f1f1f1; border-radius: 10px; }
          .scroll-container::-webkit-scrollbar-thumb { background-color: #888; border-radius: 10px; }
          .scroll-container::-webkit-scrollbar-thumb:hover { background-color: #555; }
        `}
      </style>

      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-6 md:p-10 mb-8 mt-8">
        <header className="flex flex-col items-center justify-center mb-10 text-indigo-700">
          <div className="flex items-center">
            <Sparkles className="h-10 w-10 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
              Fake Content Detector
            </h1>
          </div>
          <p className="mt-4 text-center text-gray-600 max-w-2xl">
            Leveraging AI to identify potentially harmful or misleading messages from SMS, WhatsApp, or social media.
          </p>
        </header>
        
        {appError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">{appError}</span>
          </div>
        )}
        
        {userId && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Your User ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-gray-700">{userId}</span>
          </p>
        )}

        {/* Dashboard Section (Global Counts) */}
        <div className="mb-10 p-6 bg-yellow-50 border border-yellow-200 rounded-xl shadow-inner">
          <div className="flex items-center justify-center mb-4 text-yellow-700">
            <LayoutDashboard className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-semibold">Global Detection Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-lg font-medium">Likely Fake</p>
              <p className="text-3xl font-bold text-red-600">{detectionCounts.fake}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-lg font-medium">Likely Genuine</p>
              <p className="text-3xl font-bold text-green-600">{detectionCounts.genuine}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
              <p className="text-gray-700 text-lg font-medium">Uncertain</p>
              <p className="text-3xl font-bold text-gray-600">{detectionCounts.uncertain}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            *These counts reflect all detections made by users of this app.
          </p>
        </div>

        {/* Main Analysis Sections */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          {/* Text Analysis Section */}
          <div className="lg:w-1/2 p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-inner flex flex-col">
            <div className="flex items-center mb-4 text-blue-700">
              <MessageSquareText className="h-6 w-6 mr-2" />
              <h2 className="text-2xl font-semibold">Analyze Text Message</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Paste any suspicious message (from WhatsApp, email, etc.) below to check for scams, phishing, or misinformation.
            </p>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[150px] text-gray-800 flex-grow transition-colors duration-200"
              placeholder="e.g., 'Congratulations! You've won a lottery...'"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={isMessageLoading || !isAuthReady}
            ></textarea>
            {messageError && (
              <div className="mt-4 p-3 flex items-center bg-red-100 border border-red-400 text-red-700 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="block sm:inline text-sm">{messageError}</span>
              </div>
            )}
            <button
              onClick={detectFakeMessage}
              className={`mt-6 px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg
                ${isMessageLoading || !isAuthReady ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
              disabled={isMessageLoading || !isAuthReady}
            >
              {isMessageLoading ? <><Loader className="mr-2" /> Analyzing...</> : 'Analyze Message'}
            </button>
            {messageResult && (
              <div className={`mt-6 p-4 border rounded-lg shadow-sm scroll-container ${getResultBoxClasses(messageResult)}`}>
                <div className="flex items-center text-lg font-bold mb-2">
                  {getResultIcon(messageResult)}
                  <h3 className="ml-2">Analysis Result:</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{messageResult}</p>
                {/* Feedback Loop for Text */}
                {!showFeedbackMessage && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-blue-700 font-medium mb-2">Was this assessment correct?</p>
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Optional: Explain why..."
                        value={messageFeedbackReason}
                        onChange={(e) => setMessageFeedbackReason(e.target.value)}
                        rows="2"
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback('text', messageInput, messageResult, 'Correct', messageFeedbackReason)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Yes
                        </button>
                        <button
                          onClick={() => handleFeedback('text', messageInput, messageResult, 'Incorrect', messageFeedbackReason)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {showFeedbackMessage && (
                  <p className="mt-4 text-green-700 font-medium">Thank you for your feedback! This helps improve the system.</p>
                )}
              </div>
            )}
          </div>

          {/* Image Analysis Section */}
          <div className="lg:w-1/2 p-6 bg-green-50 border border-green-200 rounded-xl shadow-inner flex flex-col">
            <div className="flex items-center mb-4 text-green-700">
              <Image className="h-6 w-6 mr-2" />
              <h2 className="text-2xl font-semibold">Analyze Image Message</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Upload any suspicious image to check for manipulation, deepfakes, or artificial generation.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4 file:rounded-full
                file:border-0 file:text-sm file:font-semibold
                file:bg-green-100 file:text-green-700
                hover:file:bg-green-200 cursor-pointer transition-colors duration-200"
              disabled={isImageLoading || !isAuthReady}
            />
            {imagePreviewUrl && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg flex-grow flex items-center justify-center">
                <img
                  src={imagePreviewUrl}
                  alt="Image Preview"
                  className="max-w-full max-h-[300px] h-auto rounded-lg shadow-md"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            {imageError && (
              <div className="mt-4 p-3 flex items-center bg-red-100 border border-red-400 text-red-700 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="block sm:inline text-sm">{imageError}</span>
              </div>
            )}
            <button
              onClick={detectFakeImage}
              className={`mt-6 px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg
                ${isImageLoading || !imageFile || !isAuthReady ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'}`}
              disabled={isImageLoading || !imageFile || !isAuthReady}
            >
              {isImageLoading ? <><Loader className="mr-2" /> Analyzing...</> : 'Analyze Image'}
            </button>
            {imageResult && (
              <div className={`mt-6 p-4 border rounded-lg shadow-sm scroll-container ${getResultBoxClasses(imageResult)}`}>
                <div className="flex items-center text-lg font-bold mb-2">
                  {getResultIcon(imageResult)}
                  <h3 className="ml-2">Analysis Result:</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{imageResult}</p>
                {/* Feedback Loop for Image */}
                {!showFeedbackImage && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-green-700 font-medium mb-2">Was this assessment correct?</p>
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                        placeholder="Optional: Explain why..."
                        value={imageFeedbackReason}
                        onChange={(e) => setImageFeedbackReason(e.target.value)}
                        rows="2"
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback('image', imagePreviewUrl, imageResult, 'Correct', imageFeedbackReason)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Yes
                        </button>
                        <button
                          onClick={() => handleFeedback('image', imagePreviewUrl, imageResult, 'Incorrect', imageFeedbackReason)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {showFeedbackImage && (
                  <p className="mt-4 text-green-700 font-medium">Thank you for your feedback! This helps improve the system.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 p-8 bg-gray-100 border border-gray-300 rounded-2xl shadow-xl">
          <div className="flex items-center justify-center mb-6 text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box-select h-8 w-8 mr-3"><path d="M5 3a2 2 0 0 0-2 2v2"/><path d="M3 17a2 2 0 0 0 2 2h2"/><path d="M17 21a2 2 0 0 0 2-2v-2"/><path d="M21 5a2 2 0 0 0-2-2h-2"/><rect width="7" height="7" x="8.5" y="8.5" rx="1"/></svg>
            <h2 class="text-3xl font-bold">How It Works</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 class="text-xl font-bold text-gray-700 mb-3 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Text Message Analysis
              </h3>
              <ol class="list-decimal list-inside text-gray-600 text-sm space-y-2">
                  <li>User pastes a message into the text box.</li>
                  <li>The text is sent to the Gemini AI model.</li>
                  <li>Gemini analyzes the message for linguistic patterns, urgent language, grammatical errors, and suspicious links.</li>
                  <li>A detailed assessment and reasoning are returned to the user.</li>
              </ol>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 class="text-xl font-bold text-gray-700 mb-3 flex items-center">
                <Image className="mr-2 h-5 w-5" />
                Image Message Analysis
              </h3>
              <ol class="list-decimal list-inside text-gray-600 text-sm space-y-2">
                  <li>User uploads a screenshot of a message.</li>
                  <li>The image is sent to the Gemini AI model.</li>
                  <li>Gemini performs Optical Character Recognition (OCR) to extract text from the image.</li>
                  <li>The model then analyzes both the extracted text and the visual elements for signs of manipulation.</li>
                  <li>An assessment based on both text and visual cues is returned.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Technologies Used Section */}
        <div class="mt-8 p-8 bg-gray-100 border border-gray-300 rounded-2xl shadow-xl">
          <div class="flex items-center justify-center mb-6 text-gray-800">
            <Briefcase className="h-8 w-8 mr-3" />
            <h2 class="text-3xl font-bold">Technologies Used</h2>
          </div>
          <div class="flex flex-wrap justify-center gap-4 text-sm font-semibold text-gray-700">
            <span class="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">React</span>
            <span class="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">Firebase (Firestore & Auth)</span>
            <span class="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">Tailwind CSS</span>
            <span class="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">Google Gemini API</span>
            <span class="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">JavaScript</span>
          </div>
        </div>

        {/* User-Specific Analysis History */}
        {userId && userAnalyses.length > 0 && (
          <div className="mt-10 p-6 bg-purple-50 border border-purple-200 rounded-xl shadow-inner">
            <div className="flex items-center justify-center mb-4 text-purple-700">
              <FileText className="h-6 w-6 mr-2" />
              <h2 className="text-2xl font-semibold">Your Recent Analyses</h2>
            </div>
            <div className="scroll-container bg-white rounded-xl shadow-sm border border-gray-200">
              {userAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <p className="text-sm text-gray-500 mb-1">
                    {analysis.timestamp ? new Date(analysis.timestamp.toDate()).toLocaleString() : 'Loading date...'}
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: analysis.type === 'text' ? '#bfdbfe' : '#d1fae5', color: analysis.type === 'text' ? '#1e40af' : '#065f46' }}>
                      {analysis.type === 'text' ? 'Text Analysis' : 'Image Analysis'}
                    </span>
                  </p>
                  <p className="font-medium text-gray-800 mb-2">
                    {analysis.type === 'text' ? `"${analysis.content.substring(0, 100)}${analysis.content.length > 100 ? '...' : ''}"` : 'Image Content'}
                  </p>
                  {analysis.type === 'image' && analysis.content && (
                    <img src={analysis.content} alt="Analyzed" className="max-w-[100px] h-auto rounded-md mb-2" />
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysis.aiAssessment}</p>
                  {analysis.userCorrection && (
                    <p className="text-xs mt-2 text-gray-600">
                      Your Feedback: <span className={`font-semibold ${analysis.userCorrection === 'Correct' ? 'text-green-600' : 'text-red-600'}`}>{analysis.userCorrection}</span>
                      {analysis.userReason && `: ${analysis.userReason}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {userAnalyses.length === 0 && (
              <p className="text-gray-500 text-center py-4">No past analyses found for your user ID.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
