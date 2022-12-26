import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';
import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
import Loader from './components/Loader/Loader';
import Room from './pages/Room/Room';


function App() {
  const {loading} = useLoadingWithRefresh()
  // return 
  return (
    loading ? <Loader message={"Loading..."}/> : 
    <div className="App">
      <Navbar />
      <Routes>
        <Route path='/' element={<GuestRoute><Home/></GuestRoute>}/> 
        <Route path='/authenticate' element={<GuestRoute><Authenticate/></GuestRoute>}/>
        <Route path='/activate' element={<SemiProtectedRoute><Activate/></SemiProtectedRoute>}/>
        <Route path='/rooms' element={<ProtectedRoute><Rooms/></ProtectedRoute>}/>
        <Route path='/room/:id' element={<ProtectedRoute><Room/></ProtectedRoute>}/>
      </Routes>
    </div>
  );
}

const GuestRoute = ({children}) => {
  const {isAuth} = useSelector(state => state.authSlice)
  if(isAuth){
    return <Navigate to='/rooms' replace/>
  }
  return children
}

const SemiProtectedRoute = ({children}) => {
  const {isAuth, user} = useSelector(state => state.authSlice)
  if(!isAuth) {
    return <Navigate to='/' replace/>
  }
  if(isAuth && user.activated){
    return <Navigate to='/rooms' replace/>
  }
  return children
}

const ProtectedRoute = ({children}) => {
  const {isAuth, user} = useSelector(state => state.authSlice)
  if(!isAuth) {
    return <Navigate to='/' replace/>
  }
  if(isAuth && !user.activated){
    return <Navigate to='/activate' replace/>
  }
  return children
}

export default App;

