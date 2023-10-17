import { createContext } from 'react';

const SettingContext = createContext({
    theme: {
        colorPrimary: '#00b96b',
    },
    setTheme: (theme: any) => {},
});

export default SettingContext;
