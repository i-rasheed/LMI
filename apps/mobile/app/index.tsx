import { Redirect } from 'expo-router';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { useAuthRedirectTarget } from '../src/hooks/useAuthRedirect';

export default function Index() {
  const target = useAuthRedirectTarget();

  if (!target) {
    return <LoadingScreen />;
  }

  return <Redirect href={target} />;
}
