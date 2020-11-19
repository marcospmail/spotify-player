import React from 'react';
import {View, Button} from 'react-native';

import authHandler from '../../utils/authHandler';

const Login: React.FC = () => {
  return (
    <View>
      <Button onPress={() => authHandler.onLogin()} title="Press to login" />
    </View>
  );
};

export default Login;
