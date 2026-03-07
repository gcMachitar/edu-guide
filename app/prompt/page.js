'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PencilIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function PaperclipIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M21.4 11.6l-8.8 8.8a6 6 0 1 1-8.5-8.5l8.8-8.8a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 1 1-2.8-2.8l8.5-8.5" />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-8 8" />
    </svg>
  );
}

function MicIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
    </svg>
  );
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function Prompt() {
  const MAX_ATTACHMENTS = 6;
  const MAX_FILE_SIZE_MB = 8;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [attachmentStatus, setAttachmentStatus] = useState('');
  const [attachmentErrors, setAttachmentErrors] = useState([]);
  const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const sessionsRef = useRef([]);
  const lastSessionsLoadRef = useRef(0);
  const loadedUserIdRef = useRef(null);

  const getAuthHeaders = useCallback(async (includeJson = false) => {
    const headers = {};
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
  }, []);

  const loadSessions = useCallback(
    async (userId, opts = {}) => {
      const { force = false } = opts;
      if (!userId) return;

      const now = Date.now();
      const recentlyLoaded =
        loadedUserIdRef.current === userId && now - lastSessionsLoadRef.current < 15000;
      if (!force && recentlyLoaded) return;

      setSessionsLoading(sessionsRef.current.length === 0);
      try {
        setGlobalError('');
        const headers = await getAuthHeaders();
        const res = await fetch('/api/chat/sessions', { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load sessions');
        }

        if (data.sessions) {
          setSessions(data.sessions);
          sessionsRef.current = data.sessions;
          loadedUserIdRef.current = userId;
          lastSessionsLoadRef.current = Date.now();
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        setGlobalError(error.message || 'Could not load saved chats right now.');
      } finally {
        setSessionsLoading(false);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('eduguide-theme');
    const savedSidebar = localStorage.getItem('eduguide-sidebar-collapsed');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    setIsSidebarCollapsed(savedSidebar === 'true');
    setIsDesktop(window.innerWidth >= 1024);
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: activeUser },
      } = await supabase.auth.getUser();
      setUser(activeUser);
      if (activeUser) {
        loadSessions(activeUser.id);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          loadSessions(session.user.id, { force: true });
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSessions([]);
        setCurrentSession(null);
        setMessages([]);
        sessionsRef.current = [];
        loadedUserIdRef.current = null;
        setGlobalError('');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSessions]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isClientReady) return;
    localStorage.setItem('eduguide-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, isClientReady]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isClientReady) return;
    localStorage.setItem('eduguide-sidebar-collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed, isClientReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadMessages = async (sessionId) => {
    try {
      setGlobalError('');
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load messages');
      }

      if (data.messages) {
        setMessages(
          data.messages.map((msg) => ({
            role: msg.role,
            text: msg.content,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setGlobalError(error.message || 'Could not load chat messages.');
    }
  };

  const createNewSession = async () => {
    try {
      setGlobalError('');
      const headers = await getAuthHeaders(true);
      if (!headers.Authorization) return null;

      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      if (data.session) {
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSession(data.session);
        setMessages([]);
        return data.session;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setGlobalError(error.message || 'Could not create a new chat.');
    }

    return null;
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      setGlobalError('');
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete session');
      }

      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setGlobalError(error.message || 'Could not delete that chat.');
    }
  };

  const renameSession = async (session, e) => {
    e.stopPropagation();
    const currentTitle = session.title || 'Untitled chat';
    const nextTitle = prompt('Rename this chat:', currentTitle);
    if (!nextTitle) return;

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle || trimmedTitle === currentTitle) return;

    try {
      setGlobalError('');
      const headers = await getAuthHeaders(true);
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: trimmedTitle,
          updateId: session.id,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to rename session');
      }

      if (data.session) {
        setSessions((prev) => prev.map((s) => (s.id === session.id ? data.session : s)));
        if (currentSession?.id === session.id) {
          setCurrentSession(data.session);
        }
      }
    } catch (error) {
      console.error('Error renaming session:', error);
      setGlobalError(error.message || 'Could not rename that chat.');
    }
  };

  const selectSession = (session) => {
    setCurrentSession(session);
    loadMessages(session.id);
  };

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const forceScroll = () => {
      container.scrollTop = container.scrollHeight;
      container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    forceScroll();
    const t1 = setTimeout(forceScroll, 200);
    const t2 = setTimeout(forceScroll, 500);
    const t3 = setTimeout(forceScroll, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }

    setIsListening((prev) => !prev);
  };

  const readPdfText = async (file) => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages = [];
    for (let p = 1; p <= pdf.numPages; p += 1) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((i) => i.str).join(' ');
      pages.push(pageText);
    }
    return pages.join('\n').trim();
  };

  const readDocxText = async (file) => {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return (result.value || '').trim();
  };

  const imageToDataUrl = async (file) => {
    const bitmap = await createImageBitmap(file);
    const maxSize = 1280;
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.82);
  };

  const processFiles = async (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    const slotsLeft = Math.max(0, MAX_ATTACHMENTS - pendingAttachments.length);
    const workingFiles = incomingFiles.slice(0, slotsLeft);
    const errors = [];
    const attached = [];

    if (incomingFiles.length > slotsLeft) {
      errors.push(`Only ${MAX_ATTACHMENTS} attachments are allowed.`);
    }

    setIsProcessingAttachments(true);
    setAttachmentErrors([]);
    setAttachmentStatus(`Processing ${workingFiles.length} file(s)...`);

    for (const file of workingFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: file is too large (max ${MAX_FILE_SIZE_MB}MB).`);
        continue;
      }

      const lowerName = file.name.toLowerCase();
      const mime = file.type || '';

      try {
        if (mime.startsWith('text/') || /\.(txt|md|csv|json|js|ts|py|java|html|css)$/i.test(lowerName)) {
          const raw = await file.text();
          const content = raw.trim().slice(0, 8000);
          if (!content) {
            errors.push(`${file.name}: text file appears empty or unreadable.`);
            continue;
          }
          attached.push({ type: 'text', name: file.name, content });
          continue;
        }

        if (mime === 'application/pdf' || lowerName.endsWith('.pdf')) {
          const content = (await readPdfText(file)).trim().slice(0, 8000);
          if (!content) {
            errors.push(`${file.name}: could not extract readable text from PDF.`);
            continue;
          }
          attached.push({ type: 'text', name: file.name, content });
          continue;
        }

        if (
          lowerName.endsWith('.docx') ||
          mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const content = (await readDocxText(file)).trim().slice(0, 8000);
          if (!content) {
            errors.push(`${file.name}: could not extract readable text from DOCX.`);
            continue;
          }
          attached.push({ type: 'text', name: file.name, content });
          continue;
        }

        if (mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(lowerName)) {
          const dataUrl = await imageToDataUrl(file);
          attached.push({ type: 'image', name: file.name, dataUrl });
          continue;
        }

        errors.push(`${file.name}: unsupported file type.`);
      } catch (error) {
        console.error(error);
        errors.push(`${file.name}: unreadable file or processing failed.`);
      }
    }

    if (attached.length > 0) {
      setPendingAttachments((prev) => [...prev, ...attached]);
      setAttachmentStatus(`${attached.length} file(s) attached. Add a prompt or send files directly.`);
    } else if (errors.length > 0) {
      setAttachmentStatus('No files were attached.');
    } else {
      setAttachmentStatus('');
    }

    setAttachmentErrors(errors);
    setIsProcessingAttachments(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    await processFiles(files);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    await processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const saveMessage = async (sessionId, role, content) => {
    try {
      const headers = await getAuthHeaders(true);
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          role,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save message');
      }
    } catch (error) {
      console.error('Error saving message:', error);
      setGlobalError('Message was sent, but saving chat history failed.');
    }
  };

  const sendMessage = async (text = input.trim()) => {
    const trimmed = text.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const activeUser = user || authUser;
    if (authUser && !user) {
      setUser(authUser);
    }

    let sessionToUse = currentSession;
    if (activeUser && !sessionToUse) {
      sessionToUse = await createNewSession();
    }

    const sessionId = sessionToUse?.id;

    const outboundMessage =
      trimmed || 'Please analyze the attached file(s) and summarize the key points clearly.';
    const userFacingMessage =
      trimmed ||
      `[Sent ${pendingAttachments.length} attachment(s)] Please analyze the attached files.`;
    const localAttachmentPreview = pendingAttachments.map((a) =>
      a.type === 'image'
        ? { type: 'image', name: a.name, dataUrl: a.dataUrl }
        : { type: 'text', name: a.name }
    );

    const userMessage = { role: 'user', text: userFacingMessage, attachments: localAttachmentPreview };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setGlobalError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: outboundMessage, attachments: pendingAttachments }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiText = data.response?.trim() || 'No response received';
      setMessages((prev) => [...prev, { role: 'assistant', text: aiText }]);
      setPendingAttachments([]);
      setAttachmentStatus('');

      if (activeUser && sessionId) {
        await saveMessage(sessionId, 'user', userFacingMessage);
        await saveMessage(sessionId, 'assistant', aiText);

        if (messages.length === 0) {
          const baseTitle = trimmed || (pendingAttachments[0]?.name ? `File: ${pendingAttachments[0].name}` : 'New chat');
          const title = baseTitle.substring(0, 50) + (baseTitle.length > 50 ? '...' : '');
          const headers = await getAuthHeaders(true);
          await fetch('/api/chat/sessions', {
            method: 'POST',
            headers,
            body: JSON.stringify({ title, updateId: sessionId }),
          });
        }

        await loadSessions(activeUser.id, { force: true });
      }
    } catch (err) {
      console.error(err);
      setGlobalError(err.message || 'Could not connect to EduGuide right now.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Could not connect'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { icon: 'study', label: 'Study Tips', text: 'Can you provide effective study tips for students preparing for exams?' },
    { icon: 'career', label: 'Career Advice', text: 'What are career options for someone interested in technology and innovation?' },
    { icon: 'global', label: 'Global Opportunities', text: 'What are the best countries to study computer science abroad?' },
    { icon: 'resume', label: 'Resume Help', text: 'Can you help me write a professional resume for a software engineering role?' },
    { icon: 'scholarship', label: 'Scholarship Tips', text: 'How can I find and apply for scholarships effectively?' },
  ];

  const PromptIcon = ({ icon }) => {
    if (icon === 'study') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    }
    if (icon === 'career') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      );
    }
    if (icon === 'global') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      );
    }
    if (icon === 'resume') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h8" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
        <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
      </svg>
    );
  };

  const renderInline = (text) => {
    const boldSplit = String(text).split(/(\*\*[^*]+\*\*)/g);
    return boldSplit.map((part, idx) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={`b-${idx}`}>{part.slice(2, -2)}</strong>;
      }
      return <span key={`t-${idx}`}>{part}</span>;
    });
  };

  const renderAssistantText = (text) => {
    if (!text) return null;

    const normalized = String(text)
      .replace(/\r\n/g, '\n')
      .replace(/\s+(\d+\.\s+\*\*)/g, '\n$1')
      .replace(/\s+\*\s+/g, '\n- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
    const blocks = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList });
        currentList = [];
      }
    };

    for (const line of lines) {
      const numbered = line.match(/^(\d+)\.\s+(.*)$/);
      const bullet = line.match(/^[-*]\s+(.*)$/);

      if (numbered) {
        currentList.push(numbered[2]);
        continue;
      }
      if (bullet) {
        currentList.push(bullet[1]);
        continue;
      }

      flushList();
      blocks.push({ type: 'paragraph', text: line });
    }
    flushList();

    return blocks.map((block, idx) => {
      if (block.type === 'list') {
        return (
          <ul key={`l-${idx}`} className="my-2 list-disc space-y-1 pl-5">
            {block.items.map((item, itemIdx) => (
              <li key={`li-${idx}-${itemIdx}`}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={`p-${idx}`} className="my-2">
          {renderInline(block.text)}
        </p>
      );
    });
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col ${isLight ? 'bg-violet-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <div
        className={`absolute inset-0 -z-10 ${
          isLight
            ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(167,139,250,.35),transparent_35%),radial-gradient(circle_at_75%_10%,rgba(196,181,253,.35),transparent_35%),linear-gradient(180deg,#f5f3ff_0%,#ede9fe_45%,#e2e8f0_100%)]'
            : 'bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,.35),transparent_35%),radial-gradient(circle_at_75%_10%,rgba(168,85,247,.24),transparent_35%),linear-gradient(180deg,#160a2f_0%,#1f1147_45%,#0f172a_100%)]'
        }`}
      />

      <header
        className={`sticky top-0 z-20 border-b px-4 py-4 backdrop-blur md:px-6 ${
          isLight ? 'border-violet-200 bg-white/75' : 'border-violet-300/20 bg-slate-950/75'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
          <Link href="/" className={`inline-flex items-center gap-2.5 text-xl font-bold md:text-2xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Image src="/edu.png" alt="EduGuide PH logo" width={44} height={44} className="h-10 w-10 object-contain md:h-11 md:w-11" />
            <span>EduGuide PH</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isLight
                  ? 'border border-violet-300 bg-white text-violet-700 hover:bg-violet-100'
                  : 'border border-violet-300/30 bg-violet-900/35 text-violet-100 hover:border-violet-300/50'
              }`}
            >
                <span className="inline-flex items-center gap-1.5">
                  {isLight ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                  <span>{isLight ? 'Night' : 'Light'}</span>
                </span>
            </button>

            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  isLight
                    ? 'border-violet-300 bg-white text-violet-700 hover:bg-violet-100'
                    : 'border-violet-300/30 bg-violet-900/35 text-violet-100 hover:border-violet-300/50 hover:bg-violet-900/55'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LogoutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  isLight
                    ? 'border-violet-300 bg-white text-violet-700 hover:bg-violet-100'
                    : 'border-violet-300/30 bg-violet-900/35 text-violet-100 hover:border-violet-300/50 hover:bg-violet-900/55'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <LockIcon className="h-4 w-4" />
                  <span>Sign in</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1800px] flex-1 min-h-0 flex-col gap-3 px-2 pb-3 pt-3 sm:px-4 md:px-6">
        <div
          className={`rounded-2xl border p-4 text-center shadow-xl backdrop-blur md:p-5 ${
            isLight
              ? 'border-violet-200 bg-white shadow-violet-200/50'
              : 'border-violet-300/20 bg-violet-950/35 shadow-violet-900/35'
          }`}
        >
          <h2 className={`text-2xl font-bold md:text-3xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Hello {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Student'}
          </h2>
          <p className={`mt-1 text-sm md:text-base ${isLight ? 'text-violet-700' : 'text-violet-100/80'}`}>What do you want to learn today?</p>
        </div>
        {globalError && (
          <div
            className={`rounded-xl border px-4 py-2 text-sm ${
              isLight
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-rose-300/40 bg-rose-900/20 text-rose-100'
            }`}
          >
            {globalError}
          </div>
        )}
        <div className={`grid flex-1 min-h-0 gap-3 ${isSidebarCollapsed && isDesktop ? 'lg:grid-cols-[72px_minmax(0,1fr)]' : 'lg:grid-cols-[340px_minmax(0,1fr)]'}`}>
          <aside
            className={`self-start rounded-2xl border p-3 shadow-lg backdrop-blur min-h-0 ${
              isLight
                ? 'border-violet-200 bg-white shadow-violet-200/50'
                : 'border-violet-300/20 bg-violet-950/30 shadow-violet-900/30'
            }`}
          >
            <div className="mb-3 hidden items-center justify-end lg:flex">
              <button
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                className={`rounded-md border p-1.5 transition ${
                  isLight
                    ? 'border-violet-300 text-violet-700 hover:bg-violet-100'
                    : 'border-violet-300/30 text-violet-100 hover:border-violet-300/50'
                }`}
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
              </button>
            </div>

            {isSidebarCollapsed && isDesktop ? (
              <div className="hidden min-h-[96px] flex-col items-center gap-3 pt-2 lg:flex">
                {user ? (
                  <button
                    onClick={createNewSession}
                    className={`rounded-full p-2 transition ${
                      isLight ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-violet-400 text-slate-950 hover:bg-violet-300'
                    }`}
                    title="New chat"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={`rounded-full p-2 transition ${
                      isLight ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-violet-400 text-slate-950 hover:bg-violet-300'
                    }`}
                    title="Sign in"
                  >
                    <LockIcon className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ) : user ? (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={`text-sm font-semibold ${isLight ? 'text-violet-700' : 'text-violet-100'}`}>Saved Chats</p>
                  <button
                    onClick={createNewSession}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isLight ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-violet-400 text-slate-950 hover:bg-violet-300'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>New</span>
                    </span>
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto pr-1 max-h-[28vh] lg:max-h-[calc(100vh-280px)]">
                  {sessionsLoading && sessions.length === 0 && <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-violet-100/70'}`}>Loading chats...</p>}
                  {!sessionsLoading && sessions.length === 0 && (
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-violet-100/70'}`}>No saved chats yet.</p>
                  )}

                  {!sessionsLoading &&
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => selectSession(session)}
                        className={`cursor-pointer rounded-xl border px-3 py-2 transition-colors ${
                          currentSession?.id === session.id
                            ? isLight
                              ? 'border-violet-300 bg-violet-100/70'
                              : 'border-violet-300/50 bg-violet-500/15'
                            : isLight
                              ? 'border-violet-200 bg-white hover:border-violet-300 hover:bg-violet-50'
                              : 'border-violet-300/20 bg-slate-950/45 hover:border-violet-300/45 hover:bg-violet-900/30'
                        }`}
                      >
                        <p className={`truncate text-sm font-medium ${isLight ? 'text-slate-700' : 'text-violet-100'}`}>{session.title || 'Untitled chat'}</p>
                        {session.updated_at && (
                          <p className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-violet-100/65'}`}>
                            {new Date(session.updated_at).toLocaleString()}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={(e) => renameSession(session, e)}
                            className={`rounded-md border px-2 py-1 text-xs font-medium ${
                              isLight
                                ? 'border-violet-300 text-violet-700 hover:bg-violet-100'
                                : 'border-violet-300/30 text-violet-100 hover:border-violet-300/50'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <PencilIcon className="h-3 w-3" />
                              <span>Edit</span>
                            </span>
                          </button>
                          <button
                            onClick={(e) => deleteSession(session.id, e)}
                            className={`rounded-md border px-2 py-1 text-xs font-medium ${
                              isLight
                                ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                                : 'border-rose-300/40 text-rose-100 hover:bg-rose-500/15'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <TrashIcon className="h-3 w-3" />
                              <span>Delete</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className={`text-sm font-semibold ${isLight ? 'text-violet-700' : 'text-violet-100'}`}>Guest Mode</p>
                <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-violet-100/80'}`}>
                  You can chat without signing in. Log in only if you want saved chat history and personalized features.
                </p>
                <Link
                  href="/login"
                  className={`inline-block rounded-lg px-3 py-2 text-sm font-semibold ${
                    isLight ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-violet-400 text-slate-950 hover:bg-violet-300'
                  }`}
                >
                  Sign in for saved chats
                </Link>
              </div>
            )}
          </aside>

          <section
            className={`flex min-h-0 flex-col rounded-2xl border shadow-lg backdrop-blur ${
              isLight
                ? 'border-violet-200 bg-white shadow-violet-200/50'
                : 'border-violet-300/20 bg-violet-950/30 shadow-violet-900/30'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragOver && (
              <div
                className={`mx-3 mt-3 rounded-xl border border-dashed p-3 text-center text-sm ${
                  isLight ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-violet-300/50 bg-violet-900/30 text-violet-100'
                }`}
              >
                Drop files here to attach. They will not be sent until you press Send.
              </div>
            )}
            <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-4 md:px-6">
              {messages.length === 0 && (
                <p className={`py-20 text-center ${isLight ? 'text-slate-500' : 'text-violet-100/70'}`}>
                  Start chatting or pick a quick topic below
                </p>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="flex max-w-[95%] items-start gap-2 md:max-w-[88%]">
                      <Image
                        src="/edu.png"
                        alt="EduGuide PH"
                        width={34}
                        height={34}
                        className="mt-1 h-8 w-8 shrink-0 rounded-md object-contain md:h-9 md:w-9"
                      />
                      <div
                        className={`rounded-2xl p-3.5 md:p-4 shadow-sm animate-fade-in ${
                          isLight
                            ? 'border border-violet-200 bg-white text-slate-700'
                            : 'border border-violet-300/20 bg-violet-950/35 text-violet-100'
                        }`}
                        style={{ animationDuration: '1.2s' }}
                      >
                        {(() => {
                          const isLongReply = (msg.text || '').length > 680;
                          const isExpanded = Boolean(expandedReplies[i]);
                          return (
                            <>
                              <p className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-violet-700' : 'text-violet-200/80'}`}>
                                EduGuide
                              </p>
                              <div className="relative">
                                <div className={`text-sm leading-7 md:text-[15px] ${!isExpanded && isLongReply ? 'max-h-56 overflow-hidden' : ''}`}>
                                  {renderAssistantText(msg.text)}
                                </div>
                                {!isExpanded && isLongReply && (
                                  <div
                                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-14 ${
                                      isLight
                                        ? 'bg-gradient-to-t from-white via-white/95 to-transparent'
                                        : 'bg-gradient-to-t from-[#22114a] via-[#22114a]/90 to-transparent'
                                    }`}
                                  />
                                )}
                              </div>
                              {isLongReply && (
                                <button
                                  onClick={() =>
                                    setExpandedReplies((prev) => ({
                                      ...prev,
                                      [i]: !isExpanded,
                                    }))
                                  }
                                  className={`mt-2 text-xs font-semibold ${
                                    isLight ? 'text-violet-700 hover:text-violet-900' : 'text-violet-200 hover:text-violet-100'
                                  }`}
                                >
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[92%] md:max-w-[85%] rounded-2xl p-3.5 md:p-4 shadow-sm animate-fade-in ${
                        isLight ? 'bg-violet-600 text-white' : 'bg-violet-400 text-slate-950'
                      }`}
                      style={{ animationDuration: '1.2s' }}
                    >
                      {msg.text}
                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.attachments.map((a, idx) =>
                            a.type === 'image' && a.dataUrl ? (
                              <Image
                                key={`${a.name}-${idx}`}
                                src={a.dataUrl}
                                alt={a.name || `attachment-${idx + 1}`}
                                width={96}
                                height={96}
                                unoptimized
                                className="h-24 w-24 rounded-lg border border-white/20 object-cover"
                              />
                            ) : (
                              <span
                                key={`${a.name}-${idx}`}
                                className="rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs text-inherit"
                              >
                                File: {a.name}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              className={`border-t p-3 md:p-4 ${
                isLight ? 'border-violet-200 bg-white/90' : 'border-violet-300/20 bg-slate-950/60'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm ${
                    isLight ? 'border-violet-200 bg-white' : 'border-violet-300/25 bg-violet-950/35'
                  }`}
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                      isLight
                        ? 'border-violet-300 text-violet-700 hover:bg-violet-100'
                        : 'border-violet-300/25 text-violet-100 hover:border-violet-300/45'
                    }`}
                    title="Attach file"
                  >
                    <span className="inline-flex items-center gap-1">
                      <PaperclipIcon className="h-3.5 w-3.5" />
                      <span>File</span>
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.md,.csv,.json,.pdf,.docx,image/*"
                    multiple
                  />

                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                      isLight
                        ? 'border-violet-300 text-violet-700 hover:bg-violet-100'
                        : 'border-violet-300/25 text-violet-100 hover:border-violet-300/45'
                    }`}
                    title="Attach image"
                  >
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Image</span>
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />

                  <button
                    onClick={toggleVoice}
                    disabled={!voiceSupported}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                      !voiceSupported || isProcessingAttachments
                        ? 'cursor-not-allowed opacity-50'
                        : isListening
                        ? isLight
                          ? 'border-rose-300 text-rose-600'
                          : 'border-rose-300/50 text-rose-100'
                        : isLight
                          ? 'border-violet-300 text-violet-700 hover:bg-violet-100'
                          : 'border-violet-300/25 text-violet-100 hover:border-violet-300/45'
                    }`}
                    title={isListening ? 'Stop voice input' : 'Start voice input'}
                  >
                    <span className="inline-flex items-center gap-1">
                      <MicIcon className={`h-3.5 w-3.5 ${isListening ? 'animate-pulse' : ''}`} />
                      <span>{isListening ? 'Listening...' : 'Voice'}</span>
                    </span>
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                    placeholder="Type your message..."
                    className={`flex-1 bg-transparent px-2 text-sm outline-none ${
                      isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-violet-100/45'
                    }`}
                    disabled={loading || isProcessingAttachments}
                  />

                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || isProcessingAttachments || (!input.trim() && pendingAttachments.length === 0)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      loading || isProcessingAttachments || (!input.trim() && pendingAttachments.length === 0)
                        ? isLight
                          ? 'cursor-not-allowed bg-violet-200 text-slate-500'
                          : 'cursor-not-allowed bg-violet-300/40 text-slate-900/70'
                        : isLight
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : 'bg-violet-400 text-slate-950 hover:bg-violet-300'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <SendIcon className={`h-3.5 w-3.5 ${loading ? 'animate-pulse' : ''}`} />
                      <span>{isProcessingAttachments ? 'Processing...' : loading ? 'Sending...' : 'Send'}</span>
                    </span>
                  </button>
                </div>

                {!!attachmentStatus && (
                  <p className={`text-xs ${isLight ? 'text-violet-700' : 'text-violet-200/90'}`}>{attachmentStatus}</p>
                )}

                {attachmentErrors.length > 0 && (
                  <div className={`rounded-lg border px-3 py-2 text-xs ${isLight ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-rose-300/40 bg-rose-900/20 text-rose-100'}`}>
                    {attachmentErrors.slice(0, 4).map((err, i) => (
                      <p key={`${err}-${i}`}>{err}</p>
                    ))}
                    {attachmentErrors.length > 4 && <p>...and {attachmentErrors.length - 4} more.</p>}
                  </div>
                )}

                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {pendingAttachments.map((a, idx) => (
                      <span
                        key={`${a.name}-${idx}`}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                          isLight
                            ? 'border-violet-300 bg-violet-50 text-violet-700'
                            : 'border-violet-300/30 bg-violet-900/25 text-violet-100'
                        }`}
                      >
                        {a.type === 'image' ? 'Image' : 'Text'}: {a.name}
                        <button
                          onClick={() =>
                            setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="ml-1 rounded-full px-1 hover:bg-black/10"
                          title="Remove attachment"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {pendingAttachments.some((a) => a.type === 'image' && a.dataUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments
                      .filter((a) => a.type === 'image' && a.dataUrl)
                      .map((a, idx) => (
                        <Image
                          key={`preview-${a.name}-${idx}`}
                          src={a.dataUrl}
                          alt={a.name || `preview-${idx + 1}`}
                          width={80}
                          height={80}
                          unoptimized
                          className={`h-20 w-20 rounded-lg border object-cover ${
                            isLight ? 'border-violet-300' : 'border-violet-300/30'
                          }`}
                        />
                      ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                  {quickPrompts.map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(btn.text)}
                      disabled={loading || isProcessingAttachments}
                      className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                        loading || isProcessingAttachments
                          ? isLight
                            ? 'cursor-not-allowed bg-violet-200 text-slate-500'
                            : 'cursor-not-allowed bg-violet-300/30 text-violet-100/70'
                          : isLight
                            ? 'border border-violet-300 bg-white text-violet-700 hover:bg-violet-100'
                            : 'border border-violet-300/25 bg-violet-950/35 text-violet-100 hover:border-violet-300/50 hover:bg-violet-900/45'
                      }`}
                    >
                      <PromptIcon icon={btn.icon} />
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


