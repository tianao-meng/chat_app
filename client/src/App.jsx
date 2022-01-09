import './App.scss';
import {Container} from 'react-bootstrap'
import Register from './pages/Register'
import ApolloProvider from './ApolloProvider';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Login';
import Home from './pages/home/Home';
import {AuthProvider} from './context/auth';
import {MessageProvider} from './context/message';
import DynamicRoute from './util/DynamicRoute';
function App() {

  return (
  <ApolloProvider>
    <AuthProvider>
      <MessageProvider>
        <BrowserRouter>
          <Container className="pt-5">
            <Routes>
              <Route exact path='/' element={<DynamicRoute authencated><Home/></DynamicRoute>} />
      
              <Route exact path='/register' element={<DynamicRoute guest><Register/></DynamicRoute>}/>
              <Route exact path='/login' element={<DynamicRoute guest><Login/></DynamicRoute>}/>

            </Routes>
          </Container> 
        </BrowserRouter>
      </MessageProvider>
    </AuthProvider>
  </ApolloProvider>
  );
}

export default App;
