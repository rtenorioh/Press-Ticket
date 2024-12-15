import getDarkTheme from './darkTheme';
import getLightTheme from './lightTheme';

const loadThemeConfig = (theme, config, locale) => {
    return theme === 'light' ? getLightTheme(config, locale) : getDarkTheme(config, locale);
};

export default loadThemeConfig;
