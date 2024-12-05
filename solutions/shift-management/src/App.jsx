import './App.css'
import { TabPane, Tab } from 'semantic-ui-react'

import { ApiProvider } from './ApiContext';
import MyShifts from './components/MyShifts';
import AvailShifts from './components/AvailShifts';

function App() {
    const panes = [
        {
          menuItem: 'My shifts',
          render: () => <TabPane attached={false}><MyShifts/></TabPane>,
        },
        {
          menuItem: 'Available shifts',
          render: () => <TabPane attached={false}><AvailShifts/></TabPane>,
        }
    ]
      
    return (
    <div className='main-tab'>
        <ApiProvider>
        <Tab menu={{ color:'blue', text: true, font:'big', style: { fontSize: '20px' } }} panes={panes} defaultActiveIndex={0}/>
        </ApiProvider>
    </div>
    )
}

export default App
