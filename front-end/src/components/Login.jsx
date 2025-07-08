import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import stylerr from 'styled-components';
import Logo from '../assets/logoo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import axios from 'axios';
import { loginRoute } from './APIRoutes';

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: '',
    password: '',
  });

  const toastoptions = {
    position: 'bottom-right',
    autoClose: 4000,
    pauseOnHover: true,
    draggable: true,
  };

  // useEffect to navigate if the user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('quizgrid-user');
    if (user) {
      navigate('/'); // Navigate only if user exists
    }
  }, [navigate]);

  const clisubmission = async (event) => {
    event.preventDefault();

    // Validate entry before making the API request
    if (validentry()) {
      try {
        const { password, username } = values;
        const { data } = await axios.post(loginRoute, {
          username,
          password,
        });

        if (data.status === false) {
          toast.error(data.msg, toastoptions);
        } else {
          // Store JWT token and user info in localStorage
          localStorage.setItem('quizgrid-user', JSON.stringify(data.user));
          localStorage.setItem('quizgrid-token', data.token);  // Store JWT token
          setIsLoggedIn(true);  // Update the isLoggedIn state
          navigate("/");  // Redirect to home page after successful login
        }
      } catch (error) {
        console.error("Login error:", error.response?.data || error.message);  // Log the error
        toast.error("Login failed. Please try again later.", toastoptions);
      }
    }
  };

  const validentry = () => {
    const { password, username } = values;
    if (password.length === 0 || username.length === 0) {
      toast.error('Username and Password are required', toastoptions);
      return false;
    } else if (password.length < 8) {
      toast.error('Password should contain at least 8 characters', toastoptions);
      return false;
    }
    return true;
  };

  const textchan = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  return (
    <div>
      <Formfiller>
        <form action='' onSubmit={clisubmission}>
          <div className='brand'>
            <img src={Logo} alt='' />
          </div>
          <input
            type='text'
            placeholder='Username'
            name='username'
            onChange={textchan}
          ></input>
          <input
            type='password'
            placeholder='Password'
            name='password'
            onChange={textchan}
          ></input>
          <button type='submit'>Login</button>
          <span>
            Don't have an account? <Link to='/register'>Register</Link>
          </span>
        </form>
      </Formfiller>
      <ToastContainer />
    </div>
  );
}

const Formfiller = stylerr.div`
height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: white;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 5rem;
      transform: scale(2.1);
      padding-top:0.35rem;
    }
    h1 {
      color: #0F72EA;
      padding-top: 15px;
      text-transform: uppercase;
    }
  }

  form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: rgb(300,300,300);
  border-radius: 2rem;
  padding: 3rem 5rem;
    filter: drop-shadow(-1rem 1rem 1rem rgb(51, 51, 51));
}
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #0F72EA;
    border-radius: 0.4rem;
    color: black;
    width: 100%;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  button {
    background-color: #0F72EA;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #0F72EA; 
    }
  }
  span {
    color: black;
    text-transform: uppercase;
    a {
      color: #0F72EA;
      text-decoration: none;
      font-weight: bold;
    }
  }

`;

export default Login;
