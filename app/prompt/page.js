'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; // adjust path if needed

export default function Prompt() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [user, setUser] = useState(null);
  
  // Chat history states
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);

  const getAuthHeaders = useCallback(async (includeJson = false) => {
    const headers = {};
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
  }, []);

  // Load user
  // Load chat sessions
  const loadSessions = useCallback(async (userId) => {
    setSessionsLoading(true);
    try {
      if (!userId) return;
      const headers = await getAuthHeaders();
      const res = await fetch('/api/chat/sessions', { headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load sessions');
      }
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadSessions(user.id);
      }
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSessions(session.user.id);
      } else {
        setSessions([]);
        setCurrentSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSessions]);

  // Load messages for a session
  const loadMessages = async (sessionId) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`, { headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load messages');
      }
      if (data.messages) {
        const formattedMessages = data.messages.map(msg => ({
          role: msg.role,
          text: msg.content
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Create new session
  const createNewSession = async () => {
    try {
      const headers = await getAuthHeaders(true);
      if (!headers.Authorization) return null;
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          title: 'New Chat' 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session');
      }
      if (data.session) {
        setSessions(prev => [data.session, ...prev]);
        setCurrentSession(data.session);
        setMessages([]);
        return data.session;
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }

    return null;
  };

  // Delete session
  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete session');
      }
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Rename session title
  const renameSession = async (session, e) => {
    e.stopPropagation();
    const currentTitle = session.title || 'Untitled chat';
    const nextTitle = prompt('Rename this chat:', currentTitle);
    if (!nextTitle) return;

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle || trimmedTitle === currentTitle) return;

    try {
      const headers = await getAuthHeaders(true);
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: trimmedTitle,
          updateId: session.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rename session');
      }

      if (data.session) {
        setSessions(prev => prev.map(s => (s.id === session.id ? data.session : s)));
        if (currentSession?.id === session.id) {
          setCurrentSession(data.session);
        }
      }
    } catch (error) {
      console.error('Error renaming session:', error);
    }
  };

  // Select a session
  const selectSession = (session) => {
    setCurrentSession(session);
    loadMessages(session.id);
  };

  // Very strong auto-scroll to bottom
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;

    const forceScroll = () => {
      container.scrollTop = container.scrollHeight; // direct force
      container.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    forceScroll();
    const t1 = setTimeout(forceScroll, 200);
    const t2 = setTimeout(forceScroll, 500);
    const t3 = setTimeout(forceScroll, 1000); // covers very long responses

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [messages, loading]);

  // Voice setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        const preview = content.trim().substring(0, 300);
        setInput(prev => prev + `\n\n[Attached: ${file.name}]\n${preview}...`);
      }
    };
    reader.readAsText(file);
  };

// Save message to database
  const saveMessage = async (sessionId, role, content) => {
    try {
      const headers = await getAuthHeaders(true);
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          role,
          content
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save message');
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Send message
  const sendMessage = async (text = input.trim()) => {
    if (!text) return;

    const { data: { user: authUser } } = await supabase.auth.getUser();
    const activeUser = user || authUser;
    if (authUser && !user) {
      setUser(authUser);
    }

    // If user is logged in, require a session
    let sessionToUse = currentSession;
    if (activeUser && !sessionToUse) {
      sessionToUse = await createNewSession();
    }

    // If still no session (user not logged in), don't save to DB
    const sessionId = sessionToUse?.id;

    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiText = data.response?.trim() || 'No response received';

      const assistantMessage = { role: 'assistant', text: aiText };
      setMessages(prev => [...prev, assistantMessage]);

      // Save messages to database if user is logged in and session exists
      if (activeUser && sessionId) {
        await saveMessage(sessionId, 'user', text);
        await saveMessage(sessionId, 'assistant', aiText);
        
        // Update session title if it's the first message
        if (messages.length === 0) {
          const title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
          const headers = await getAuthHeaders(true);
          await fetch('/api/chat/sessions', {
            method: 'POST',
            headers,
            body: JSON.stringify({ 
              title,
              updateId: sessionId
            })
          });
        }

        await loadSessions(activeUser.id);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Could not connect'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick prompts
  const quickPrompts = [
    { emoji: '📚', label: 'Study Tips', text: 'Can you provide some effective study tips for students preparing for exams?' },
    { emoji: '💼', label: 'Career Advice', text: 'What are some career options for someone interested in technology and innovation?' },
    { emoji: '🌍', label: 'Global Opportunities', text: 'What are the best countries to study abroad for higher education in computer science?' },
    { emoji: '📝', label: 'Resume Help', text: 'Can you help me write a professional resume for a software engineering job?' },
    { emoji: '🎓', label: 'Scholarship Tips', text: 'How can I find and apply for scholarships effectively?' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-purple-700">edugude.ph</h1>

        {user && (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-100 hover:text-red-800"
          >
            Logout
          </button>
        )}
      </header>

      {/* Greeting */}
      <div className="text-center py-10">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          Hello {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'},
        </h2>
        <p className="text-xl text-gray-600 mt-2">
          When should we start?
        </p>
      </div>

      {/* Messages – user right, AI left */}
      {user && (
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">Chat History</p>
              <button
                onClick={createNewSession}
                className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
              >
                + New Chat
              </button>
            </div>

            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {sessionsLoading && (
                <p className="text-sm text-gray-500">Loading chats...</p>
              )}

              {!sessionsLoading && sessions.length === 0 && (
                <p className="text-sm text-gray-500">No saved chats yet.</p>
              )}

              {!sessionsLoading && sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 transition-colors ${
                    currentSession?.id === session.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {session.title || 'Untitled chat'}
                    </p>
                    {session.updated_at && (
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(session.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={(e) => renameSession(session, e)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:border-purple-300 hover:text-purple-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectSession(session);
                      }}
                      className="rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold text-white hover:bg-purple-700"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        ref={chatContainerRef}
        className="flex-1 w-full max-w-4xl mx-auto px-4 pb-32 overflow-y-auto"
      >
        {messages.length === 0 && (
          <p className="text-gray-500 text-center py-20">
            Start chatting or pick a quick topic below
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm animate-fade-in ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
              style={{ animationDuration: '1.2s' }} // longer fade = more noticeable
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {/* Input bar */}
          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-3 shadow-sm">
            {/* File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-600 hover:text-purple-700 text-2xl transition-transform hover:scale-110"
              title="Attach file"
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx"
            />

            {/* Voice */}
            <button
              onClick={toggleVoice}
              className={`text-2xl transition-transform ${
                isListening ? 'text-red-600 scale-110 animate-pulse' : 'text-gray-600 hover:text-purple-700 hover:scale-110'
              }`}
              title={isListening ? 'Stop voice' : 'Voice input'}
            >
              🎤
            </button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-black placeholder-gray-500"
              disabled={loading}
            />

            {/* Send */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={`
                flex items-center justify-center 
                w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5
                rounded-full font-medium text-white transition-all
                whitespace-nowrap
                ${loading || !input.trim()
                  ? 'bg-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 active:scale-95 sm:hover:scale-105 sm:hover:shadow-md'
                }
              `}
              style={{
                minWidth: '3rem',
                minHeight: '3rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <span className="animate-pulse text-lg sm:text-base">…</span>
              ) : (
                <span className="px-1">Send</span>
              )}
            </button>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {quickPrompts.map((btn, i) => (
              <button
                key={i}
                onClick={() => sendMessage(btn.text)}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  loading
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-900 hover:shadow-lg hover:-translate-y-1 active:scale-95'
                }`}
              >
                {btn.emoji} {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


