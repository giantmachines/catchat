import * as React from 'react';

interface LoginHeaderProps {
  name: string | null;
  loginHandler: () => void;
  logoutHandler: () => void;
}

const LoginHeader = ({name, loginHandler, logoutHandler}: LoginHeaderProps) => (
  <div className="login-header">
    <span className="app-name">CAT CHAT</span>
    <span>
      <span className="login-header-name">{name || 'Please log in'}</span>
      { name ? 
      <button onClick={logoutHandler}>Log out</button> :
      <button onClick={loginHandler}>Log in</button>
      }
    </span>
  </div>
);

export default LoginHeader;
