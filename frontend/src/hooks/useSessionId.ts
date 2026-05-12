import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useSessionId = () => {
  const [sessionId] = useState(() => uuidv4());
  return sessionId;
};
