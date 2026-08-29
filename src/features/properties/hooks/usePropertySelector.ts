import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../services/propertyService';

export const usePropertySelector = () => {
  return useQuery({
    queryKey: ['properties', 'selector'],
    queryFn: () => propertyService.getPropertySelector(),
    staleTime: 10 * 60 * 1000, // 10 minutes in-memory cache
    gcTime: 30 * 60 * 1000,
  });
};
