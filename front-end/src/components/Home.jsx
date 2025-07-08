import React ,{ useState,useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import stylerr from "styled-components"
import Logo from"../assets/logoo.png"
import {ToastContainer,toast} from "react-toastify"
import "react-toastify/ReactToastify.css"
import axios from "axios";
import { registerRoute } from './APIRoutes';
function Home() {


    const navigate = useNavigate()
    const[values,setvalues]=useState({
        username:"",
        email:"",
        password:"",
        confirmpassword:"",
    })


    const toastoptions={
        position: "bottom-right",
        autoclose: 4000,
        pauseOnHover: true,
        draggable: true,
    }

    useEffect(()=>{
        if(localStorage.getItem("quizgrid-user"))
            navigate('/')
          else
          navigate('/login')
    })

    const clisubmission= async(event)=>{
        event.preventDefault();
        if(validentry()){
            // console.log("in Validation",registerRoute);
            const { password,username,email}=values;
            const {data}= await axios.post(registerRoute,{
                username,
                email,
                password,
            });
            if(data.status === false){
                toast.error(data.msg,toastoptions);
                console.log(data.msg);
            }
            if(data.status === true){
                localStorage.setItem("quizgrid-user",JSON.stringify(data.user))
                navigate("/");
            }
           
        }
    };


 

    const validentry= ()=>{
        const { password,confirmpassword,username,email}=values;
        if(password!==confirmpassword){
            toast.error("Password and Confirm Password are not same",toastoptions);
            return false;
        }
        else if(username.length<4){
            toast.error("Username should contain atleast 4 letters",toastoptions);
            return false;
        }
        else if(password.length<8){
            toast.error("Password should contain atleast 8 letters",toastoptions);
            return false;
        }
        else if(email.length<11){
            toast.error("Enter valid E-Mail",toastoptions);
            return false;
        }
        else if(email.length>=11){
            const lastmail=email.substring(email.length-10,email.length);
            // console.log(`${lastmail}`);
            if(lastmail !="@gmail.com"){
                toast.error("Enter valid E-Mail",toastoptions);
                return false;
            }
        }
        return true;

    };

    const creater=(event)=>{
        setvalues({...values,[event.target.name]:event.target.value})
    };
  return (
     <div>

        <div className="brand">
            <img src={Logo} alt="" />
        </div>
        <button onClick={creater}>Create Room</button>
    <ToastContainer/>
     </div>
  )
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

export default Home