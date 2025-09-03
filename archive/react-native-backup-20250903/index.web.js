import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Web için uygulama kaydı
AppRegistry.registerComponent(appName, () => App);

// Web uygulamasını başlat
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
