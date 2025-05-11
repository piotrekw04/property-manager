import { useState } from 'react';
import { Tab, Tabs, Box } from '@mui/material';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import '../css/UserPanel.css';

export default function UserPanel() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <div className="user-panel-container">
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
      >
        <Tab label="Profil" />
        <Tab label="Zmiana hasła" />
      </Tabs>

      <Box mt={3}>
        {tabValue === 0 && <UserProfile />}
        {tabValue === 1 && <ChangePassword />}
      </Box>
    </div>
  );
}
