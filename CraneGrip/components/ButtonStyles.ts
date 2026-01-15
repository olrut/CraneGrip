import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { radius, space } from '@/constants/Theme';

const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.dark.confirmButton,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.selector,
  },
  danger: {
    backgroundColor: Colors.dark.resetButton,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutral: {
    backgroundColor: Colors.dark.connected,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default buttonStyles;

