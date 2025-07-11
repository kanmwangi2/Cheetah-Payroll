/**
 * React hook for managing service state with error handling
 */

import { useState } from 'react';
import { ServiceResult, ServiceHookResult } from '../utils/service-wrapper';

/**
 * React hook for managing service state
 */
export function useService<T>(initialState?: T): ServiceHookResult<T> {
  const [state, setState] = useState<ServiceResult<T>>({
    data: initialState,
    loading: false,
    success: false,
  });

  const execute = async (serviceCall: () => Promise<ServiceResult<T>>): Promise<ServiceResult<T>> => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    const result = await serviceCall();
    setState(result);
    
    return result;
  };

  const reset = () => {
    setState({
      data: initialState,
      loading: false,
      success: false,
    });
  };

  return {
    ...state,
    execute,
    reset,
  };
}

export default useService;