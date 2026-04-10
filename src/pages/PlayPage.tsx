import { useSearchParams } from 'react-router-dom';
import GamePage from './GamePage';
import { GameMode } from '@/hooks/useGame';

export default function PlayPage() {
  const [searchParams] = useSearchParams();
  
  const mode = (searchParams.get('mode') || 'hotseat') as GameMode;
  const numPlayers = parseInt(searchParams.get('players') || '4');
  const aiParam = searchParams.get('ai') || '';
  const aiPlayerIds = aiParam ? aiParam.split(',').map(Number) : [];

  return (
    <GamePage
      mode={mode}
      numPlayers={numPlayers}
      aiPlayerIds={aiPlayerIds}
    />
  );
}
