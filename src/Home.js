import React, { useState } from 'react';
import axios from 'axios';
import CodeDisplay from '../components/CodeDisplay';
import { Box, Button, TextField, Typography } from '@mui/material';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');

  const fetchCode = async () => {
    try {
      const response = await axios.post('http://localhost:3000/generate-text', {
        prompt: prompt,
      });
      setCode(response.data.results[0].generated_text);
    } catch (error) {
      console.error('Error fetching code:', error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Generate Code
      </Typography>
      <TextField
        label="Prompt"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="primary" onClick={fetchCode}>
        Generate
      </Button>
      {code && <CodeDisplay code={code} />}
    </Box>
  );
};

export default Home;
