
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm 
          isRegisterMode={isRegisterMode}
          onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
        />
      </div>
    </div>
  );
};

export default Login;
