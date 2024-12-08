import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Paper, IconButton } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SendIcon from '@mui/icons-material/Send';
import CustomEditIcon from './CustomEditIcon'; // Custom pencil icon
import Loader from './Loader'; // Custom loader component
import Prism from 'prismjs'; // For syntax highlighting
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for code highlighting
import '../styles.css';

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const conversationEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
          setPrompt(prev => prev + ' ' + transcript);
        }
      };

      recognition.onend = () => {
        if (listening) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [listening]);

  useEffect(() => {
    scrollToBottom();
    Prism.highlightAll();
  }, [conversationHistory]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    setError('');
    setLoadingMessage('');

    // Clear existing message timeouts
    clearTimeout(messageTimeoutRef.current);
    let messageIndex = 0;

    const showMessage = (message, duration) => {
      setLoadingMessage(message);
      messageTimeoutRef.current = setTimeout(() => {
        messageIndex += 1;
        if (messageIndex === 1) {
          showMessage("Thank you for your patience; your code is being generated.", 60000);
        } else if (messageIndex === 2) {
          showMessage("Your code is being prepared. Please wait a moment.", 80000);
        } else if (messageIndex === 3) {
          setLoadingMessage('Your request is being processed. Hang tight!');
        }
      }, duration);
    };

    // Delay the first message by 30 seconds
    messageTimeoutRef.current = setTimeout(() => {
      showMessage("Generating code... Please wait.", 30000);
    }, 30000);

    try {
      const response = await axios.post('http://localhost:3000/generate-text', { prompt });
      if (response.data && response.data.results && response.data.results.length > 0) {
        const newCodeBlock = {
          prompt,
          code: response.data.results[0].generated_text
        };
        setConversationHistory([...conversationHistory, newCodeBlock]);
        setPrompt('');
      } else {
        setError('Server response does not contain the expected data.');
      }
    } catch (err) {
      setError('Failed to generate code. Please try again.');
    }

    setLoading(false);
    clearTimeout(messageTimeoutRef.current);
    setLoadingMessage('');
  };


  const handleSpeechToggle = () => {
    const recognition = recognitionRef.current;
    if (listening) {
      recognition.stop();
      clearInterval(recordingIntervalRef.current);
      setRecordingDuration(0);
    } else {
      recognition.start();
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    setListening(!listening);
  };

  const handleSend = () => {
    if (prompt.trim()) {
      handleGenerateCode();
    }
  };

  const handleRegenerate = (index) => {
    setPrompt(conversationHistory[index].prompt);
    setConversationHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditPrompt = (index) => {
    setPrompt(conversationHistory[index].prompt);
  };

  const getLanguageClass = (language) => {
    switch (language) {
      case 'javascript':
        return 'language-js';
      case 'cpp':
        return 'language-cpp';
      case 'php':
        return 'language-php';
      case 'java':
        return 'language-java';
      case 'python':
        return 'language-python';
      case 'react':
        return 'language-js'; // Using JS for React
      case 'dart':
        return 'language-dart';
      case 'csharp':
        return 'language-csharp';
      case 'golang':
        return 'language-go';
      case 'sql':
        return 'language-sql';
      case 'c':
        return 'language-c';
      default:
        return 'language-js';
    }
  };

  return (
    <Container sx={{ mt: 4 }} className="container">
      <Typography variant="h4" align="center" gutterBottom className="header">Wascoder</Typography>

      <Box sx={{ height: '50vh', overflowY: 'auto', mb: 3 }} className="chat-container">

        {conversationHistory.map((block, index) => (
          <Paper key={index} sx={{ p: 3, mb: 2, backgroundColor: '#2A2A2A' }} className="response-container">
            <Typography variant="body1" className="prompt-text" sx={{ color: '#E0E0E0' }}><strong>Prompt:</strong> {block.prompt}</Typography>
            <pre className="code-block">
              <code className={getLanguageClass(block.language || 'javascript')}>
                {block.code}
              </code>
            </pre>
            <CopyToClipboard text={block.code}>
              <Button variant="contained" color="primary" sx={{ mt: 1 }}>Copy</Button>
            </CopyToClipboard>
            <Button variant="outlined" sx={{ mt: 1, ml: 1 }} onClick={() => handleRegenerate(index)}>Regenerate</Button>
            <Button variant="outlined" sx={{ mt: 1, ml: 1, mr:1 }} onClick={() => handleEditPrompt(index)} endIcon={<CustomEditIcon />} color="primary">
              Edit
            </Button>
          </Paper>
        ))}
        <div ref={conversationEndRef} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <TextField
          label="Enter your prompt"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={prompt}
          color='primary'
          onChange={(e) => setPrompt(e.target.value)}
          sx={{
            mb: 2,
            mt: 2,
            backgroundColor: '#333',
            color: '#E0E0E0',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#4A90E2',
              },
              '&:hover fieldset': {
                borderColor: '#4A90E2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4A90E2',
              },
              '& input': {
                color: 'beige',
              },
            },
          }}
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <IconButton onClick={handleSpeechToggle} sx={{ mb: 1 }}>
            {listening ? <StopCircleIcon sx={{ color: '#E53935' }} /> : <KeyboardVoiceIcon sx={{ color: '#4A90E2' }} />}
          </IconButton>
          {listening && (
            <Typography variant="body2" sx={{ color: '#B3B3B3' }}>
               {recordingDuration} sec
            </Typography>
          )}

          {loading ? (
            <Loader size="small" />
          ) : (
            <IconButton onClick={handleSend}>
              <SendIcon sx={{ color: '#4A90E2' }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {loadingMessage && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#1C1C1E', borderRadius: 2 }}>
          <Typography sx={{ color: '#B3B3B3' }}>{loadingMessage}</Typography>
        </Paper>
      )}
      {error && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#FFCCCB', borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CodeGenerator;
