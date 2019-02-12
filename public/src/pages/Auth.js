import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component{

  state = {
    isLogIn : true
  }
  constructor(props){
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  static contextType = AuthContext;
  
  switchModeHandler = () => {
    this.setState(prevState => {
      return {isLogIn: !prevState.isLogIn}
    })
  }

  submitHandler = (event) => {
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;
    if(!email.trim().length|| !password.trim().length){
      return;
    }
    
    let requestBody = {
      query : `
        query Login($email: String!, $password: String!){
          login(email: $email, password: $password){
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    };
    if (!this.state.isLogIn) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}){
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password
        }
      };
    }
    console.log(email, password, requestBody)

    fetch('http://localhost:9000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type' : 'application/json'
      }
    })
    .then( res =>{
      if(res.status !== 200 && res.status !== 201){
        throw new Error('Failed');
      }
      return res.json();
    })
    .then( resData => {
      if(resData.data.login.token){
        this.context.login(
          resData.data.login.token, 
          resData.data.login.userId, 
          resData.data.login.tokenExpiration
          )
      }
    })
    .catch(err =>{
      console.log(err);
    });
  };

  render(){
    return <form className="auth-form" onSubmit={this.submitHandler}>
      <div className="form-control">
        <label htmlFor="email">E-mail</label>
        <input type="email" id="email" ref={this.emailEl}/>
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" ref={this.passwordEl}/>
      </div>
      <div className="form-actions">
        <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogIn ? 'SignUp' : 'LogIn'}</button> 
        <button type="submit">{this.state.isLogIn ? 'Login': 'SignUp'}</button>
      </div>
    </form>;
  }
}

export default AuthPage;