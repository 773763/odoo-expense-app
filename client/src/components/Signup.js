import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', country: '' });
  const navigate = useNavigate();

  const { name, email, password, country } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/signup/admin', formData);
      alert('Signup Successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Error in Signup: ' + (err.response?.data?.msg || 'Server Error'));
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Admin Sign Up</Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Name" name="name" value={name} onChange={onChange} autoFocus />
          <TextField margin="normal" required fullWidth label="Email Address" name="email" value={email} onChange={onChange} />
          <TextField margin="normal" required fullWidth label="Password" name="password" type="password" value={password} onChange={onChange} />
          <TextField margin="normal" required fullWidth label="Country" name="country" value={country} onChange={onChange} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign Up
          </Button>
          <Link to="/login" variant="body2">
            {"Already have an account? Sign In"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;